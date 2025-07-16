// 🔥 Firebase Firestore 커스텀 훅

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  onSnapshot, 
  query, 
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  DocumentReference,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProjectData, GeneratedSchedule, UserProfile } from '@/lib/types';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로젝트 저장/업데이트
  const saveProject = useCallback(async (projectData: Partial<ProjectData>): Promise<string> => {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    setLoading(true);
    setError(null);
    
    try {
      let projectRef: DocumentReference;
      
      if (projectData.id) {
        // 기존 프로젝트 업데이트
        projectRef = doc(db, 'projects', projectData.id);
        await updateDoc(projectRef, {
          ...projectData,
          updatedAt: serverTimestamp()
        });
      } else {
        // 새 프로젝트 생성
        projectRef = await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'draft'
        });
      }
      
      console.log('✅ 프로젝트 저장 완료:', projectRef.id);
      return projectRef.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '프로젝트 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('❌ 프로젝트 저장 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 프로젝트 불러오기
  const getProject = useCallback(async (projectId: string): Promise<ProjectData | null> => {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    setLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        return {
          id: projectSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as ProjectData;
      } else {
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '프로젝트 불러오기 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('❌ 프로젝트 불러오기 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 실시간 프로젝트 구독
  const subscribeToProject = useCallback((
    projectId: string, 
    onUpdate: (project: ProjectData | null) => void
  ): (() => void) => {
    if (!db) {
      console.warn('Firebase가 초기화되지 않았습니다.');
      return () => {};
    }

    const projectRef = doc(db, 'projects', projectId);
    
    const unsubscribe = onSnapshot(
      projectRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const project: ProjectData = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as ProjectData;
          onUpdate(project);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        console.error('❌ 프로젝트 실시간 구독 오류:', err);
        setError(err.message);
      }
    );

    return unsubscribe;
  }, []);

  // 생성된 일정 구독
  const subscribeToSchedule = useCallback((
    projectId: string,
    onUpdate: (schedule: GeneratedSchedule | null) => void
  ): (() => void) => {
    if (!db) {
      console.warn('Firebase가 초기화되지 않았습니다.');
      return () => {};
    }

    const scheduleRef = doc(db, 'schedules', projectId);
    
    const unsubscribe = onSnapshot(
      scheduleRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const schedule: GeneratedSchedule = {
            id: doc.id,
            ...data,
            generatedAt: data.generatedAt?.toDate()
          } as GeneratedSchedule;
          onUpdate(schedule);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        console.error('❌ 일정 실시간 구독 오류:', err);
        setError(err.message);
      }
    );

    return unsubscribe;
  }, []);

  // 사용자 프로젝트 목록 가져오기
  const getUserProjects = useCallback(async (userId: string): Promise<ProjectData[]> => {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    setLoading(true);
    setError(null);

    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      // 실시간이 아닌 일회성 조회를 위해 getDocs 사용
      const { getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(projectsQuery);
      
      const projects: ProjectData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as ProjectData);
      });

      return projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '프로젝트 목록 불러오기 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('❌ 사용자 프로젝트 목록 불러오기 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 작업 진행률 업데이트
  const updateTaskProgress = useCallback(async (
    projectId: string, 
    taskId: string, 
    progress: number
  ): Promise<void> => {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    try {
      const scheduleRef = doc(db, 'schedules', projectId);
      const scheduleSnap = await getDoc(scheduleRef);
      
      if (scheduleSnap.exists()) {
        const scheduleData = scheduleSnap.data();
        const updatedTasks = scheduleData.tasks.map((task: any) => 
          task.id === taskId ? { ...task, progress } : task
        );
        
        await updateDoc(scheduleRef, {
          tasks: updatedTasks,
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ 작업 ${taskId} 진행률 ${progress}%로 업데이트 완료`);
      }
    } catch (err) {
      console.error('❌ 작업 진행률 업데이트 실패:', err);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    saveProject,
    getProject,
    subscribeToProject,
    subscribeToSchedule,
    getUserProjects,
    updateTaskProgress
  };
};

// 🎯 프로젝트 단계별 저장을 위한 전용 훅
export const useProjectStepper = (userId: string) => {
  const [currentProject, setCurrentProject] = useState<Partial<ProjectData>>({
    userId,
    status: 'draft'
  });
  const [projectId, setProjectId] = useState<string | null>(null);
  const { saveProject, subscribeToProject } = useFirestore();

  // 단계별 데이터 업데이트
  const updateStep = useCallback(async (stepData: Partial<ProjectData>) => {
    const updatedProject = {
      ...currentProject,
      ...stepData,
      id: projectId || undefined
    };
    
    try {
      const savedProjectId = await saveProject(updatedProject);
      setProjectId(savedProjectId);
      setCurrentProject(updatedProject);
      
      console.log('📝 프로젝트 단계 업데이트 완료:', updatedProject);
      return savedProjectId;
    } catch (error) {
      console.error('❌ 프로젝트 단계 업데이트 실패:', error);
      throw error;
    }
  }, [currentProject, projectId, saveProject]);

  // 프로젝트 초기화
  const resetProject = useCallback(() => {
    setCurrentProject({ userId, status: 'draft' });
    setProjectId(null);
  }, [userId]);

  return {
    currentProject,
    projectId,
    updateStep,
    resetProject
  };
};