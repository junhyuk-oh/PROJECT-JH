'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  // Firebase가 설정되지 않은 경우 빈 컴포넌트 반환
  try {
    const { user, loading } = useAuth();
    const { toast } = useToast();

    const handleSignOut = async () => {
      if (!auth) {
        toast({
          title: "오류",
          description: "Firebase 설정이 완료되지 않았습니다.",
          variant: "destructive",
        });
        return;
      }

      try {
        await signOut(auth);
        toast({
          title: "로그아웃 완료",
          description: "안전하게 로그아웃되었습니다.",
        });
      } catch (error: any) {
        toast({
          title: "로그아웃 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">로딩 중...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // 로그인하지 않은 경우 아무것도 표시하지 않음
    }
  } catch (error) {
    // Firebase 오류 시 빈 컴포넌트 반환
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">사용자 정보</CardTitle>
          <CardDescription className="text-center">
            로그인된 계정 정보입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || '사용자'} />
              <AvatarFallback>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName || '이름 없음'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">로그인 방법:</span>
              <span className="text-sm text-muted-foreground">
                {user.providerData[0]?.providerId === 'google.com' ? '구글' : '이메일'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">계정 생성일:</span>
              <span className="text-sm text-muted-foreground">
                {user.metadata.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString('ko-KR') : 
                  '알 수 없음'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">마지막 로그인:</span>
              <span className="text-sm text-muted-foreground">
                {user.metadata.lastSignInTime ? 
                  new Date(user.metadata.lastSignInTime).toLocaleDateString('ko-KR') : 
                  '알 수 없음'
                }
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full"
          >
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 