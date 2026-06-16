import React from 'react';
import { Sparkles, Gift, Flame, Copy, Check, BadgePercent } from 'lucide-react';
import { motion } from 'motion/react';

interface FestiveOffersSectionProps {
  language: 'en' | 'hi';
  cartTotal: number;
  onApplyCoupon: (code: string) => void;
  triggerToast: (message: string, type: 'success' | 'err' | 'info') => void;
}

interface CampaignCoupon {
  code: string;
  discount: number;
  minOrder: number;
  emoji: string;
  nameEn: string;
  nameHi: string;
  taglineEn: string;
  taglineHi: string;
  colorTheme: string;
  badgeBg: string;
  accentText: string;
}

const CAMPAIGNS: CampaignCoupon[] = [
  {
    code: 'CHHATH15',
    discount: 85,
    minOrder: 199,
    emoji: '🌅',
    nameEn: 'Mithila Chhath Puja Special',
    nameHi: 'मिथिला छठ पूजा स्पेशल',
    taglineEn: 'Pure Pujam offerings with flat ₹85 discount.',
    taglineHi: 'पवित्र अर्घ्य सामग्री पर फ्लैट ₹85 की विशेष छूट।',
    colorTheme: 'from-orange-950/40 via-amber-950/20 to-zinc-950/70 border-orange-500/20 hover:border-orange-500/40',
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    accentText: 'text-orange-400'
  },
  {
    code: 'NEWYEAR20',
    discount: 90,
    minOrder: 249,
    emoji: '🎉',
    nameEn: 'New Year Winter Health',
    nameHi: 'नव वर्ष सेहत महोत्सव',
    taglineEn: 'Kickstart winter superfood habits with ₹90 savings.',
    taglineHi: 'नए साल में स्वस्थ मखाना आदतों पर ₹90 की बचत।',
    colorTheme: 'from-blue-950/40 via-indigo-950/20 to-zinc-950/70 border-blue-500/20 hover:border-blue-500/40',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accentText: 'text-blue-400'
  },
  {
    code: 'HOLI20',
    discount: 100,
    minOrder: 299,
    emoji: '🎨',
    nameEn: 'Holi Colors Celebration',
    nameHi: 'होली खुशियों के रंग',
    taglineEn: 'Flat ₹100 Off on roasted & spicy masala makhana.',
    taglineHi: 'रोस्टेड और चटपटे मसाला मखाना पर फ्लैट ₹100 की छूट।',
    colorTheme: 'from-pink-950/40 via-purple-950/20 to-zinc-950/70 border-pink-500/20 hover:border-pink-500/40',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    accentText: 'text-pink-400 font-extrabold'
  },
  {
    code: 'MONSOON25',
    discount: 120,
    minOrder: 399,
    emoji: '🌱',
    nameEn: 'Monsoon Fresh Harvest Sale',
    nameHi: 'मानसून हार्वेस्ट सेल',
    taglineEn: 'Fresh June Bihar harvest. Flat ₹120 Off + Free Delivery.',
    taglineHi: 'जून की ताज़ा मखाना फसल पर ₹120 की छूट + फ्री होम डिलीवरी।',
    colorTheme: 'from-emerald-950/40 via-teal-950/20 to-zinc-950/70 border-emerald-500/20 hover:border-emerald-500/40',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accentText: 'text-emerald-400'
  },
  {
    code: 'DIWALI50',
    discount: 150,
    minOrder: 499,
    emoji: '🪔',
    nameEn: 'Diwali Grand Lights Festival',
    nameHi: 'दीपावली बंपर सेल उत्सव',
    taglineEn: 'Flat ₹150 Off for divine jumbo organic foxnuts.',
    taglineHi: 'शुद्ध जंबो मखानों पर फ्लैट ₹150 की बंपर छूट का लाभ।',
    colorTheme: 'from-amber-950/40 via-red-950/20 to-zinc-950/70 border-amber-500/20 hover:border-amber-400',
    badgeBg: 'bg-amber-500/10 text-[#D4AF37] border-amber-500/20',
    accentText: 'text-[#D4AF37]'
  }
];

export default function FestiveOffersSection({ language, cartTotal, onApplyCoupon, triggerToast }: FestiveOffersSectionProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);

    // Automatically apply coupon code in parent component App.tsx
    onApplyCoupon(code);
    
    triggerToast(
      language === 'hi'
        ? `कूपन ${code} रिडीम करके आर्डर पर लागू किया गया!` 
        : `Coupon ${code} successfully copied and applied to your current transaction!`,
      'success'
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6" id="festive-offers-full-section">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#D4AF37] animate-pulse" />
            {language === 'hi' ? 'सीमित समय के महा धमाका कूपन' : 'Exclusive Seasonal Vouchers'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            {language === 'hi' ? 'उत्सव ऑफर्स और डिस्काउंट कूपन' : 'Active Festive Campaigns'}
          </h2>
          <p className="text-[#999] text-xs mt-1 max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'बिहार से सीधे प्राप्त शुद्ध जैविक मखानों पर भारी बचत करें। अपने कार्ट मूल्य के अनुसार नीचे दिए गए सक्रिय कूपन कोड का लाभ उठाएं।'
              : 'Save BIG on authentic organic Bihar Makhana. Copy the codes below to instantly apply savings directly to your active makhana bag.'}
          </p>
        </div>
        
        {cartTotal > 0 && (
          <div className="bg-[#121417] border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 font-mono text-[11px] shrink-0">
            <span className="text-[#999]">{language === 'hi' ? 'वर्तमान कार्ट:' : 'Shopping Cart:'}</span>
            <span className="text-[#D4AF37] font-extrabold font-sans text-xs">₹{cartTotal}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch relative">
        {CAMPAIGNS.map((camp) => {
          const isEligible = cartTotal >= camp.minOrder;
          const unmetAmt = camp.minOrder - cartTotal;
          
          return (
            <div
              key={camp.code}
              className={`rounded-2xl p-5 border flex flex-col justify-between bg-gradient-to-b ${camp.colorTheme} transition-all duration-300 relative overflow-hidden group shadow-lg ${
                isEligible ? 'ring-1 ring-[#D4AF37]/20 scale-[1.01]' : 'opacity-85'
              }`}
            >
              {/* Particle Sparkle Accent */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/5 group-hover:scale-150 transition-transform pointer-events-none" />

              <div className="space-y-3 relative z-10">
                {/* Icon Badges */}
                <div className="flex items-center justify-between">
                  <span className="text-2.5xl filter drop-shadow animate-bounce" style={{ animationDuration: '3s' }}>
                    {camp.emoji}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${camp.badgeBg}`}>
                    ₹{camp.minOrder} Min
                  </span>
                </div>

                {/* Campaign Metadata */}
                <div>
                  <h4 className="text-white font-serif font-extrabold text-sm leading-snug group-hover:text-[#D4AF37] transition-colors">
                    {language === 'hi' ? camp.nameHi : camp.nameEn}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal font-sans">
                    {language === 'hi' ? camp.taglineHi : camp.taglineEn}
                  </p>
                </div>
              </div>

              {/* Action coupon box */}
              <div className="mt-5 space-y-3 pt-4 border-t border-white/5 relative z-10">
                <div className="flex items-center justify-between font-sans">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-400 uppercase leading-none font-bold">Discount</span>
                    <span className="text-lg font-serif font-black text-white mt-0.5 flex items-center gap-0.5">
                      ₹{camp.discount} Off
                    </span>
                  </div>
                  
                  {isEligible ? (
                    <span className="text-[8px] font-mono font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                      Unlocked
                    </span>
                  ) : cartTotal > 0 ? (
                    <span className="text-[8.5px] font-mono font-bold text-amber-500 bg-amber-500/5 px-1 py-0.5 rounded">
                      +₹{unmetAmt} more
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(camp.code)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 border cursor-pointer ${
                    copiedCode === camp.code
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-zinc-900 border-white/10 hover:border-[#D4AF37]/50 text-gray-200 hover:text-white'
                  }`}
                >
                  {copiedCode === camp.code ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode === camp.code ? (language === 'hi' ? 'लागू हुआ!' : 'Applied!') : camp.code}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
