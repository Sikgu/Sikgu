import { Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const allReviews = [
  {
    id: 1,
    name: "김민정",
    rating: 5,
    review: "처음 식물을 키우는 저에게 너무 친절하게 설명해주시고, 식물도 정말 건강하게 잘 자라고 있어요. 매달 새로운 식물을 받는 재미가 쏠쏠합니다!",
    date: "2024.10.15"
  },
  {
    id: 2,
    name: "박서준",
    rating: 5,
    review: "사무실에 놓을 식물을 찾고 있었는데, 추천해주신 식물들이 모두 공기정화에도 좋고 관리하기도 쉬워서 동료들이 다들 좋아해요.",
    date: "2024.10.12"
  },
  {
    id: 3,
    name: "이하늘",
    rating: 5,
    review: "식물 케어 팁이 정말 유용해요. 물주기 알림도 보내주시고, 궁금한 건 언제든 문의할 수 있어서 안심이 됩니다.",
    date: "2024.10.10"
  },
  {
    id: 4,
    name: "최유진",
    rating: 5,
    review: "식물을 정말 좋아하는데 자주 죽여서 고민이었는데, 식구 덕분에 집에 식물이 가득해졌어요. 관리하기 쉬운 식물들로 추천해주셔서 감사합니다!",
    date: "2024.10.08"
  },
  {
    id: 5,
    name: "정은우",
    rating: 5,
    review: "구독 서비스가 정말 편리해요. 매달 어떤 식물이 올지 기대되고, 식물마다 자세한 설명서가 함께 와서 초보자도 쉽게 키울 수 있어요.",
    date: "2024.10.05"
  },
  {
    id: 6,
    name: "강민수",
    rating: 4,
    review: "배송이 빠르고 포장도 정성스럽게 되어 있어요. 식물 상태도 매우 좋습니다. 다만 배송비가 조금 아쉬워요.",
    date: "2024.10.03"
  },
  {
    id: 7,
    name: "윤서아",
    rating: 5,
    review: "공기정화 식물들로 집안 분위기가 완전히 바뀌었어요. 인테리어 효과도 좋고 실제로 공기가 맑아진 느낌이에요!",
    date: "2024.09.28"
  },
  {
    id: 8,
    name: "임재현",
    rating: 5,
    review: "선물로 주문했는데 받는 분이 너무 좋아하셨어요. 포장도 예쁘고 케어 가이드까지 있어서 선물하기 딱 좋습니다.",
    date: "2024.09.25"
  },
  {
    id: 9,
    name: "송지우",
    rating: 5,
    review: "반려식물을 처음 키우는데 걱정했는데, 고객센터에서 친절하게 답변해주셔서 문제없이 잘 키우고 있어요. 감사합니다!",
    date: "2024.09.22"
  },
  {
    id: 10,
    name: "한소연",
    rating: 5,
    review: "구독 서비스 정말 만족합니다. 계절에 맞는 식물을 보내주시고, 관리 방법도 자세히 알려주셔서 식물이 모두 건강해요.",
    date: "2024.09.18"
  },
  {
    id: 11,
    name: "오태양",
    rating: 4,
    review: "식물 품질은 정말 좋아요. 다만 선택할 수 있는 옵션이 더 다양했으면 좋겠습니다.",
    date: "2024.09.15"
  },
  {
    id: 12,
    name: "류현우",
    rating: 5,
    review: "3개월째 구독 중인데 한 번도 실망한 적 없어요. 식물도 예쁘고 건강하고, 케어 팁도 유용합니다!",
    date: "2024.09.12"
  }
];

export default function Reviews() {
  const averageRating = (
    allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-forest to-light-green py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-4">사용자 후기</h1>
            <div className="flex items-center gap-2 text-white">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.floor(Number(averageRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/30 text-white/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-semibold">{averageRating}</span>
              <span className="text-white/80">({allReviews.length}개의 리뷰)</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {allReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {review.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  "{review.review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
