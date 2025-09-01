import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PlantsGallery from "@/components/PlantsGallery";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import ReviewSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />
      <Hero />
      <PlantsGallery />
      <SubscriptionPlans />
      <ReviewSection />
      <Footer />
    </div>
  );
}
