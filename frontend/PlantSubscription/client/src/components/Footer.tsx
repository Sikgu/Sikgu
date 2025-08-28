import { Twitter, Facebook, Instagram } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h5 className="text-2xl font-bold mb-4" data-testid="footer-logo">식구</h5>
            <p className="text-gray-400 leading-relaxed" data-testid="footer-description">
              당신의 공간을 더욱 특별하게 만들어줄 프리미엄 식물 구독 서비스입니다.
            </p>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4" data-testid="footer-services-title">서비스</h6>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/subscription" className="hover:text-white transition-colors" data-testid="link-plant-subscription">
                  식물 구독
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors" data-testid="link-care-guide">
                  이용 가이드
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4" data-testid="footer-follow-title">팔로우</h6>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-twitter">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-facebook">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-instagram">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
            <p className="text-gray-400" data-testid="footer-website">plantfamily.com</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p data-testid="footer-copyright">&copy; 2025 식구. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
