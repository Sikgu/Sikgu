import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ShoppingCart, Check, Sun, Droplets, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// 모든 식물 상세 정보
const plantDetails = [
  {
    id: 1,
    name: "틸란드시아",
    size: "소형",
    coins: 1,
    lightCondition: "반음지",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "틸란드시아는 흙 없이도 자랄 수 있는 독특한 공중식물입니다. 공기 중의 수분과 영양분을 흡수하여 생존하며, 독특한 외형으로 인테리어 소품으로 인기가 높습니다.",
    images: [
      "/images/tillandsia.jpg",
      "https://images.unsplash.com/photo-1565006836881-0c92f7d5d334?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "주 2-3회 분무기로 살짝 뿌려주세요. 아침 시간대에 물을 주는 것이 좋습니다.",
      light: "밝은 간접광을 선호합니다. 직사광선은 피해주세요.",
      temperature: "18-24°C 정도의 온도가 적당합니다.",
      humidity: "습도는 40-60% 정도로 유지해주세요.",
      fertilizer: "월 1회 희석한 액체비료를 분무해주세요.",
      tips: "통풍이 잘 되는 곳에 두고, 에어컨이나 난방기 바람은 피해주세요."
    },
    features: ["흙이 필요 없음", "관리가 매우 쉬움", "독특한 외형", "공간 활용도 높음"]
  },
  {
    id: 2,
    name: "미니 선인장",
    size: "소형",
    coins: 1,
    lightCondition: "햇빛 직사광",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들어요",
    description: "미니 선인장은 물을 적게 주고 햇빛을 좋아하는 관리하기 쉬운 식물입니다. 작은 크기로 책상이나 창가에 두기 좋으며, 다양한 품종을 모으는 재미가 있습니다.",
    images: [
      "/images/mini-cactus.jpg",
      "https://images.unsplash.com/photo-1558603668-6570496b66f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙이 완전히 마른 후 물을 주세요 (2-3주에 한 번). 겨울에는 한 달에 한 번 정도로 줄여주세요.",
      light: "하루 최소 6시간 이상의 직사광선이 필요합니다. 남향 창가가 가장 좋습니다.",
      temperature: "15-30°C 사이의 온도를 선호합니다. 겨울에는 10°C 이상 유지해주세요.",
      humidity: "건조한 환경을 선호합니다. 습한 곳은 피해주세요.",
      fertilizer: "성장기(봄, 여름)에 월 1회 선인장 전용 비료를 주세요.",
      tips: "과습은 뿌리 썩음의 원인이 됩니다. 배수가 잘 되는 흙을 사용하세요."
    },
    features: ["물주기 간단", "햇빛을 좋아함", "다양한 품종", "초보자에게 적합"]
  },
  {
    id: 3,
    name: "칼라데아 오르비폴리아",
    size: "소형",
    coins: 1,
    lightCondition: "간접광",
    difficulty: "어려움",
    humidity: "습함",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "칼라데아 오르비폴리아는 독특한 줄무늬 잎이 특징인 관엽식물입니다. 높은 습도를 좋아하며, 섬세한 관리가 필요하지만 그만큼 아름다운 잎무늬를 자랑합니다.",
    images: [
      "/images/calathea-orbifolia.jpg",
      "https://images.unsplash.com/photo-1597689879203-46e57cd74336?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙 표면이 살짝 마르면 물을 주세요. 뿌리 부분이 항상 촉촉하게 유지되도록 하세요.",
      light: "밝은 간접광을 선호합니다. 직사광선에 노출되면 잎이 탈 수 있습니다.",
      temperature: "18-25°C의 온도가 적당합니다. 급격한 온도 변화는 피해주세요.",
      humidity: "습도 60% 이상을 유지해주세요. 가습기나 물받이를 활용하세요.",
      fertilizer: "성장기에 월 2회 희석한 액체비료를 주세요.",
      tips: "잎에 직접 분무하지 마세요. 얼룩이 생길 수 있습니다. 정수된 물이나 빗물을 사용하는 것이 좋습니다."
    },
    features: ["아름다운 잎무늬", "공기정화 효과", "독특한 외형", "습도를 좋아함"]
  },
  {
    id: 4,
    name: "스킨답서스",
    size: "소형",
    coins: 1,
    lightCondition: "반음지/음지",
    difficulty: "쉬움",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "스킨답서스는 관리가 쉽고 공기정화 능력이 뛰어난 덩굴성 식물입니다. 반음지에서도 잘 자라며, 물꽂이로 쉽게 번식할 수 있어 초보자에게 인기가 높습니다.",
    images: [
      "/images/scindapsus.jpg",
      "https://images.unsplash.com/photo-1597082980533-ec368d0b5c0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙 표면이 마르면 물을 주세요. 주 1-2회 정도가 적당합니다.",
      light: "반음지에서도 잘 자랍니다. 형광등 불빛만으로도 생육 가능합니다.",
      temperature: "18-27°C의 온도를 선호합니다.",
      humidity: "보통 습도에서 잘 자랍니다. 건조해도 잘 견딥니다.",
      fertilizer: "성장기에 월 1-2회 액체비료를 주세요.",
      tips: "너무 길어진 덩굴은 잘라주세요. 잘라낸 가지를 물에 꽂으면 뿌리가 나와 새로운 식물로 키울 수 있습니다."
    },
    features: ["초보자 추천", "공기정화 우수", "번식이 쉬움", "어두운 곳 가능"]
  },
  {
    id: 5,
    name: "몬스테라",
    size: "중형",
    coins: 2,
    lightCondition: "간접광",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "몬스테라는 구멍이 뚫린 독특한 잎으로 유명한 열대식물입니다. 인스타그램에서 가장 인기 있는 인테리어 식물 중 하나로, 성장하면서 잎에 아름다운 구멍과 갈래가 생깁니다.",
    images: [
      "/images/monstera.jpg",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙 표면 2-3cm가 마르면 물을 주세요. 겨울에는 물주기 횟수를 줄여주세요.",
      light: "밝은 간접광을 선호합니다. 직사광선은 잎을 태울 수 있습니다.",
      temperature: "18-25°C의 온도가 적당합니다.",
      humidity: "습도 60% 이상을 유지하면 좋습니다. 분무기로 잎에 물을 뿌려주세요.",
      fertilizer: "성장기(봄, 여름)에 월 1-2회 액체비료를 주세요.",
      tips: "몬스테라는 덩굴성 식물이므로 지지대가 필요합니다. 코코넛 섬유나 이끼봉을 사용하세요."
    },
    features: ["공기정화 능력 우수", "실내 인테리어에 최적", "관리가 비교적 쉬움", "성장이 빠름"]
  },
  {
    id: 6,
    name: "여인초",
    size: "중형",
    coins: 2,
    lightCondition: "햇빛 직사광",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들어요",
    description: "여인초는 우아한 잎의 형태와 섬세한 아름다움으로 사랑받는 관엽식물입니다. 밝은 햇빛을 좋아하며, 적절한 관리로 오랫동안 건강하게 키울 수 있습니다.",
    images: [
      "/images/ladys-slipper.jpg",
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙이 촉촉하게 유지되도록 물을 주세요. 주 2-3회 정도가 적당합니다.",
      light: "밝은 직사광선을 좋아합니다. 남향 창가가 가장 적합합니다.",
      temperature: "20-25°C의 온도를 선호합니다.",
      humidity: "보통 습도에서 잘 자랍니다.",
      fertilizer: "성장기에 월 1-2회 액체비료를 주세요.",
      tips: "통풍이 잘 되는 곳에 두세요. 급격한 환경 변화는 피해주세요."
    },
    features: ["우아한 외형", "햇빛을 좋아함", "중형 크기", "인테리어 효과"]
  },
  {
    id: 7,
    name: "스파티필룸",
    size: "중형",
    coins: 2,
    lightCondition: "반음지/음지",
    difficulty: "쉬움",
    humidity: "습함",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "스파티필룸은 평화백합이라고도 불리며, 우아한 흰색 꽃이 특징인 공기정화 식물입니다. 반음지에서도 잘 자라며, 물을 좋아해 관리가 쉽습니다.",
    images: [
      "/images/spathiphyllum.jpg",
      "https://images.unsplash.com/photo-1591958911259-bee2173bdccc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙이 항상 촉촉하게 유지되도록 하세요. 잎이 처지면 물이 부족한 신호입니다.",
      light: "반음지에서도 잘 자랍니다. 형광등 빛만으로도 충분합니다.",
      temperature: "18-24°C의 온도가 적당합니다.",
      humidity: "습도가 높은 곳을 선호합니다.",
      fertilizer: "월 1회 액체비료를 주세요.",
      tips: "적절한 습도와 영양분 공급으로 흰 꽃을 피울 수 있습니다. 꽃이 시들면 줄기째 잘라주세요."
    },
    features: ["아름다운 흰 꽃", "공기정화 최고", "어두운 곳 가능", "관리 쉬움"]
  },
  {
    id: 8,
    name: "아레카야자",
    size: "중형",
    coins: 2,
    lightCondition: "반음지",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "아레카야자는 열대 분위기를 연출하는 대표적인 관엽식물입니다. 공기정화 능력이 뛰어나며, 우아한 잎 모양으로 인테리어 효과가 좋습니다.",
    images: [
      "/images/areca-palm.jpg",
      "https://images.unsplash.com/photo-1612363148951-f0e669f6b4b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙 표면이 마르면 충분히 물을 주세요. 주 1-2회 정도가 적당합니다.",
      light: "밝은 간접광을 선호합니다. 반음지에서도 잘 자랍니다.",
      temperature: "18-25°C의 온도를 선호합니다.",
      humidity: "습도가 높은 곳을 좋아합니다. 분무기로 잎에 습도를 공급해주세요.",
      fertilizer: "성장기에 월 1-2회 액체비료를 주세요.",
      tips: "갈색으로 변한 잎은 제거해주세요. 먼지가 쌓이면 젖은 천으로 닦아주세요."
    },
    features: ["열대 분위기", "공기정화 우수", "우아한 외형", "중형 크기"]
  },
  {
    id: 9,
    name: "고무나무",
    size: "대형",
    coins: 3,
    lightCondition: "간접광",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "고무나무는 두껍고 윤기나는 잎이 특징인 관엽식물입니다. 관리가 쉽고 공기정화 효과가 뛰어나며, 큰 잎으로 인테리어 효과가 좋습니다.",
    images: [
      "/images/rubber-tree.jpg",
      "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙 표면이 2-3cm 마르면 물을 주세요. 과습을 피하고 적당히 건조하게 관리하세요.",
      light: "밝은 간접광에서 가장 잘 자랍니다. 직사광선에도 잘 견딥니다.",
      temperature: "18-25°C의 온도가 적당합니다.",
      humidity: "건조한 환경을 선호합니다.",
      fertilizer: "성장기에 월 1회 액체비료를 주세요.",
      tips: "정기적으로 젖은 천으로 잎을 닦아주세요. 잎에 윤이 나는 제품을 사용할 수 있습니다."
    },
    features: ["윤기나는 큰 잎", "관리 매우 쉬움", "공기정화 효과", "대형 식물"]
  },
  {
    id: 10,
    name: "극락조",
    size: "대형",
    coins: 3,
    lightCondition: "햇빛 직사광",
    difficulty: "보통",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들어요",
    description: "극락조는 새의 부리를 닮은 독특한 꽃이 피는 식물입니다. 큰 잎과 이국적인 분위기로 실내 정원의 포인트가 되는 식물입니다.",
    images: [
      "/images/bird-of-paradise.jpg",
      "https://images.unsplash.com/photo-1509423350716-97f2360af3e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙이 촉촉하게 유지되도록 물을 주세요. 성장기에는 물을 충분히 주세요.",
      light: "밝은 직사광선을 좋아합니다. 하루 최소 6시간 이상의 햇빛이 필요합니다.",
      temperature: "18-25°C의 온도를 선호합니다.",
      humidity: "보통 습도에서 잘 자랍니다.",
      fertilizer: "성장기에 월 2회 액체비료를 주세요.",
      tips: "실내에서는 꽃이 피기 어렵습니다. 충분한 공간과 햇빛이 필요하며, 최소 4-5년은 키워야 꽃이 핍니다."
    },
    features: ["이국적인 외형", "큰 잎", "독특한 꽃", "대형 식물"]
  },
  {
    id: 11,
    name: "유포르비아 트리코나",
    size: "대형",
    coins: 3,
    lightCondition: "햇빛 직사광",
    difficulty: "쉬움",
    humidity: "건조",
    lightCategory: "햇빛이 잘 들어요",
    description: "유포르비아 트리코나는 삼각기둥 모양의 줄기가 특징인 다육식물입니다. 독특한 외형으로 인기가 높으며, 관리가 매우 쉽습니다.",
    images: [
      "/images/euphorbia-trigona.jpg",
      "https://images.unsplash.com/photo-1615671524827-c1fe3973b648?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙이 완전히 마른 후 물을 주세요. 겨울에는 한 달에 한 번 정도만 주세요.",
      light: "밝은 직사광선을 좋아합니다. 햇빛이 부족하면 웃자라게 됩니다.",
      temperature: "15-30°C의 온도를 선호합니다.",
      humidity: "건조한 환경을 선호합니다.",
      fertilizer: "성장기에 월 1회 다육식물 전용 비료를 주세요.",
      tips: "줄기를 자르면 흰 수액이 나옵니다. 수액은 독성이 있으니 피부에 닿지 않도록 주의하세요."
    },
    features: ["독특한 삼각 형태", "관리 매우 쉬움", "대형 크기", "건조에 강함"]
  },
  {
    id: 12,
    name: "필로덴드론 콩고",
    size: "대형",
    coins: 3,
    lightCondition: "반음지",
    difficulty: "쉬움",
    humidity: "보통",
    lightCategory: "햇빛이 잘 들지 않아요",
    description: "필로덴드론 콩고는 새로 나오는 잎이 붉은색이었다가 점차 녹색으로 변하는 아름다운 관엽식물입니다. 관리가 쉽고 공기정화 효과가 뛰어납니다.",
    images: [
      "/images/philodendron.jpg",
      "https://images.unsplash.com/photo-1591958911259-bee2173bdccc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
    ],
    careGuide: {
      watering: "흙 표면이 마르면 물을 주세요. 주 1-2회 정도가 적당합니다.",
      light: "밝은 간접광을 선호합니다. 반음지에서도 잘 자랍니다.",
      temperature: "18-25°C의 온도가 적당합니다.",
      humidity: "보통 습도에서 잘 자랍니다. 새순이 나올 때는 습도를 높여주세요.",
      fertilizer: "성장기에 월 1-2회 액체비료를 주세요.",
      tips: "새로 나오는 붉은 잎은 건드리지 마세요. 새순이 나올 때는 비료를 주면 좋습니다."
    },
    features: ["붉은 새순", "공기정화 효과", "관리 쉬움", "대형 식물"]
  }
];

export default function PlantDetail() {
  const [match, params] = useRoute("/plant/:id");
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  // URL에서 ID 추출하여 해당 식물 찾기
  const plantId = params?.id ? parseInt(params.id) : null;
  const plant = plantDetails.find(p => p.id === plantId);

  

  // 식물을 찾지 못한 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!plant) {
      setLocation("/");
    }
  }, [plant, setLocation]);

  // 리다이렉트 중이거나 식물을 찾지 못한 경우
  if (!plant) {
    return null;
  }

  const handleAddToCart = async () => {
    // 로그인 확인
    if (!isAuthenticated) {
      toast({
        title: "로그인이 필요합니다",
        description: "로그인 후 이용해주세요.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    try {
      // 장바구니에 추가 (plantId만 전달)
      await addItem(plant.id);

      setAddedToCart(true);
      toast({
        title: "장바구니에 추가되었습니다",
        description: `${plant.name}이(가) 장바구니에 담겼습니다.`,
      });
      
      // 3초 후 버튼 상태 리셋
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      toast({
        title: "오류",
        description: "장바구니 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  

  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* 왼쪽: 이미지 갤러리 */}
          <div>
            {/* 메인 이미지 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <img 
                src={plant.images[selectedImage]}
                alt={plant.name}
                className="w-full h-[500px] object-cover"
                data-testid="main-plant-image"
              />
            </div>
            
            {/* 썸네일 이미지들 */}
            <div className={`grid ${plant.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
              {plant.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-forest shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img 
                    src={image}
                    alt={`${plant.name} ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              {/* 식물 이름 및 크기 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="plant-name">
                    {plant.name}
                  </h1>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full" data-testid="plant-size">
                    {plant.size} 식물
                  </span>
                </div>
                <p className="text-gray-600" data-testid="plant-description">
                  {plant.description}
                </p>
              </div>

              {/* 코인 정보 */}
              <div className="mb-6 p-4 bg-forest/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">필요 코인</span>
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-6 w-6 text-forest" />
                    <span className="text-3xl font-bold text-forest" data-testid="plant-coins">
                      {plant.coins}
                    </span>
                    <span className="text-gray-600">코인</span>
                  </div>
                </div>
              </div>

              {/* 식물 조건 태그 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">식물 특성</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center" data-testid="tag-light">
                    <Sun className="h-4 w-4 mr-1" />
                    {plant.lightCondition}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center" data-testid="tag-humidity">
                    <Droplets className="h-4 w-4 mr-1" />
                    습도 {plant.humidity}
                  </span>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center" data-testid="tag-difficulty">
                    <Settings className="h-4 w-4 mr-1" />
                    관리 {plant.difficulty}
                  </span>
                </div>
              </div>

              {/* 특징 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">특징</h3>
                <ul className="space-y-2">
                  {plant.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600" data-testid={`feature-${index}`}>
                      <Check className="h-4 w-4 text-forest mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className={`w-full h-12 text-base font-semibold transition-all ${
                    addedToCart 
                      ? 'bg-forest text-white' 
                      : 'bg-forest hover:bg-forest/90 text-white'
                  }`}
                  data-testid="button-add-to-cart"
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      장바구니에 담김
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      장바구니 담기
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 관리 가이드 */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="care-guide-title">
                  관리 가이드
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                      물주기
                    </h4>
                    <p className="text-gray-600 text-sm" data-testid="care-watering">
                      {plant.careGuide.watering}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                      빛 조건
                    </h4>
                    <p className="text-gray-600 text-sm" data-testid="care-light">
                      {plant.careGuide.light}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">온도</h4>
                    <p className="text-gray-600 text-sm" data-testid="care-temperature">
                      {plant.careGuide.temperature}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">습도</h4>
                    <p className="text-gray-600 text-sm" data-testid="care-humidity">
                      {plant.careGuide.humidity}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">비료</h4>
                    <p className="text-gray-600 text-sm" data-testid="care-fertilizer">
                      {plant.careGuide.fertilizer}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-1">💡 팁</h4>
                    <p className="text-gray-600 text-sm" data-testid="care-tips">
                      {plant.careGuide.tips}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}