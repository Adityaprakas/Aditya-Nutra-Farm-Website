import React from 'react';

interface AnnouncementBarProps {
  language?: 'en' | 'hi';
}

export default function AnnouncementBar({ language = 'en' }: AnnouncementBarProps) {
  const announcements = [
    {
      icon: "🚚",
      en: "Free Shipping Above ₹499",
      hi: "₹499 से ऊपर मुफ़्त डिलीवरी"
    },
    {
      icon: "🌾",
      en: "Farm Fresh Bihar Makhana",
      hi: "खेत से ताज़ा बिहार मखाना"
    },
    {
      icon: "🔒",
      en: "Secure Payments Secured by Razorpay",
      hi: "सुरक्षित भुगतान"
    }
  ];

  return (
    <div 
      className="w-full bg-[#0C0D0E] text-[#D4AF37] text-xs font-bold border-b border-[#D4AF37]/20 select-none py-2 px-4 relative z-50 sticky top-0"
      id="announcement-bar"
    >
      {/* Desktop view (static, sleek centering grid) */}
      <div className="hidden md:flex justify-center items-center gap-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 transition-all hover:scale-105">
          <span className="text-sm">🚚</span>
          <span className="tracking-wide uppercase text-[10px]">
            {language === 'hi' ? '₹499 से ऊपर मुफ़्त डिलीवरी' : 'Free Shipping Above ₹499'}
          </span>
        </div>
        <div className="text-white/20 select-none">|</div>
        <div className="flex items-center gap-1.5 transition-all hover:scale-105">
          <span className="text-sm">🌾</span>
          <span className="tracking-wide uppercase text-[10px]">
            {language === 'hi' ? 'सीधे खेत से ताज़ा बिहार मखाना' : 'Farm Fresh Bihar Makhana'}
          </span>
        </div>
        <div className="text-white/20 select-none">|</div>
        <div className="flex items-center gap-1.5 transition-all hover:scale-105">
          <span className="text-sm">🔒</span>
          <span className="tracking-wide uppercase text-[10px]">
            {language === 'hi' ? '100% सुरक्षित भुगतान' : 'Secure Payments'}
          </span>
        </div>
      </div>

      {/* Mobile view (luxury smooth scrolling marquee ribbon) */}
      <div className="block md:hidden overflow-hidden whitespace-nowrap py-0.5 relative select-none">
        <style>{`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee-ribbon {
            display: inline-flex !important;
            align-items: center;
            animation: marquee 25s linear infinite;
          }
        `}</style>
        <div className="animate-marquee-ribbon gap-6 flex-nowrap">
          {[...Array(3)].map((_, loopIdx) => (
            <React.Fragment key={loopIdx}>
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <span>🚚</span>
                <span className="tracking-wide uppercase text-[9px] pointer-events-none">
                  {language === 'hi' ? '₹499 से ऊपर मुफ़्त डिलीवरी' : 'Free Shipping Above ₹499'}
                </span>
              </div>
              <span className="text-[#D4AF37]/40 inline-block pointer-events-none">•</span>
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <span>🌾</span>
                <span className="tracking-wide uppercase text-[9px] pointer-events-none">
                  {language === 'hi' ? 'ताज़ा बिहार मखाना' : 'Farm Fresh Bihar Makhana'}
                </span>
              </div>
              <span className="text-[#D4AF37]/40 inline-block pointer-events-none">•</span>
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <span>🔒</span>
                <span className="tracking-wide uppercase text-[9px] pointer-events-none">
                  {language === 'hi' ? 'सुरक्षित भुगतान' : 'Secure Payments'}
                </span>
              </div>
              <span className="text-[#D4AF37]/40 inline-block pointer-events-none">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
