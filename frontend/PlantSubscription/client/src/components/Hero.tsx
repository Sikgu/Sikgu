import { Link } from "wouter";

export default function Hero() {
  return (
    <section 
      className="relative py-16 lg:py-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1000')`
      }}
      data-testid="hero-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Link href="/plant-match" className="inline-block cursor-pointer group" data-testid="hero-link">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight group-hover:text-green-200 transition-colors duration-300" data-testid="hero-title">
              Find Your Plant Match
            </h2>
            <p className="text-xl lg:text-2xl text-green-100 mb-8 leading-relaxed group-hover:text-white transition-colors duration-300 max-w-3xl mx-auto" data-testid="hero-description">
              당신의 공간에 완벽한 식물을 찾아보세요. 전문가가 선별한 프리미엄 식물들로 당신의 일상을 더욱 특별하게 만들어드립니다.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
