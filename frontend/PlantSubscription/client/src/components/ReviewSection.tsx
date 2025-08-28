import { Star, Clock, Sprout, Sun, Droplets, Thermometer, Wind, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const userReviews = [
  {
    id: 1,
    name: "김민정",
    rating: 5,
    review: "처음 식물을 키우는 저에게 너무 친절하게 설명해주시고, 식물도 정말 건강하게 잘 자라고 있어요. 매달 새로운 식물을 받는 재미가 쏠쏠합니다!"
  },
  {
    id: 2,
    name: "박서준",
    rating: 5,
    review: "사무실에 놓을 식물을 찾고 있었는데, 추천해주신 식물들이 모두 공기정화에도 좋고 관리하기도 쉬워서 동료들이 다들 좋아해요."
  },
  {
    id: 3,
    name: "이하늘",
    rating: 5,
    review: "식물 케어 팁이 정말 유용해요. 물주기 알림도 보내주시고, 궁금한 건 언제든 문의할 수 있어서 안심이 됩니다."
  }
];

// 기존 팁들은 식물별 팁 페이지로 이동되었습니다

export default function ReviewSection() {
  return (
    <section className="py-16 bg-bg-soft" data-testid="review-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-12">
          {/* User Reviews */}
          <div>
            <div className="flex items-center mb-8">
              <Star className="text-yellow-400 h-6 w-6 mr-2" data-testid="icon-star" />
              <h4 className="text-2xl font-bold text-gray-900" data-testid="user-reviews-title">
                사용자 후기
              </h4>
            </div>

            <div className="space-y-6">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-2xl shadow-md"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" data-testid={`star-${review.id}-${i}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900" data-testid={`reviewer-name-${review.id}`}>
                      {review.name}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed" data-testid={`review-content-${review.id}`}>
                    "{review.review}"
                  </p>
                </div>
              ))}

              {/* More Reviews Button */}
              <div className="text-center">
                <Link href="/reviews">
                  <Button
                    variant="outline"
                    className="border-forest text-forest hover:bg-forest hover:text-white transition-colors duration-300"
                    data-testid="button-more-reviews"
                  >
                    더보기
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Plant Care Tips */}
          <div>
            <div className="flex items-center mb-8">
              <Sprout className="text-forest h-6 w-6 mr-2" data-testid="icon-leaf" />
              <h4 className="text-2xl font-bold text-gray-900" data-testid="plant-tips-title">
                식물별 팁
              </h4>
            </div>

            <div className="space-y-6">
              {/* General Plant Care Tips */}
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-light-green" data-testid="general-tips">
                <h5 className="font-bold text-gray-900 mb-3 text-lg" data-testid="general-tips-title">
                  일반적인 식물 관리
                </h5>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center" data-testid="tip-watering">
                    <Droplets className="text-blue-500 h-4 w-4 mr-3" />
                    흙이 마르면 충분히 물주기
                  </p>
                  <p className="flex items-center" data-testid="tip-temperature">
                    <Thermometer className="text-red-500 h-4 w-4 mr-3" />
                    실온 18-24도 유지하기
                  </p>
                  <p className="flex items-center" data-testid="tip-ventilation">
                    <Wind className="text-gray-500 h-4 w-4 mr-3" />
                    통풍이 잘 되는 곳에 배치
                  </p>
                </div>
              </div>

              {/* More Plant Tips Button */}
              <div className="text-center">
                <Link href="/plant-tips">
                  <Button
                    variant="outline"
                    className="border-forest text-forest hover:bg-forest hover:text-white transition-colors duration-300"
                    data-testid="button-more-tips"
                  >
                    더보기
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}