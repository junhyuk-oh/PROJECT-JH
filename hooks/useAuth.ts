import { useState, useEffect, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 프로필 생성/업데이트
  const createUserProfile = useCallback(async (user: User): Promise<UserProfile> => {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let profile: UserProfile;

    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
    } else {
      profile = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '사용자',
        avatar: user.photoURL || undefined,
        preferences: {
          notifications: true,
          defaultStyle: 'modern',
          language: 'ko',
          timezone: 'Asia/Seoul'
        },
        projects: [],
        createdAt: new Date()
      };

      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp()
      });
    }

    return profile;
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          const profile = await createUserProfile(user);
          setUserProfile(profile);
          console.log('✅ 사용자 로그인:', user.email);
        } else {
          setUser(null);
          setUserProfile(null);
          console.log('👋 사용자 로그아웃');
        }
      } catch (err) {
        console.error('❌ 인증 상태 처리 오류:', err);
        setError(err instanceof Error ? err.message : '인증 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [createUserProfile]);

  // 이메일/비밀번호 로그인
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ 이메일 로그인 성공:', email);
      return result.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Google 로그인
  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google 로그인 성공:', result.user.email);
      return result.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google 로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    try {
      await signOut(auth);
      console.log('👋 로그아웃 완료');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    user,
    userProfile,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user
  };
} 