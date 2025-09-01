import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown, MapPin, CreditCard, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button"; // Assuming Button is imported from ui/button

export default function HowItWorks() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const text = '식구';
    const typingSteps = ['ㅅ', '시', '식', '식ㄱ', '식구'];
    let currentStep = 0;

    const typeWriter = () => {
      if (currentStep < typingSteps.length) {
        setTypedText(typingSteps[currentStep]);
        currentStep++;
        setTimeout(typeWriter, 200);
      } else {
        // 타이핑 완료 후 커서 깜박임 시작
        const cursorInterval = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);
        
        return () => clearInterval(cursorInterval);
      }
    };

    const timer = setTimeout(typeWriter, 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <span className="text-4xl font-bold text-forest">
              {typedText}
              <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            당신의 공간을 더욱 특별하게 만들어줄 
            <br />
            프리미엄 식물 구독 서비스입니다.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            식물부터 화분까지, 자유롭게 구독하고 언제든 원할 때 해지하세요.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4">
          {/* Service Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection("service-area")}
              className="w-full px-6 py-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-forest mr-3" />
                <span className="text-lg font-semibold text-gray-900">
                  서비스 가능 지역이 궁금해요
                </span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSection === "service-area" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "service-area" && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 leading-relaxed">
                  서울, 경기, 인천(일부 제외지역)에서 서비스가 가능합니다.
                  <br />
                  점차 전국으로 확대해 나갈 예정입니다.
                </p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection("pricing")}
              className="w-full px-6 py-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-forest mr-3" />
                <span className="text-lg font-semibold text-gray-900">
                  요금제가 궁금해요
                </span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSection === "pricing" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "pricing" && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">1코인</span>
                    <span className="text-forest font-semibold">4,900원</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">2코인</span>
                    <span className="text-forest font-semibold">9,900원</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">5코인</span>
                    <span className="text-forest font-semibold">23,900원</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-900">10코인</span>
                    <span className="text-forest font-semibold">44,900원</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  원하는 요금제를 선택할 수 있어요.
                </p>
              </div>
            )}
          </div>

          {/* Circular Service */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection("circular")}
              className="w-full px-6 py-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <RefreshCw className="h-6 w-6 text-forest mr-3" />
                <span className="text-lg font-semibold text-gray-900">
                  모두 새 상품인가요?
                </span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSection === "circular" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "circular" && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 leading-relaxed">
                  식구는 순환식물구독(Circular Plant)으로, 구독으로 식물을
                  경험하고 반납하면 다음 사람에게 이어져 가치를 나누는
                  <br />
                  <strong>서비스형 식물(Plant-as-a-Service)</strong>로 운영돼요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-forest/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              지금 바로 시작해보세요!
            </h3>
            <p className="text-gray-600 mb-6">
              당신만의 식물 구독 여정을 시작하고 더 나은 일상을 만들어보세요.
            </p>
            <Link href="/subscription">
              <Button
                size="lg"
                className="bg-forest text-white hover:bg-forest/90 px-8 py-3"
              >
                구독 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}