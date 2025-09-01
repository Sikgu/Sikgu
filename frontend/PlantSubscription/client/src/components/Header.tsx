import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { user, isAuthenticated, logout, isLogoutLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "로그아웃 완료",
        description: "다음에 또 방문해주세요!",
      });
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-forest hover:text-forest/90 transition-colors duration-200" data-testid="logo">
              식구
            </Link>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6" data-testid="nav-menu">
            <Link href="/subscription" className="text-gray-700 hover:text-forest transition-colors duration-200 font-medium" data-testid="link-subscription">
              구독
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-forest transition-colors duration-200 font-medium" data-testid="link-how-it-works">
              이용가이드
            </Link>
            
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 font-medium" data-testid="user-greeting">
                  안녕하세요, {user?.username}님
                </span>
                <Link href="/mypage" className="text-gray-700 hover:text-forest transition-colors duration-200 font-medium" data-testid="link-mypage">
                  마이페이지
                </Link>
                <Button 
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                  className="bg-forest text-white hover:bg-forest/90 font-medium" 
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLogoutLoading ? "로그아웃 중..." : "로그아웃"}
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-forest text-white hover:bg-forest/90 font-medium" data-testid="button-login">
                  로그인
                </Button>
              </Link>
            )}
            
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-forest transition-colors duration-200" data-testid="button-cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium" data-testid="cart-count">
                2
              </span>
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-forest" data-testid="button-mobile-menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
