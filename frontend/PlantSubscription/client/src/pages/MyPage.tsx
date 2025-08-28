import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { User, Settings, CreditCard, Package, Calendar, Leaf } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">마이페이지를 이용하려면 로그인해주세요.</p>
            <Link href="/login">
              <Button className="bg-forest text-white hover:bg-forest/90">
                로그인하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-forest hover:text-forest/90 transition-colors duration-200" data-testid="logo">
              식구
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/subscription" className="text-gray-700 hover:text-forest transition-colors duration-200 font-medium" data-testid="link-subscription">
                구독
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-forest transition-colors duration-200 font-medium" data-testid="link-how-it-works">
                이용가이드
              </Link>
              <Link href="/mypage" className="text-forest font-medium" data-testid="link-mypage">
                마이페이지
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="mypage-title">
            마이페이지
          </h1>
          <p className="text-gray-600" data-testid="mypage-subtitle">
            {user?.username}님의 계정 정보와 구독 상태를 관리할 수 있습니다.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>내 정보</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>구독 관리</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>설정</span>
            </TabsTrigger>
          </TabsList>

          {/* 내 정보 탭 */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>계정 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">아이디</label>
                    <p className="text-gray-900 font-medium mt-1">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">가입일</label>
                    <p className="text-gray-900 font-medium mt-1">2024년 8월</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                    정보 수정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 구독 관리 탭 */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>현재 구독 상태</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">구독 중인 플랜이 없습니다</h3>
                  <p className="text-gray-600 mb-6">지금 구독을 시작하고 멋진 식물들을 만나보세요!</p>
                  <Link href="/subscription">
                    <Button className="bg-forest text-white hover:bg-forest/90">
                      구독 시작하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 구독 히스토리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>구독 히스토리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">구독 이력이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설정 탭 */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>계정 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">비밀번호 변경</h4>
                    <p className="text-sm text-gray-600">계정 보안을 위해 정기적으로 비밀번호를 변경하세요.</p>
                  </div>
                  <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                    변경
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">알림 설정</h4>
                    <p className="text-sm text-gray-600">식물 관리 알림 및 구독 정보를 받아보세요.</p>
                  </div>
                  <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                    설정
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-900">계정 삭제</h4>
                      <p className="text-sm text-red-600">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
                    </div>
                    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}