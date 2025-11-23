import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Leaf, Edit2, Save, X, User, CreditCard, ShoppingBag, Package } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: number;
  email: string;
  address: string | null;
  phoneNumber: string | null;
  coins: number;
  subscriptions?: Subscription[];
}

interface Subscription {
  id: number;
  planId: number;
  paidAmount: number;
  paymentStatus: string;
  startDate: string;
  endDate: string | null;
  userEmail: string;
}

interface OrderItem {
  plantName: string;
  quantity: number;
  priceAtPurchase: number;
}

interface OrderHistory {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

interface OrderCancelResponse {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function MyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    address: "",
    phoneNumber: "",
  });
  const [phoneError, setPhoneError] = useState<string>("");
  const queryClient = useQueryClient();

  // URL에서 tab 파라미터 읽기
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // 주문 내역 조회
  const { data: orders, isLoading: ordersLoading } = useQuery<OrderHistory[]>({
    queryKey: ['/orders'],
    enabled: isAuthenticated,
  });

  // 구독 취소 mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      return await apiRequest('POST', `/subscriptions/${subscriptionId}/cancellation`);
    },
    onSuccess: async () => {
      // 프로필 정보 다시 가져오기
      try {
        const response = await apiRequest("GET", "/users/mypage");
        const data = await response.json();
        
        setProfile({
          id: data.id,
          email: data.email,
          address: data.address,
          phoneNumber: data.phoneNumber,
          coins: data.coins || 0,
          subscriptions: data.subscriptions || [],
        });
      } catch (error) {
        console.error("프로필 정보 갱신 실패:", error);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
      toast({
        title: "구독이 취소되었습니다",
        description: "구독이 성공적으로 취소되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "구독 취소 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  // 주문 취소 mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiRequest('DELETE', `/orders/${orderId}`);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/orders'] });
      toast({
        title: "주문이 취소되었습니다",
        description: "주문이 성공적으로 취소되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "주문 취소 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "로그인 필요",
        description: "마이페이지는 로그인 후 이용 가능합니다.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation, toast]);

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // /users/mypage API를 호출하여 최신 사용자 정보 가져오기
        const response = await apiRequest("GET", "/users/mypage");
        const data = await response.json();
        
        setProfile({
          id: data.id,
          email: data.email,
          address: data.address,
          phoneNumber: data.phoneNumber,
          coins: data.coins || 0,
          subscriptions: data.subscriptions || [],
        });
        setEditForm({
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
        });
      } catch (error) {
        console.error("프로필 정보를 가져오는데 실패했습니다:", error);
        // fallback to user context
        setProfile({
          id: parseInt(user.id),
          email: user.username,
          address: user.address,
          phoneNumber: user.phone,
          coins: user.coins || 0,
          subscriptions: [],
        });
        setEditForm({
          address: user.address || "",
          phoneNumber: user.phone || "",
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 숫자가 아닌 문자가 포함되어 있는지 확인
    if (value && !/^\d*$/.test(value)) {
      setPhoneError("숫자만 입력해주세요");
      return;
    }
    
    setEditForm({ ...editForm, phoneNumber: value });
    
    // 유효성 검사
    if (value === "") {
      setPhoneError("");
      return;
    }
    
    const length = value.length;
    
    // 12자리 이상인 경우
    if (length > 11) {
      setPhoneError("전화번호는 최대 11자리까지 입력 가능합니다");
      return;
    }
    
    // 010으로 시작하는 경우
    if (value.startsWith("010")) {
      if (length < 11) {
        setPhoneError("010으로 시작하는 번호는 11자리여야 합니다");
      } else if (length === 11) {
        setPhoneError("");
      }
    } else {
      // 010이 아닌 경우
      if (length < 10) {
        setPhoneError("전화번호는 10자리 또는 11자리여야 합니다");
      } else if (length === 10 || length === 11) {
        setPhoneError("");
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setPhoneError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhoneError("");
    if (profile) {
      setEditForm({
        address: profile.address || "",
        phoneNumber: profile.phoneNumber || "",
      });
    }
  };

  const handleSave = async () => {
    // 전화번호 유효성 검사
    if (editForm.phoneNumber) {
      const phoneNumber = editForm.phoneNumber;
      const length = phoneNumber.length;
      
      // 숫자가 아닌 문자 체크
      if (!/^\d+$/.test(phoneNumber)) {
        toast({
          title: "입력 오류",
          description: "전화번호는 숫자만 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      // 길이 체크
      if (length > 11) {
        toast({
          title: "입력 오류",
          description: "전화번호는 최대 11자리까지 입력 가능합니다.",
          variant: "destructive",
        });
        return;
      }
      
      // 010으로 시작하는 경우 11자리 체크
      if (phoneNumber.startsWith("010") && length !== 11) {
        toast({
          title: "입력 오류",
          description: "010으로 시작하는 번호는 11자리여야 합니다.",
          variant: "destructive",
        });
        return;
      }
      
      // 010이 아닌 경우 10자리 또는 11자리 체크
      if (!phoneNumber.startsWith("010") && length !== 10 && length !== 11) {
        toast({
          title: "입력 오류",
          description: "전화번호는 10자리 또는 11자리여야 합니다.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      const response = await apiRequest("POST", "/users/info", {
        method: "POST",
        body: JSON.stringify({
          address: editForm.address,
          phoneNumber: editForm.phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("정보 업데이트에 실패했습니다.");
      }

      const updatedData = await response.json();

      // 프로필 상태 업데이트
      setProfile({
        ...profile!,
        address: updatedData.address || editForm.address,
        phoneNumber: updatedData.phoneNumber || editForm.phoneNumber,
      });

      setIsEditing(false);
      toast({
        title: "저장 완료",
        description: "사용자 정보가 업데이트되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "저장 실패",
        description: error.message || "정보 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Leaf className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">프로필 정보를 불러올 수 없습니다.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              마이페이지
            </CardTitle>
            <p className="text-gray-600 mt-2">회원 정보 관리</p>
          </CardHeader>

          <CardContent className="pt-8">
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setLocation(`?tab=${value}`);
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">프로필 정보</TabsTrigger>
                <TabsTrigger value="subscription">구독 관리</TabsTrigger>
                <TabsTrigger value="orders">주문내역</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      프로필 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 이메일 (수정 불가) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          이메일
                        </Label>
                        <Input
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
                      </div>

                      {/* 주소 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          주소
                        </Label>
                        <Input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          disabled={!isEditing}
                          placeholder="주소를 입력하세요"
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>

                      {/* 전화번호 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          전화번호
                        </Label>
                        <Input
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={handlePhoneNumberChange}
                          disabled={!isEditing}
                          placeholder="전화번호를 입력하세요 (숫자만)"
                          className={!isEditing ? "bg-gray-50" : ""}
                          maxLength={11}
                        />
                        {isEditing && phoneError && (
                          <p className="text-xs text-red-500">{phoneError}</p>
                        )}
                        {isEditing && !phoneError && editForm.phoneNumber && (
                          <p className="text-xs text-green-600">올바른 전화번호 형식입니다</p>
                        )}
                      </div>

                      {/* 버튼 그룹 */}
                      <div className="flex gap-4 pt-4">
                        {!isEditing ? (
                          <Button
                            onClick={handleEdit}
                            className="flex-1 bg-forest text-white hover:bg-forest/90"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            정보 수정
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleSave}
                              className="flex-1 bg-forest text-white hover:bg-forest/90"
                              disabled={!!phoneError}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              저장
                            </Button>
                            <Button
                              onClick={handleCancel}
                              variant="outline"
                              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                              <X className="h-4 w-4 mr-2" />
                              취소
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      구독 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <p className="font-semibold">현재 보유 코인</p>
                          <p className="text-2xl font-bold text-forest mt-1">{profile?.coins || 0} 코인</p>
                        </div>
                        <Link href="/subscription">
                          <Button className="bg-forest text-white hover:bg-forest/90">
                            코인 충전하기
                          </Button>
                        </Link>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">구독 내역</p>
                        {profile?.subscriptions && profile.subscriptions.length > 0 ? (
                          <div className="space-y-3">
                            {profile.subscriptions.map((subscription: Subscription) => {
                              const getPlanName = (planId: number) => {
                                const coinMap: { [key: number]: number } = {
                                  1: 1,
                                  2: 2,
                                  3: 5,
                                  4: 10
                                };
                                const coins = coinMap[planId] || planId;
                                return `${coins}코인 플랜`;
                              };

                              const isCancelled = subscription.paymentStatus === 'CANCELLED' || 
                                                 subscription.paymentStatus === 'CANCELED_AT_PERIOD_END';

                              return (
                                <div key={subscription.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold">{getPlanName(subscription.planId)}</p>
                                      <p className="text-sm text-gray-600">결제 금액: {subscription.paidAmount}원</p>
                                      <p className="text-sm text-gray-600">
                                        구독 시작: {new Date(subscription.startDate).toLocaleDateString()}
                                      </p>
                                      {subscription.endDate && (
                                        <p className="text-sm text-gray-600">
                                          구독 종료: {new Date(subscription.endDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    {isCancelled ? (
                                      <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm font-medium">
                                        구독 취소됨
                                      </div>
                                    ) : (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            구독 취소
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>구독을 취소하시겠습니까?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              이 작업은 되돌릴 수 없습니다. 구독을 취소하면 해당 플랜의 혜택을 더 이상 받을 수 없습니다.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>취소</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => cancelSubscriptionMutation.mutate(subscription.id)}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              구독 취소
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500">구독 내역이 없습니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      주문내역
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Leaf className="h-8 w-8 text-green-600 animate-pulse mr-2" />
                        <p className="text-gray-600">주문 내역을 불러오는 중...</p>
                      </div>
                    ) : orders && orders?.length > 0 ? (
                      <div className="space-y-4">
                        {orders?.map((order) => (
                          <div key={order.orderId} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-semibold text-lg">주문 #{order.orderId}</p>
                                <p className="text-sm text-gray-600">
                                  주문 날짜: {new Date(order.orderDate).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status === 'PENDING' ? '처리 중' :
                                 order.status === 'COMPLETED' ? '완료' :
                                 order.status === 'CANCELLED' ? '주문 취소됨' :
                                 order.status}
                              </span>
                            </div>

                            <div className="border-t pt-3 mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                주문 항목
                              </p>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                                    <div>
                                      <p className="font-medium">{item.plantName}</p>
                                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                                    </div>
                                    <p className="font-semibold text-forest">
                                      {item.priceAtPurchase * item.quantity} 코인
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold">총 결제 금액</p>
                                <p className="text-xl font-bold text-forest">{order.totalAmount} 코인</p>
                              </div>
                              {order.status !== 'CANCELLED' ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                    >
                                      주문 취소
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>주문을 취소하시겠습니까?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        이 작업은 되돌릴 수 없습니다. 주문을 취소하면 사용한 코인이 환불됩니다.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>취소</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => cancelOrderMutation.mutate(order.orderId)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        주문 취소
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <div className="w-full py-2 text-center bg-gray-100 text-gray-600 rounded font-medium">
                                  주문 취소됨
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">주문 내역이 없습니다</p>
                        <p className="text-sm text-gray-400">코인으로 식물을 구매하면 여기에 표시됩니다</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}