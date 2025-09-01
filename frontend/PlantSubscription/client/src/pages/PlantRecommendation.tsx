import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Sun, Droplets, Settings } from "lucide-react";
import { Link } from "wouter";

const plants = [
  // 소형 식물
  {
    id: 1,
    name: "틸란드시아",
    coins: 1,
    size: "소형",
    lightCondition: "반음지",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "틸란드시아"
  },
  {
    id: 2,
    name: "미니 선인장",
    coins: 1,
    size: "소형",
    lightCondition: "햇빛 직사광",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들어요",
    image: "",
    alt: "미니 선인장"
  },
  {
    id: 3,
    name: "칼라데아 오르비폴리아",
    coins: 1,
    size: "소형",
    lightCondition: "간접광",
    difficulty: "어려움",
    humidity: "습함",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "칼라데아 오르비폴리아"
  },
  {
    id: 4,
    name: "스킨답서스",
    coins: 1,
    size: "소형",
    lightCondition: "반음지/음지",
    difficulty: "쉬움",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "스킨답서스"
  },
  // 중형 식물
  {
    id: 5,
    name: "몬스테라",
    coins: 2,
    size: "중형",
    lightCondition: "간접광",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "몬스테라"
  },
  {
    id: 6,
    name: "여인초",
    coins: 2,
    size: "중형",
    lightCondition: "햇빛 직사광",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들어요",
    image: "",
    alt: "여인초"
  },
  {
    id: 7,
    name: "스파티필룸",
    coins: 2,
    size: "중형",
    lightCondition: "반음지/음지",
    difficulty: "쉬움",
    humidity: "습함",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "스파티필룸"
  },
  {
    id: 8,
    name: "아레카야자",
    coins: 2,
    size: "중형",
    lightCondition: "반음지",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "아레카야자"
  },
  // 대형 식물
  {
    id: 9,
    name: "고무나무",
    coins: 3,
    size: "대형",
    lightCondition: "간접광",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "고무나무"
  },
  {
    id: 10,
    name: "극락조",
    coins: 3,
    size: "대형",
    lightCondition: "햇빛 직사광",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들어요",
    image: "",
    alt: "극락조"
  },
  {
    id: 11,
    name: "유포르비아 트리코나",
    coins: 3,
    size: "대형",
    lightCondition: "햇빛 직사광",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들어요",
    image: "",
    alt: "유포르비아 트리코나"
  },
  {
    id: 12,
    name: "필로덴드론 콩고",
    coins: 3,
    size: "대형",
    lightCondition: "반음지",
    difficulty: "쉬움",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    image: "",
    alt: "필로덴드론 콩고"
  }
];

const sizeOptions = [
  { value: "소형", label: "소형 식물", icon: Leaf },
  { value: "중형", label: "중형 식물", icon: Leaf },
  { value: "대형", label: "대형 식물", icon: Leaf }
];

const lightOptions = [
  { value: "햇빛이 잘 들어요", label: "햇빛이 잘 들어요", icon: Sun },
  { value: "햇빛이 잘 들지 않아요", label: "햇빛이 잘 들지 않아요", icon: Sun }
];

const humidityOptions = [
  { value: "건조", label: "건조해요", icon: Droplets },
  { value: "보통", label: "보통이에요", icon: Droplets },
  { value: "습함", label: "습해요", icon: Droplets }
];

const difficultyOptions = [
  { value: "쉬움", label: "쉬워요", icon: Settings },
  { value: "보통", label: "보통이에요", icon: Settings },
  { value: "어려움", label: "어려워요", icon: Settings }
];

export default function PlantRecommendation() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedLight, setSelectedLight] = useState<string | null>(null);
  const [selectedHumidity, setSelectedHumidity] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [filteredPlants, setFilteredPlants] = useState(plants);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // 타이핑 효과
  useEffect(() => {
    const text = '나에게 맞는 식물 찾기';
    const typingSteps = ['ㄴ', '나', '나ㅇ', '나에', '나에ㄱ', '나에게', '나에게 ', '나에게 ㅁ', '나에게 마', '나에게 맞', '나에게 맞ㄴ', '나에게 맞는', '나에게 맞는 ', '나에게 맞는 ㅅ', '나에게 맞는 시', '나에게 맞는 식', '나에게 맞는 식ㅁ', '나에게 맞는 식물', '나에게 맞는 식물 ', '나에게 맞는 식물 ㅊ', '나에게 맞는 식물 차', '나에게 맞는 식물 찾', '나에게 맞는 식물 찾ㄱ', '나에게 맞는 식물 찾기'];
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

  // 필터링 로직
  useEffect(() => {
    let filtered = plants;

    if (selectedSize) {
      filtered = filtered.filter(plant => plant.size === selectedSize);
    }

    if (selectedLight) {
      filtered = filtered.filter(plant => plant.lightCategory === selectedLight);
    }

    if (selectedHumidity) {
      filtered = filtered.filter(plant => plant.humidity === selectedHumidity);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(plant => plant.difficulty === selectedDifficulty);
    }

    setFilteredPlants(filtered);
  }, [selectedSize, selectedLight, selectedHumidity, selectedDifficulty]);

  // 태그 생성 함수
  const getPlantTags = (plant: any) => {
    return [
      `#${plant.lightCondition}`,
      `#${plant.humidity}`,
      `#${plant.difficulty}`
    ];
  };

  const clearAllFilters = () => {
    setSelectedSize(null);
    setSelectedLight(null);
    setSelectedHumidity(null);
    setSelectedDifficulty(null);
  };

  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest mb-4" data-testid="recommendation-title">
            {typedText}
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            나의 환경에 적합한 완벽한 식물을 찾아보세요! 필터를 선택하여 맞춤형 추천을 받을 수 있습니다.
          </p>
        </div>

        {/* 필터 섹션 */}
        <div className="space-y-8 mb-12">
          {/* 크기 필터 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-green-500" />
              식물 크기
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sizeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    onClick={() => setSelectedSize(selectedSize === option.value ? null : option.value)}
                    variant={selectedSize === option.value ? "default" : "outline"}
                    className={`h-auto p-4 text-left justify-start ${
                      selectedSize === option.value 
                        ? "bg-forest text-white hover:bg-forest/90" 
                        : "hover:bg-gray-50"
                    }`}
                    data-testid={`filter-size-${option.value}`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span className="text-base">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          {/* 빛 조건 필터 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Sun className="h-5 w-5 mr-2 text-yellow-500" />
              빛
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lightOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    onClick={() => setSelectedLight(selectedLight === option.value ? null : option.value)}
                    variant={selectedLight === option.value ? "default" : "outline"}
                    className={`h-auto p-4 text-left justify-start ${
                      selectedLight === option.value 
                        ? "bg-forest text-white hover:bg-forest/90" 
                        : "hover:bg-gray-50"
                    }`}
                    data-testid={`filter-light-${option.value}`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span className="text-base">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 습도 조건 필터 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-500" />
              습도
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {humidityOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    onClick={() => setSelectedHumidity(selectedHumidity === option.value ? null : option.value)}
                    variant={selectedHumidity === option.value ? "default" : "outline"}
                    className={`h-auto p-4 text-left justify-start ${
                      selectedHumidity === option.value 
                        ? "bg-forest text-white hover:bg-forest/90" 
                        : "hover:bg-gray-50"
                    }`}
                    data-testid={`filter-humidity-${option.value}`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span className="text-base">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 관리 난이도 필터 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              관리 난이도
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    onClick={() => setSelectedDifficulty(selectedDifficulty === option.value ? null : option.value)}
                    variant={selectedDifficulty === option.value ? "default" : "outline"}
                    className={`h-auto p-4 text-left justify-start ${
                      selectedDifficulty === option.value 
                        ? "bg-forest text-white hover:bg-forest/90" 
                        : "hover:bg-gray-50"
                    }`}
                    data-testid={`filter-difficulty-${option.value}`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span className="text-base">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 필터 초기화 버튼 */}
          {(selectedSize || selectedLight || selectedHumidity || selectedDifficulty) && (
            <div className="text-center">
              <Button 
                onClick={clearAllFilters}
                variant="outline"
                className="px-6 py-2"
                data-testid="clear-filters-button"
              >
                모든 필터 초기화
              </Button>
            </div>
          )}
        </div>

        {/* 추천 식물 결과 */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="results-title">
            추천 식물 ({filteredPlants.length}개)
          </h3>
          
          {filteredPlants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500" data-testid="no-results-message">
                선택한 조건에 맞는 식물이 없습니다. 다른 조건으로 시도해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPlants.map((plant) => (
                <Link key={plant.id} href={`/plant/${plant.id}`}>
                  <Card 
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
                    data-testid={`card-plant-${plant.id}`}
                  >
                    <div className="relative">
                      <img 
                        src={plant.image}
                        alt={plant.alt}
                        className="w-full h-48 object-cover"
                        data-testid={`img-plant-${plant.id}`}
                      />
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md flex items-center space-x-1">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-bold text-gray-900" data-testid={`text-plant-coins-${plant.id}`}>
                          {plant.coins}
                        </span>
                      </div>
                      {/* 식물 태그 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex flex-wrap gap-1">
                          {getPlantTags(plant).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
                              data-testid={`tag-${plant.id}-${index}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1" data-testid={`text-plant-name-${plant.id}`}>
                        {plant.name}
                      </h4>
                      <p className="text-sm text-gray-500" data-testid={`text-plant-size-${plant.id}`}>
                        {plant.size} 식물
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}