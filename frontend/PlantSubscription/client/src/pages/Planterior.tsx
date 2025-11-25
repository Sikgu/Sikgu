import { useEffect, useRef } from "react";
import { Box, Maximize2, Move3d } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { init3DScene, SceneControls } from "@/lib/init3DScene";

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

const UnauthenticatedState = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center py-8">
        <Move3d className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-600 mb-6">3D 플랜테리어를 이용하려면 로그인해주세요.</p>
        <Link href="/login">
          <Button className="bg-forest text-white hover:bg-forest/90">
            로그인하기
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);

interface InstructionCardProps {
  icon: string;
  bgColor: string;
  title: string;
  description: string;
}

const InstructionCard = ({ icon, bgColor, title, description }: InstructionCardProps) => (
  <div className="bg-white p-5 rounded-xl shadow-md">
    <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
      <span className="text-xl">{icon}</span>
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default function Planterior() {
  const { isAuthenticated, isLoading } = useAuth();
  const appRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sceneControls = useRef<SceneControls | null>(null);

  useEffect(() => {
    if (!appRef.current || !toolbarRef.current || !isAuthenticated) return;

    const controls = init3DScene(appRef.current, toolbarRef.current);
    sceneControls.current = controls;

    const loadRoomData = async () => {
      try {
        const token = sessionStorage.getItem("bearerToken");
        const response = await fetch('/room', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          credentials: 'include'
        });

        if (response.ok) {
          const roomData = await response.json();
          if (roomData && controls.load) {
            await controls.load(JSON.stringify(roomData));
          }
        }
      } catch (error) {
        console.error("Failed to load room data:", error);
      }
    };

    loadRoomData();

    return () => {
      if (controls.cleanup) controls.cleanup();
    };
  }, [isAuthenticated]);

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <UnauthenticatedState />;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-forest rounded-full mb-4">
              <Move3d className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">3D 플랜테리어</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              가상 공간에서 식물을 배치하고 미리 확인해보세요. 드래그하여 원하는 위치에 식물을 배치할 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-forest to-olive p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <Box className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">3D 인터랙티브 뷰어</h2>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="hidden md:inline">💡 마우스로 드래그하여 시점 변경</span>
                </div>
              </div>
            </div>

            <div className="relative bg-gray-900 h-[800px]">
              <div ref={toolbarRef} className="planterior-toolbar" />
              <div ref={appRef} className="planterior-app w-full h-full relative" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
            <InstructionCard 
              icon="🌿" 
              bgColor="bg-green-100" 
              title="식물 배치" 
              description="상단 버튼에서 식물을 선택하고 클릭하여 공간에 배치하세요." 
            />
            <InstructionCard 
              icon="🎨" 
              bgColor="bg-blue-100" 
              title="드래그 & 배치" 
              description="배치된 식물을 마우스로 드래그하여 원하는 위치로 이동할 수 있습니다." 
            />
            <InstructionCard 
              icon="💾" 
              bgColor="bg-purple-100" 
              title="저장 및 불러오기" 
              description="우측 하단의 저장 버튼으로 나만의 공간을 저장하고 언제든 다시 불러오세요." 
            />
          </div>

        </div>
      </div>

      <style>{`
        .planterior-toolbar {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 20;
          display: flex;
          gap: 8px;
          padding: 8px;
          background: rgba(15, 17, 21, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          backdrop-filter: blur(6px);
        }
        .planterior-toolbar button {
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: #e2e8f0;
          padding: 8px 10px;
          border-radius: 10px;
          font: 12px/1 system-ui, sans-serif;
          cursor: pointer;
        }
        .planterior-toolbar button:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .planterior-toolbar button:active {
          transform: translateY(1px);
        }
        .model-buttons-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .planterior-app {
          overflow: hidden;
          background: #0f1115;
        }
        .planterior-hint {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 10;
          padding: 10px 12px;
          border-radius: 10px;
          font: 12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          color: #cbd5e1;
          background: rgba(15, 17, 21, 0.7);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .planterior-hint b {
          color: #e2e8f0;
        }
      `}</style>
    </>
  );
}