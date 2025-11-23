import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const planDetails = {
  1: { title: "1코인", price: "4,900원", value: 4900, coins: 1 },
  2: { title: "2코인", price: "9,900원", value: 9900, coins: 2 },
  3: { title: "5코인", price: "23,900원", value: 23900, coins: 5 },
  4: { title: "10코인", price: "44,900원", value: 44900, coins: 10 }
};

export default function Payment() {
  const [location, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof planDetails | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const validateForm = () => {
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvc || !formData.cardholderName) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    // Basic validation for card number format (e.g., 16 digits, optionally with spaces)
    if (!/^\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      toast({
        title: "카드 번호 오류",
        description: "올바른 카드 번호를 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    // Basic validation for expiry date format (e.g., MM/YY)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      toast({
        title: "유효기간 오류",
        description: "유효기간을 MM/YY 형식으로 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    // Basic validation for CVC (e.g., 3 or 4 digits)
    if (!/^\d{3,4}$/.test(formData.cvc)) {
      toast({
        title: "CVC 오류",
        description: "올바른 CVC를 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan) {
      const planNumber = Number(plan);
      if (planNumber in planDetails) {
        setSelectedPlan(planNumber as keyof typeof planDetails);
      }
    }
  }, [location]);

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { planId: keyof typeof planDetails | null; cardNumber: string; expirationDate: string; cvc: string; cardHolderName: string; }) => {
      return await apiRequest('POST', '/subscriptions', data);
    },
    onSuccess: async (data) => {
      // 사용자 정보와 구독 정보 새로고침
      await queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
      await queryClient.invalidateQueries({ queryKey: ['/subscriptions'] });
      
      toast({
        title: "결제가 완료되었습니다!",
        description: "코인이 충전되었습니다.",
      });
      navigate('/mypage?tab=subscription');
    },
    onError: (error: any) => {
      toast({
        title: "결제 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handlePaymentClick = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) return;

    if (!validateForm()) {
      return;
    }

    createSubscriptionMutation.mutate({
      planId: selectedPlan,
      cardNumber: formData.cardNumber.replace(/\D/g, ''), // Remove non-digit characters
      expirationDate: formData.expiryDate,
      cvc: formData.cvc,
      cardHolderName: formData.cardholderName
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-soft">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-soft">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
            <p className="text-gray-600 mb-6">결제를 진행하려면 로그인해주세요.</p>
            <Link href="/login">
              <Button className="bg-forest text-white hover:bg-forest/90">
                로그인하기
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-bg-soft">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">잘못된 플랜 정보입니다</h1>
            <Link href="/subscription">
              <Button className="bg-forest text-white hover:bg-forest/90">
                구독 페이지로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const plan = planDetails[selectedPlan];

  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/subscription" className="inline-flex items-center text-forest hover:text-forest/80">
            <ArrowLeft className="h-4 w-4 mr-2" />
            구독 페이지로 돌아가기
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 주문 요약 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  주문 요약
                  <span className="bg-forest/10 text-forest px-2 py-1 rounded text-sm font-medium">
                    선택됨
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.title} 플랜</h3>
                    <p className="text-sm text-gray-600">식물 구독 서비스</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-forest">{plan.price}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>{plan.price}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>총 결제 금액</span>
                    <span className="text-forest">{plan.price}</span>
                  </div>
                </div>

                <div className="bg-forest/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">포함된 혜택</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 전문가 선별 식물</li>
                    <li>• 30일 품질 보장</li>
                    <li>• 무료 교체 서비스</li>
                    <li>• 관리 상담 지원</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 결제 정보 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showPaymentForm ? (
                  <div className="space-y-4">
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CreditCard className="h-10 w-10 text-forest" />
                      </div>
                      <Button
                        onClick={handlePaymentClick}
                        className="w-full bg-forest text-white hover:bg-forest/90 py-4 text-xl font-semibold"
                        data-testid="button-proceed-payment"
                      >
                        결제하기
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카드 번호
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                        data-testid="input-card-number"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          유효기간
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          data-testid="input-expiry"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          id="cvc"
                          value={formData.cvc}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          data-testid="input-cvc"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카드 소유자명
                      </label>
                      <input
                        type="text"
                        id="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="홍길동"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                        data-testid="input-cardholder-name"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-forest text-white hover:bg-forest/90 py-3 text-lg mt-6"
                      data-testid="button-complete-payment"
                      disabled={createSubscriptionMutation.isPending}
                    >
                      {createSubscriptionMutation.isPending ? "처리 중..." : `${plan.price} 결제 완료`}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                      className="w-full"
                      data-testid="button-back-to-payment-options"
                    >
                      이전으로
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}