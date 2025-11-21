import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Leaf, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      toast({
        title: "이메일 오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/reset-password-request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "이메일 전송 완료",
          description: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "이메일 전송에 실패했습니다.");
      }
    } catch (error: any) {
      toast({
        title: "전송 실패",
        description: error.message || "이메일 전송에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-forest hover:text-forest/90 transition-colors duration-200">
              식구
            </Link>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="w-8 h-8 text-forest" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            비밀번호 찾기
          </CardTitle>
          <p className="text-sm text-center text-gray-600">
            {isSubmitted
              ? "이메일을 확인해주세요"
              : "가입하신 이메일 주소를 입력하세요"}
          </p>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{email}</span>으로
                  <br />
                  비밀번호 재설정 링크를 전송했습니다.
                </p>
                <p className="text-xs text-gray-500">
                  이메일을 받지 못하셨다면 스팸 메일함을 확인해주세요.
                </p>
              </div>
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full bg-forest hover:bg-forest/90">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    로그인으로 돌아가기
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  다른 이메일로 재시도
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-forest hover:bg-forest/90 text-white"
                disabled={isLoading || !email}
              >
                {isLoading ? "전송 중..." : "재설정 링크 전송"}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-forest hover:text-forest/80">
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  로그인으로 돌아가기
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
