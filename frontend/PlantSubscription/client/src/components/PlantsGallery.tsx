import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Leaf } from "lucide-react";
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
    image: "",
    alt: "필로덴드론 콩고"
  }
];

export default function PlantsGallery() {
  const [activeTab, setActiveTab] = useState("소형");

  // 식물을 크기별로 분류
  const plantsBySize = {
    "소형": plants.filter(plant => plant.size === "소형"),
    "중형": plants.filter(plant => plant.size === "중형"),
    "대형": plants.filter(plant => plant.size === "대형")
  };

  const tabs = [
    { id: "소형", label: "소형 식물", count: plantsBySize["소형"].length },
    { id: "중형", label: "중형 식물", count: plantsBySize["중형"].length },
    { id: "대형", label: "대형 식물", count: plantsBySize["대형"].length }
  ];

  // 5초마다 자동으로 탭 순환
  useEffect(() => {
    const tabIds = tabs.map(tab => tab.id);
    const interval = setInterval(() => {
      setActiveTab(prevTab => {
        const currentIndex = tabIds.indexOf(prevTab);
        const nextIndex = (currentIndex + 1) % tabIds.length;
        return tabIds[nextIndex];
      });
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-bg-soft" data-testid="plants-gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-bold text-forest text-center mb-12" data-testid="gallery-title">
          둘러보기
        </h3>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-forest text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* 식물 그리드 - 4개씩 1단 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plantsBySize[activeTab as keyof typeof plantsBySize].map((plant) => (
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

        {/* 캐러셀 인디케이터 */}
        <div className="flex justify-center mt-8 space-x-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                activeTab === tab.id 
                  ? 'bg-forest' 
                  : 'bg-gray-300'
              }`}
              data-testid={`carousel-indicator-${tab.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}