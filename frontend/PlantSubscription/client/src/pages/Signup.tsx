import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Leaf, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordMatch) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        toast({
          title: "회원가입 성공",
          description: "환영합니다! 로그인해주세요.",
        });
        setLocation("/login");
      } else {
        const error = await response.text();
        toast({
          title: "회원가입 실패",
          description: error || "회원가입 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-forest hover:text-forest/90 transition-colors duration-200" data-testid="logo">
              식구
            </Link>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md mx-auto mt-16" data-testid="signup-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900" data-testid="signup-title">
            회원가입
          </CardTitle>
          <p className="text-gray-600 mt-2" data-testid="signup-description">
            식구와 함께 시작하세요
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                아이디
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                className="w-full"
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요 (8자 이상)"
                  required
                  className="w-full pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {password && (
                <div className="flex items-center text-sm mt-1">
                  {isPasswordValid ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={isPasswordValid ? "text-green-500" : "text-red-500"}>
                    8자 이상
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                비밀번호 확인
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="w-full pr-10"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center text-sm mt-1">
                  {isPasswordMatch ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={isPasswordMatch ? "text-green-500" : "text-red-500"}>
                    비밀번호 일치
                  </span>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-forest text-white hover:bg-forest/90 py-2"
              disabled={isLoading || !isPasswordValid || !isPasswordMatch}
              data-testid="button-signup"
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600" data-testid="login-prompt">
              이미 계정이 있으신가요?
            </p>
            <Link href="/login">
              <Button
                variant="outline"
                className="mt-2 w-full border-forest text-forest hover:bg-forest hover:text-white"
                data-testid="button-login"
              >
                로그인
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}