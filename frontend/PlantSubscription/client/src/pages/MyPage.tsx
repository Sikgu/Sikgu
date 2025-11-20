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
import { Leaf, Edit2, Save, X } from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  address: string | null;
  phoneNumber: string | null;
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
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/users/mypage");

        const data = await response.json();
        setProfile(data);
        setEditForm({
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
        });
      } catch (error: any) {
        toast({
          title: "오류 발생",
          description: error.message || "프로필 정보를 불러올 수 없습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, toast]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        address: profile.address || "",
        phoneNumber: profile.phoneNumber || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await apiRequest("POST", "/users/info", editForm);

      const updatedData = await response.json();
      setProfile(updatedData);
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
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder="전화번호를 입력하세요"
                  className={!isEditing ? "bg-gray-50" : ""}
                />
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
      </main>

      <Footer />
    </div>
  );
}