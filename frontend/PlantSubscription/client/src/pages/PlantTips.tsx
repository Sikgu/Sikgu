import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Leaf } from "lucide-react";

const plantTips = [
  {
    id: 1,
    name: "틸란드시아",
    title: "틸란드시아 관리법",
    summary: "공중식물 틸란드시아의 특별한 관리 방법",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>✨ 틸란드시아란?</h3>
      <p>틸란드시아는 흙 없이도 자랄 수 있는 독특한 공중식물입니다. 공기 중의 수분과 영양분을 흡수하여 생존합니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 주 2-3회 분무기로 살짝 뿌려주세요</p>
      <p>• 아침 시간대에 물을 주는 것이 좋습니다</p>
      <p>• 물을 너무 많이 주면 뿌리가 썩을 수 있으니 주의하세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 간접광을 선호합니다</p>
      <p>• 직사광선은 피해주세요</p>
      <p>• 통풍이 잘 되는 곳에 두세요</p>
      
      <h3>🌡️ 온도와 습도</h3>
      <p>• 18-24°C 정도의 온도가 적당합니다</p>
      <p>• 습도는 40-60% 정도로 유지해주세요</p>
      <p>• 에어컨이나 난방기 바람은 피해주세요</p>
    `
  },
  {
    id: 2,
    name: "미니 선인장",
    title: "미니 선인장 키우기",
    summary: "작지만 강한 미니 선인장 관리 비법",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🌵 미니 선인장 특징</h3>
      <p>미니 선인장은 물을 적게 주고 햇빛을 좋아하는 관리하기 쉬운 식물입니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙이 완전히 마른 후 물을 주세요 (2-3주에 한 번)</p>
      <p>• 겨울에는 한 달에 한 번 정도로 줄여주세요</p>
      <p>• 화분 밑으로 물이 빠질 때까지 충분히 주세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 하루 최소 6시간 이상의 직사광선이 필요합니다</p>
      <p>• 남향 창가가 가장 좋습니다</p>
      <p>• 빛이 부족하면 웃자라게 됩니다</p>
      
      <h3>🌡️ 온도 관리</h3>
      <p>• 15-30°C 사이의 온도를 선호합니다</p>
      <p>• 겨울에는 10°C 이상 유지해주세요</p>
      <p>• 급격한 온도 변화는 피해주세요</p>
    `
  },
  {
    id: 3,
    name: "칼라데아 오르비폴리아",
    title: "칼라데아 오르비폴리아 관리법",
    summary: "아름다운 잎무늬 칼라데아의 섬세한 관리법",
    image: "https://images.unsplash.com/photo-1509423350716-97f2360af3e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🎨 칼라데아의 매력</h3>
      <p>칼라데아 오르비폴리아는 독특한 줄무늬 잎이 특징인 관엽식물로, 높은 습도를 좋아합니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙 표면이 살짝 마르면 물을 주세요</p>
      <p>• 뿌리 부분이 항상 촉촉하게 유지되도록 하세요</p>
      <p>• 정수된 물이나 빗물을 사용하는 것이 좋습니다</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 간접광을 선호합니다</p>
      <p>• 직사광선에 노출되면 잎이 탈 수 있습니다</p>
      <p>• 북향이나 동향 창가가 적합합니다</p>
      
      <h3>💨 습도 관리</h3>
      <p>• 습도 60% 이상을 유지해주세요</p>
      <p>• 가습기나 물받이를 활용하세요</p>
      <p>• 잎에 직접 분무하지 마세요 (얼룩이 생길 수 있음)</p>
    `
  },
  {
    id: 4,
    name: "스킨답서스",
    title: "스킨답서스 키우기",
    summary: "초보자도 쉽게 키울 수 있는 덩굴식물",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🌿 스킨답서스란?</h3>
      <p>스킨답서스는 관리가 쉽고 공기정화 능력이 뛰어난 덩굴성 식물입니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙 표면이 마르면 물을 주세요</p>
      <p>• 주 1-2회 정도가 적당합니다</p>
      <p>• 과습보다는 약간 건조하게 관리하세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 반음지에서도 잘 자랍니다</p>
      <p>• 형광등 불빛만으로도 생육 가능합니다</p>
      <p>• 너무 어두우면 잎의 무늬가 사라집니다</p>
      
      <h3>✂️ 가지치기와 번식</h3>
      <p>• 너무 길어진 덩굴은 잘라주세요</p>
      <p>• 잘라낸 가지를 물에 꽂으면 뿌리가 나옵니다</p>
      <p>• 뿌리가 나면 흙에 심어 새로운 식물로 키울 수 있습니다</p>
    `
  },
  {
    id: 5,
    name: "몬스테라",
    title: "몬스테라 관리 완전정복",
    summary: "인스타그램 스타 몬스테라의 모든 것",
    image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🕳️ 몬스테라의 특징</h3>
      <p>몬스테라는 구멍이 뚫린 독특한 잎으로 유명한 열대식물입니다. 성장하면서 잎에 구멍과 갈래가 생깁니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙 표면 2-3cm가 마르면 물을 주세요</p>
      <p>• 겨울에는 물주기 횟수를 줄여주세요</p>
      <p>• 화분 받침에 고인 물은 제거해주세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 간접광을 선호합니다</p>
      <p>• 직사광선은 잎을 태울 수 있습니다</p>
      <p>• 빛이 부족하면 구멍이 생기지 않을 수 있습니다</p>
      
      <h3>🌱 지지대 설치</h3>
      <p>• 몬스테라는 덩굴성 식물이므로 지지대가 필요합니다</p>
      <p>• 코코넛 섬유나 이끼봉을 사용하세요</p>
      <p>• 기근(공중뿌리)이 나오면 지지대에 유도해주세요</p>
    `
  },
  {
    id: 6,
    name: "여인초",
    title: "여인초 관리법",
    summary: "우아한 자태의 여인초 키우기",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🌸 여인초란?</h3>
      <p>여인초는 우아한 잎의 형태와 섬세한 아름다움으로 사랑받는 관엽식물입니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙이 촉촉하게 유지되도록 물을 주세요</p>
      <p>• 주 2-3회 정도가 적당합니다</p>
      <p>• 잎에 물이 닿지 않도록 주의하세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 직사광선을 좋아합니다</p>
      <p>• 남향 창가가 가장 적합합니다</p>
      <p>• 빛이 부족하면 잎이 처질 수 있습니다</p>
      
      <h3>🌡️ 온도와 환경</h3>
      <p>• 20-25°C의 온도를 선호합니다</p>
      <p>• 통풍이 잘 되는 곳에 두세요</p>
      <p>• 급격한 환경 변화는 피해주세요</p>
    `
  },
  {
    id: 7,
    name: "스파티필룸",
    title: "스파티필룸(평화백합) 키우기",
    summary: "우아한 흰 꽃이 피는 스파티필룸 관리법",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🕊️ 스파티필룸의 매력</h3>
      <p>스파티필룸은 평화백합이라고도 불리며, 우아한 흰색 꽃이 특징인 공기정화 식물입니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙이 항상 촉촉하게 유지되도록 하세요</p>
      <p>• 잎이 처지면 물이 부족한 신호입니다</p>
      <p>• 받침에 고인 물도 그대로 두셔도 됩니다</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 반음지에서도 잘 자랍니다</p>
      <p>• 너무 밝은 곳은 피해주세요</p>
      <p>• 형광등 빛만으로도 충분합니다</p>
      
      <h3>🌸 꽃 피우기</h3>
      <p>• 적절한 습도와 영양분 공급이 중요합니다</p>
      <p>• 월 1회 액체비료를 주세요</p>
      <p>• 꽃이 시들면 줄기째 잘라주세요</p>
    `
  },
  {
    id: 8,
    name: "아레카야자",
    title: "아레카야자 관리법",
    summary: "열대 분위기 가득한 아레카야자 키우기",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🌴 아레카야자란?</h3>
      <p>아레카야자는 열대 분위기를 연출하는 대표적인 관엽식물로, 공기정화 능력이 뛰어납니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙 표면이 마르면 충분히 물을 주세요</p>
      <p>• 주 1-2회 정도가 적당합니다</p>
      <p>• 겨울에는 물주기를 줄여주세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 간접광을 선호합니다</p>
      <p>• 직사광선은 잎을 태울 수 있습니다</p>
      <p>• 반음지에서도 잘 자랍니다</p>
      
      <h3>🍃 잎 관리</h3>
      <p>• 갈색으로 변한 잎은 제거해주세요</p>
      <p>• 분무기로 잎에 습도를 공급해주세요</p>
      <p>• 먼지가 쌓이면 젖은 천으로 닦아주세요</p>
    `
  },
  {
    id: 9,
    name: "고무나무",
    title: "고무나무 완벽 관리 가이드",
    summary: "윤기나는 잎이 매력적인 고무나무 키우기",
    image: "https://images.unsplash.com/photo-1521334884684-d80222895322?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🌳 고무나무의 특징</h3>
      <p>고무나무는 두껍고 윤기나는 잎이 특징인 관엽식물로, 관리가 쉽고 공기정화 효과가 뛰어납니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙 표면이 2-3cm 마르면 물을 주세요</p>
      <p>• 과습을 피하고 적당히 건조하게 관리하세요</p>
      <p>• 겨울에는 물주기 간격을 늘려주세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 간접광에서 가장 잘 자랍니다</p>
      <p>• 직사광선에도 잘 견딥니다</p>
      <p>• 빛이 부족하면 잎이 떨어질 수 있습니다</p>
      
      <h3>✨ 잎 관리</h3>
      <p>• 정기적으로 젖은 천으로 잎을 닦아주세요</p>
      <p>• 잎에 윤이 나는 제품을 사용할 수 있습니다</p>
      <p>• 먼지가 쌓이면 광합성이 방해됩니다</p>
    `
  },
  {
    id: 10,
    name: "극락조",
    title: "극락조(스트렐리치아) 관리법",
    summary: "이국적인 아름다움의 극락조 키우기",
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🦜 극락조란?</h3>
      <p>극락조는 새의 부리를 닮은 독특한 꽃이 피는 식물로, 큰 잎과 이국적인 분위기가 매력적입니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙이 촉촉하게 유지되도록 물을 주세요</p>
      <p>• 성장기에는 물을 충분히 주세요</p>
      <p>• 겨울에는 물주기를 줄여주세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 직사광선을 좋아합니다</p>
      <p>• 하루 최소 6시간 이상의 햇빛이 필요합니다</p>
      <p>• 남향 창가가 가장 적합합니다</p>
      
      <h3>🌺 꽃 피우기</h3>
      <p>• 실내에서는 꽃이 피기 어렵습니다</p>
      <p>• 충분한 공간과 햇빛이 필요합니다</p>
      <p>• 최소 4-5년은 키워야 꽃이 핍니다</p>
    `
  },
  {
    id: 11,
    name: "유포르비아 트리코나",
    title: "유포르비아 트리코나 관리법",
    summary: "독특한 삼각기둥 모양의 다육식물 키우기",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🔺 유포르비아 트리코나란?</h3>
      <p>유포르비아 트리코나는 삼각기둥 모양의 줄기가 특징인 다육식물로, 독특한 외형으로 인기가 높습니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙이 완전히 마른 후 물을 주세요</p>
      <p>• 겨울에는 한 달에 한 번 정도만 주세요</p>
      <p>• 과습은 뿌리 썩음의 원인이 됩니다</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 직사광선을 좋아합니다</p>
      <p>• 햇빛이 부족하면 웃자라게 됩니다</p>
      <p>• 남향 창가가 가장 좋습니다</p>
      
      <h3>⚠️ 주의사항</h3>
      <p>• 줄기를 자르면 흰 수액이 나옵니다</p>
      <p>• 수액은 독성이 있으니 피부에 닿지 않도록 주의하세요</p>
      <p>• 어린이나 반려동물이 있는 곳에서는 주의가 필요합니다</p>
    `
  },
  {
    id: 12,
    name: "필로덴드론 콩고",
    title: "필로덴드론 콩고 관리법",
    summary: "붉은 새순이 아름다운 필로덴드론 콩고 키우기",
    image: "https://images.unsplash.com/photo-1631377819268-d716cd610cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    content: `
      <h3>🔴 필로덴드론 콩고란?</h3>
      <p>필로덴드론 콩고는 새로 나오는 잎이 붉은색이었다가 점차 녹색으로 변하는 아름다운 관엽식물입니다.</p>
      
      <h3>💧 물주기</h3>
      <p>• 흙 표면이 마르면 물을 주세요</p>
      <p>• 주 1-2회 정도가 적당합니다</p>
      <p>• 뿌리가 물에 잠기지 않도록 주의하세요</p>
      
      <h3>☀️ 빛 조건</h3>
      <p>• 밝은 간접광을 선호합니다</p>
      <p>• 직사광선은 잎을 태울 수 있습니다</p>
      <p>• 반음지에서도 잘 자랍니다</p>
      
      <h3>🌱 새순 관리</h3>
      <p>• 새로 나오는 붉은 잎은 건드리지 마세요</p>
      <p>• 적절한 습도를 유지해주세요</p>
      <p>• 새순이 나올 때는 비료를 주면 좋습니다</p>
    `
  }
];

export default function PlantTips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTips, setFilteredTips] = useState(plantTips);

  // 검색 기능
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredTips(plantTips);
    } else {
      const filtered = plantTips.filter(tip => 
        tip.name.toLowerCase().includes(value.toLowerCase()) ||
        tip.title.toLowerCase().includes(value.toLowerCase()) ||
        tip.summary.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTips(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest mb-4" data-testid="tips-title">
            식물별 관리 팁
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            전문가가 알려주는 각 식물별 상세한 관리 방법을 확인해보세요.
          </p>
          
          {/* 검색 바 */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="식물 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* 팁 카드 목록 */}
        <div className="mb-8">
          {filteredTips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500" data-testid="no-results-message">
                검색 결과가 없습니다. 다른 키워드로 시도해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTips.map((tip) => (
                <Card 
                  key={tip.id} 
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  data-testid={`card-tip-${tip.id}`}
                >
                  <div className="relative">
                    {/* 이미지 placeholder - 나중에 실제 이미지로 교체 예정 */}
                    <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Leaf className="h-12 w-12 mx-auto mb-2 text-green-300" />
                        <p className="text-sm">이미지 준비중</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900" data-testid={`text-tip-title-${tip.id}`}>
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4" data-testid={`text-tip-summary-${tip.id}`}>
                      {tip.summary}
                    </p>
                    
                    {/* 상세 내용 - HTML로 렌더링 */}
                    <div 
                      className="text-sm text-gray-700 space-y-3"
                      dangerouslySetInnerHTML={{ __html: tip.content }}
                      data-testid={`content-tip-${tip.id}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}