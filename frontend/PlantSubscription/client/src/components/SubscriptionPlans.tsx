import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Leaf } from "lucide-react";

const subscriptionPlans = [
  {
    id: 1,
    coins: 1,
    title: "1코인",
    price: "4,900원",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    popular: false
  },
  {
    id: 2,
    coins: 2,
    title: "2코인",
    price: "9,900원",
    bgColor: "bg-gradient-to-br from-green-100 to-green-200",
    borderColor: "border-green-300",
    popular: false
  },
  {
    id: 3,
    coins: 5,
    title: "5코인",
    price: "23,900원",
    bgColor: "bg-gradient-to-br from-green-200 to-green-300",
    borderColor: "border-green-400",
    popular: true
  },
  {
    id: 4,
    coins: 10,
    title: "10코인",
    price: "44,900원",
    bgColor: "bg-gradient-to-br from-green-300 to-green-400",
    borderColor: "border-green-500",
    popular: false
  }
];

export default function SubscriptionPlans() {
  return (
    <section className="py-16 bg-white" data-testid="subscription-plans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-bold text-forest text-center mb-12" data-testid="subscription-title">
          나만의 구독제를 선택하세요!
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`${plan.bgColor} rounded-2xl p-8 text-center border ${plan.borderColor} hover:shadow-lg transition-shadow duration-300 relative ${plan.popular ? 'transform scale-105' : ''}`}
              data-testid={`plan-${plan.coins}-coin`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium" data-testid="popular-badge">
                  인기
                </div>
              )}
              <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-green-100 flex items-center justify-center">
                <div className="flex items-center space-x-1">
                  <Leaf className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-bold text-gray-900">{plan.coins}</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-6" data-testid={`text-plan-title-${plan.coins}`}>
                {plan.title}
              </h4>
              <p className="text-3xl font-bold text-forest mb-6" data-testid={`text-plan-price-${plan.coins}`}>
                {plan.price}
              </p>
              <Link href={`/payment?plan=${plan.coins}`} className="block">
                <Button 
                  className="w-full bg-forest text-white hover:bg-forest/90 py-3 font-medium"
                  data-testid={`button-select-${plan.coins}`}
                >
                  선택하기
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
