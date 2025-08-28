import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Leaf, Check, Star } from "lucide-react";
import { useState, useEffect } from "react";

const subscriptionPlans = [
  {
    id: 1,
    coins: 1,
    title: "1코인 플랜",
    price: "4,900원",
    monthlyPrice: "4,900원/월",
    benefits: [
      "소형 식물 (선인장, 다육식물) 선택 가능",
      "기본 관리 가이드 제공",
      "식물 맞춤 리마인더 제공"
    ],
    image: "/images/sprout.png",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    popular: false
  },
  {
    id: 2,
    coins: 2,
    title: "2코인 플랜",
    price: "9,900원",
    monthlyPrice: "9,900원/월",
    benefits: [
      "중형 식물 (몬스테라, 고무나무) 선택 가능",
      "기본 관리 가이드 제공", 
      "식물 맞춤 리마인더 제공"
    ],
    image: "/images/flower.png",
    bgColor: "bg-gradient-to-br from-green-100 to-green-200",
    borderColor: "border-green-300",
    popular: false
  },
  {
    id: 3,
    coins: 5,
    title: "5코인 플랜",
    price: "23,900원",
    monthlyPrice: "23,900원/월",
    benefits: [
      "대형 식물 (야자수, 벤자민고무나무) 선택 가능",
      "기본 관리 가이드 제공",
      "식물 맞춤 리마인더 제공"
    ],
    image: "/images/tree.png",
    bgColor: "bg-gradient-to-br from-green-200 to-green-300",
    borderColor: "border-green-300",
    popular: true
  },
  {
    id: 4,
    coins: 10,
    title: "10코인 플랜",
    price: "44,900원",
    monthlyPrice: "44,900원/월",
    benefits: [
      "특별한 대형 식물 (올리브나무, 유칼립투스) 선택 가능",
      "기본 관리 가이드 제공",
      "식물 맞춤 리마인더 제공"
    ],
    image: "/images/forest.png",
    bgColor: "bg-gradient-to-br from-green-300 to-green-400",
    borderColor: "border-green-500",
    popular: false
  }
];

export default function Subscription() {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // 타이핑 효과
  useEffect(() => {
    const text = '나만의 식물 구독 플랜';
    const typingSteps = ['ㄴ', '나', '나ㅁ', '나만', '나만ㅇ', '나만의', '나만의 ', '나만의 ㅅ', '나만의 시', '나만의 식', '나만의 식ㅁ', '나만의 식물', '나만의 식물 ', '나만의 식물 ㄱ', '나만의 식물 구', '나만의 식물 구ㄷ', '나만의 식물 구독', '나만의 식물 구독 ', '나만의 식물 구독 ㅍ', '나만의 식물 구독 플', '나만의 식물 구독 플ㄹ', '나만의 식물 구독 플랜'];
    let currentStep = 0;

    const typeWriter = () => {
      if (currentStep < typingSteps.length) {
        setTypedText(typingSteps[currentStep]);
        currentStep++;
        setTimeout(typeWriter, 100);
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

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-forest hover:text-forest/90 transition-colors duration-200" data-testid="logo">
              식구
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/subscription" className="text-forest font-medium" data-testid="link-subscription">
                구독
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-forest transition-colors duration-200 font-medium" data-testid="link-how-it-works">
                이용가이드
              </Link>
              <Button className="bg-forest text-white hover:bg-forest/90 font-medium">
                <Link href="/login" className="text-white">로그인</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="py-16 lg:py-20 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=800')`
        }}
        data-testid="subscription-hero"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6" data-testid="subscription-title">
            {typedText}
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
          </h1>
          <p className="text-xl text-white mb-12 max-w-3xl mx-auto" data-testid="subscription-description">
            당신에게 맞는 완벽한 식물 구독 플랜을 선택하세요. 
            전문가가 엄선한 식물들과 함께 더욱 풍요로운 일상을 만들어보세요.
          </p>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50" data-testid="subscription-plans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`${plan.bgColor} border-2 ${plan.borderColor} hover:shadow-xl transition-all duration-300 relative`}
                data-testid={`subscription-card-${plan.coins}`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center z-10" data-testid="popular-badge">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    인기
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-0 h-[400px]">
                  {/* Image Section */}
                  <div className="relative h-48 md:h-full">
                    <img 
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover"
                      data-testid={`subscription-image-${plan.coins}`}
                    />
                    <div className="absolute bottom-4 right-4 bg-white rounded-full px-2 py-1 shadow-md flex items-center space-x-1">
                      <Leaf className="h-3 w-3 text-green-500" />
                      <span className="text-sm font-bold text-gray-900" data-testid={`subscription-coins-${plan.coins}`}>
                        {plan.coins}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-6 flex flex-col justify-between h-full min-h-[320px]">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2" data-testid={`subscription-plan-title-${plan.coins}`}>
                        {plan.title}
                      </h3>

                      <div className="mb-6">
                        <span className="text-3xl font-bold text-forest" data-testid={`subscription-price-${plan.coins}`}>
                          {plan.monthlyPrice}
                        </span>
                      </div>

                      <div className="space-y-3 mb-8">
                        {plan.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm" data-testid={`benefit-${plan.coins}-${index}`}>
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link href={`/payment?plan=${plan.coins}`} className="block">
                      <Button 
                        className="w-full bg-forest text-white hover:bg-forest/90 py-3 font-medium text-lg"
                        data-testid={`subscription-select-${plan.coins}`}
                      >
                        선택하기
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white" data-testid="subscription-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" data-testid="features-title">
            모든 플랜에 포함된 혜택
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">전문가 선별</h3>
              <p className="text-gray-600">식물 전문가가 직접 선별한 건강한 식물들을 제공합니다.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">품질 보장</h3>
              <p className="text-gray-600">30일 품질 보장과 무료 교체 서비스를 제공합니다.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">관리 지원</h3>
              <p className="text-gray-600">식물 관리에 대한 지속적인 상담과 가이드를 제공합니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}