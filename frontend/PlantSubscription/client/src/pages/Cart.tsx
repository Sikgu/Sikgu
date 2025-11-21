import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Minus, Plus, ShoppingBag, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Cart() {
  const { items, itemCount, totalPrice, removeItem, decreaseQuantity, clearCart, isLoading: cartLoading } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleRemove = async (plantId: number, plantName: string) => {
    try {
      await removeItem(plantId);
      toast({
        title: "상품 제거",
        description: `${plantName}이(가) 장바구니에서 제거되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "상품 제거에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "장바구니 비우기",
        description: "장바구니가 비워졌습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "장바구니 비우기에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDecreaseQuantity = async (plantId: number) => {
    try {
      await decreaseQuantity(plantId);
    } catch (error) {
      toast({
        title: "오류",
        description: "수량 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    toast({
      title: "준비 중",
      description: "결제 기능은 준비 중입니다.",
    });
  };

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">장바구니를 이용하려면 로그인해주세요.</p>
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
    <div className="min-h-screen bg-bg-soft">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="cart-title">
          장바구니
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2" data-testid="empty-cart-message">
              장바구니가 비어있습니다
            </h2>
            <p className="text-gray-500 mb-6">
              원하는 식물을 장바구니에 담아보세요!
            </p>
            <Link href="/">
              <Button className="bg-forest text-white hover:bg-forest/90" data-testid="button-continue-shopping">
                쇼핑 계속하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.plantId} className="bg-white" data-testid={`cart-item-${item.plantId}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* 상품 정보 */}
                      <div className="flex-1">
                        <Link href={`/plant/${item.plantId}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-forest cursor-pointer" data-testid={`cart-item-name-${item.plantId}`}>
                            {item.plantName}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold text-forest" data-testid={`cart-item-price-${item.plantId}`}>
                            ₩{item.itemTotal.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            (₩{item.plantPrice.toLocaleString()} x {item.quantity})
                          </span>
                        </div>
                      </div>

                      {/* 수량 조절 */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDecreaseQuantity(item.plantId)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.plantId}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium" data-testid={`cart-item-quantity-${item.plantId}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toast({ title: "준비 중", description: "수량 증가 기능은 백엔드 API 추가가 필요합니다." })}
                          data-testid={`button-increase-${item.plantId}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 삭제 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.plantId, item.plantName)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-remove-${item.plantId}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* 장바구니 비우기 버튼 */}
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                data-testid="button-clear-cart"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                장바구니 비우기
              </Button>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card className="bg-white sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="order-summary-title">
                    주문 요약
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span data-testid="total-items-label">총 상품 수</span>
                      <span data-testid="total-items-count">{itemCount}개</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span data-testid="total-price-label">총 금액</span>
                      <span className="text-2xl text-forest" data-testid="total-price-amount">
                        ₩{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-forest text-white hover:bg-forest/90 py-6 text-lg" 
                    data-testid="button-checkout"
                  >
                    결제하기
                  </Button>

                  <Link href="/">
                    <Button variant="outline" className="w-full mt-3" data-testid="button-continue-shopping-sidebar">
                      쇼핑 계속하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
