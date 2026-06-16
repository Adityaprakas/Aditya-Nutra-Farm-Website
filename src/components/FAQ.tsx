import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "Where is Aditya Nutra Farm makhana sourced from?",
      a: "Our makhana (foxnuts) is sourced directly from native lotus farmers in wetland districts of North Bihar, India (Darbhanga, Madhubani, Purnia). This region accounts for over 85% of global makhana cultivation, ensuring premium quality lotus ponds."
    },
    {
      q: "Do you supply Cash on Delivery (COD) across India?",
      a: "Yes, we support both online card payments / UPI gateway as well as Cash On Delivery (COD) services for Pin codes across India. Order now and pay cash at your doorstep!"
    },
    {
      q: "Are Aditya Nutra Farm flavored products natural?",
      a: "Absolutely! Our seasoned makhanas are slow-roasted in heart-healthy cold-pressed oil, lightly hand-tossed with native Indian spices, herbs, and cheese, with zero chemical trans fats, MSG, or artificial coloring agents."
    },
    {
      q: "How can I track my shipment parcel?",
      a: "Once you place an order, you can log in using Google Login to access 'My Account'. There, you can access real-time status trackers (Pending, Approved, Out for Delivery, Completed) along with official Courier Tracking numbers (Delihivery, IndiaPost etc.)."
    },
    {
      q: "What is your refund policy?",
      a: "We strive to deliver the highest sorting standards. If you receive a damaged package or are unsatisfied with the quality, we offer a hassle-free 7-day money-back refund on unopened items. Reach out to our WhatsApp support anytime!"
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-[#0C0D0E]" id="faqs-accordion-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-10 max-w-lg mx-auto">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block mb-1">Inquiries</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Frequently Asked Questions</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded animate-pulse"></div>
        </div>

        {/* Faqs loop */}
        <div className="space-y-3.5">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className="bg-[#121417] rounded-2xl border border-white/5 overflow-hidden shadow-sm hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                onClick={() => handleToggle(idx)}
                id={`faq-item-${idx}`}
              >
                <div className="p-4 sm:p-5 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="text-[#D4AF37] shrink-0" size={18} />
                    <h4 className="font-serif font-bold text-white text-sm sm:text-base leading-snug">{f.q}</h4>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-[#D4AF37] shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </div>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-8 border-t border-white/5 bg-[#16181D]">
                    <p className="text-[#999] text-xs sm:text-sm leading-relaxed pt-3.5">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
