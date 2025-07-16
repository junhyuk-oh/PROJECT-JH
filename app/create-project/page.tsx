import SimpleProjectFlow from '@/components/SimpleProjectFlow';

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <SimpleProjectFlow 
        onComplete={(projectData) => {
          console.log('프로젝트 생성 완료:', projectData);
          // 완료 후 처리 로직
        }}
      />
    </div>
  );
}