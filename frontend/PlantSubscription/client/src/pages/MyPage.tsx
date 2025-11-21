import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link, useLocation } from "wouter";
import { User, Settings, CreditCard, Package, Calendar, Leaf, MapPin, Phone, ShoppingBag, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { Order, Subscription } from "@shared/schema";

export default function MyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const queryClient = useQueryClient();

  // URL에서 탭 파라미터 가져오기
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const defaultTab = urlParams.get('tab') || 'profile';

  const [selectedTab, setSelectedTab] = useState(defaultTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ address: '', phone: '' });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // 주문 내역 가져오기
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  // 구독 내역 가져오기
  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['/api/subscriptions'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        address: user.address || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  // 프로필 업데이트 mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { address: string; phone: string }) => {
      return await apiRequest('PATCH', '/api/user/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "프로필 업데이트 완료",
        description: "배송 정보가 성공적으로 업데이트되었습니다.",
      });
      setIsEditingProfile(false);
    },
    onError: () => {
      toast({
        title: "프로필 업데이트 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  // 비밀번호 변경 mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest('PATCH', '/api/user/password', data);
    },
    onSuccess: () => {
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "알 수 없는 오류가 발생했습니다.";
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes("현재 비밀번호") || errorMessage.includes("incorrect")) {
        userFriendlyMessage = "현재 비밀번호가 올바르지 않습니다. 다시 확인해주세요.";
      } else if (errorMessage.includes("동일") || errorMessage.includes("same")) {
        userFriendlyMessage = "새 비밀번호는 현재 비밀번호와 달라야 합니다.";
      } else if (errorMessage.includes("8자")) {
        userFriendlyMessage = "비밀번호는 8자 이상이어야 합니다.";
      }
      
      toast({
        title: "비밀번호 변경 실패",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    },
  });

  // 구독 해지 mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      return await apiRequest('PATCH', `/api/subscriptions/${subscriptionId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "구독 해지 완료",
        description: "구독이 해지되었습니다. 만료일까지 서비스를 이용할 수 있습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "구독 해지 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "비밀번호 오류",
        description: "새 비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: "비밀번호 오류",
        description: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

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

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span>내 정보</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2" data-testid="tab-orders">
              <ShoppingBag className="h-4 w-4" />
              <span>결제한 상품</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2" data-testid="tab-subscription">
              <Package className="h-4 w-4" />
              <span>구독 관리</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2" data-testid="tab-settings">
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
                    <label className="text-sm font-medium text-gray-700">보유 코인</label>
                    <p className="text-forest font-bold text-lg mt-1">{user?.coins} 코인</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>배송 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingProfile ? (
                  <>
                    <div>
                      <Label htmlFor="address">주소</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="배송받을 주소를 입력하세요"
                        data-testid="input-address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">전화번호</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="전화번호를 입력하세요"
                        data-testid="input-phone"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleProfileUpdate} 
                        disabled={updateProfileMutation.isPending}
                        className="bg-forest text-white hover:bg-forest/90"
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            address: user?.address || '',
                            phone: user?.phone || '',
                          });
                        }}
                        data-testid="button-cancel-edit"
                      >
                        취소
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">주소</label>
                      <p className="text-gray-900 mt-1" data-testid="display-address">
                        {user?.address || '주소가 등록되지 않았습니다.'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">전화번호</label>
                      <p className="text-gray-900 mt-1" data-testid="display-phone">
                        {user?.phone || '전화번호가 등록되지 않았습니다.'}
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="border-forest text-forest hover:bg-forest hover:text-white"
                        onClick={() => setIsEditingProfile(true)}
                        data-testid="button-edit-profile"
                      >
                        정보 수정
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 결제한 상품 탭 */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>결제한 식물</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">결제한 식물이 없습니다</h3>
                    <p className="text-gray-600 mb-6">지금 식물을 구매하고 초록 생활을 시작해보세요!</p>
                    <Link href="/">
                      <Button className="bg-forest text-white hover:bg-forest/90">
                        식물 둘러보기
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900" data-testid={`order-plant-name-${order.id}`}>{order.plantName}</h4>
                            <p className="text-sm text-gray-600">{order.size} 식물 x {order.quantity}</p>
                            <p className="text-sm text-forest font-medium mt-1">{order.coinsUsed} 코인</p>
                          </div>
                          <div className="text-right">
                            <Badge className={order.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {order.status === 'active' ? '활성' : '종료'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-2">
                              {format(new Date(order.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 구독 관리 탭 */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>구독 중인 플랜</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">구독 중인 플랜이 없습니다</h3>
                    <p className="text-gray-600 mb-6">지금 구독을 시작하고 코인을 충전하세요!</p>
                    <Link href="/subscription">
                      <Button className="bg-forest text-white hover:bg-forest/90">
                        구독 플랜 보기
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((sub: any) => {
                      const isActive = sub.autoRenew === 1 && (!sub.expiresAt || new Date(sub.expiresAt) > new Date());
                      const isCanceled = sub.canceledAt !== null;
                      const daysLeft = sub.expiresAt ? differenceInDays(new Date(sub.expiresAt), new Date()) : 0;

                      return (
                        <div key={sub.id} className="border rounded-lg p-4" data-testid={`subscription-${sub.id}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{sub.planName}</h4>
                              <p className="text-sm text-gray-600">+{sub.coinsReceived} 코인</p>
                              <p className="text-sm text-gray-500 mt-1">₩{sub.amount.toLocaleString()}</p>
                              {sub.expiresAt && (
                                <div className="mt-2 space-y-1 text-xs text-gray-600">
                                  <p>구독 시작: {format(new Date(sub.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}</p>
                                  <p>만료일: {format(new Date(sub.expiresAt), 'yyyy년 MM월 dd일', { locale: ko })} ({daysLeft}일 남음)</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right flex flex-col items-end space-y-2">
                              <Badge className={isActive && !isCanceled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                {isCanceled ? '해지 예정' : isActive ? '활성' : '만료'}
                              </Badge>
                              {isActive && !isCanceled && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                      data-testid={`button-cancel-subscription-${sub.id}`}
                                    >
                                      구독 해지
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>구독을 해지하시겠습니까?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        구독을 해지하시면 만료일({format(new Date(sub.expiresAt), 'yyyy년 MM월 dd일', { locale: ko })})까지 서비스를 이용할 수 있으며, 이후 자동 갱신되지 않습니다.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>취소</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => cancelSubscriptionMutation.mutate(sub.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        해지하기
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-forest text-forest hover:bg-forest hover:text-white"
                        data-testid="button-change-password"
                      >
                        변경
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>비밀번호 변경</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="current-password">현재 비밀번호</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            data-testid="input-current-password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">새 비밀번호</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            data-testid="input-new-password"
                          />
                          {passwordData.newPassword && (
                            <div className="space-y-1 mt-1">
                              {passwordData.newPassword.length < 8 ? (
                                <div className="text-red-500 text-xs flex items-center">
                                  <X className="h-3 w-3 mr-1" />
                                  비밀번호는 8자 이상이어야 합니다.
                                </div>
                              ) : (
                                <div className="text-green-500 text-xs flex items-center">
                                  <Check className="h-3 w-3 mr-1" />
                                  8자 이상
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            data-testid="input-confirm-password"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handlePasswordChange}
                          disabled={
                            changePasswordMutation.isPending || 
                            passwordData.newPassword.length < 8
                          }
                          className="bg-forest text-white hover:bg-forest/90"
                          data-testid="button-submit-password"
                        >
                          {changePasswordMutation.isPending ? "변경 중..." : "변경하기"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}