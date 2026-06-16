import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Award, Ticket, Sparkles } from 'lucide-react';

interface LiveActivityBannerProps {
  language: 'en' | 'hi';
}

interface ActivityItem {
  id: number;
  icon: React.ReactNode;
  bgClass: string;
  en: string;
  hi: string;
  timeEn: string;
  timeHi: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    icon: <ShoppingBag size={14} className="text-amber-500" />,
    bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    en: 'A customer in Mumbai just ordered 2kg of Classic Slow-Roasted Phool Makhana 🍿',
    hi: 'मुंबई के एक ग्राहक ने अभी 2 किलो क्लासिक स्लो-रोस्टेड फूल मखाना का ऑर्डर दिया! 🍿',
    timeEn: 'Just now',
    timeHi: 'अभी-अभी'
  },
  {
    id: 2,
    icon: <Sparkles size={14} className="text-yellow-400" />,
    bgClass: 'bg-yellow-400/10 border-yellow-400/25 text-yellow-300',
    en: 'Someone in New Delhi purchased Chatpata Mint Pudina Gourmet Foxnuts! 🌿',
    hi: 'नई दिल्ली के एक प्रशंसक ने अभी चटपटा पुदीना रोस्टेड मखाना खरीदे! 🌿',
    timeEn: '2 mins ago',
    timeHi: '2 मिनट पहले'
  },
  {
    id: 3,
    icon: <Award size={14} className="text-emerald-400" />,
    bgClass: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300',
    en: 'A loyalty member in Patna, Bihar has unlocked the Silver Savorer Tier! 🎖️',
    hi: 'पटना, बिहार के एक लॉयल्टी सदस्य ने अभी सिल्वर सेवरर टियर अनलॉक किया! 🎖️',
    timeEn: '5 mins ago',
    timeHi: '5 मिनट पहले'
  },
  {
    id: 4,
    icon: <Ticket size={14} className="text-rose-400" />,
    bgClass: 'bg-rose-400/10 border-rose-400/25 text-rose-300',
    en: 'A makhana lover in Bangalore redeemed 150 points for a ₹200 OFF Coupon! 🎟️',
    hi: 'बेंगलुरु के एक ग्राहक ने डिस्काउंट कूपन के लिए 150 पॉइंट्स भुनाए! 🎟️',
    timeEn: '12 mins ago',
    timeHi: '12 मिनट पहले'
  },
  {
    id: 5,
    icon: <Star size={14} className="text-[#D4AF37]" />,
    bgClass: 'bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#D4AF37]',
    en: 'Verified Buyer in Pune left a 5-star review: "Superior size and absolute crunch!" ⭐',
    hi: 'पुणे के सत्यापित खरीदार ने 5-स्टार समीक्षा छोड़ी: "सर्वश्रेष्ठ आकार और लाजवाब करारापन!" ⭐',
    timeEn: '18 mins ago',
    timeHi: '18 मिनट पहले'
  },
  {
    id: 6,
    icon: <ShoppingBag size={14} className="text-[#D4AF37]" />,
    bgClass: 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]',
    en: 'A health enthusiast in Chennai just placed an order for Roasted Himalayan Salt Almonds! 🍪',
    hi: 'चेन्नई के एक स्वास्थ्य प्रेमी ने हिमालयन साल्ट रोस्टेड बादाम का ऑर्डर दिया! 🍪',
    timeEn: '25 mins ago',
    timeHi: '25 मिनट पहले'
  },
  {
    id: 7,
    icon: <Award size={14} className="text-[#D4AF37]" />,
    bgClass: 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]',
    en: 'A grand chef in Hyderabad upgraded to the premium Gold Maharaja Elite status! 👑',
    hi: 'हैदराबाद के एक भव्य शेफ ने प्रीमियम गोल्ड महाराजा इलाइट दर्जा हासिल किया! 👑',
    timeEn: '32 mins ago',
    timeHi: '32 मिनट पहले'
  }
];

export default function LiveActivityBanner({ language }: LiveActivityBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentActivity = ACTIVITIES[index];

  return (
    <div 
      className="w-full flex justify-center py-2 relative z-20 min-h-[44px]"
      id="live-activity-banner-root"
    >
      <div className="max-w-2xl w-full px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 border rounded-full text-xs font-medium shadow-md backdrop-blur-md mx-auto max-w-full w-fit flex-nowrap min-w-0 ${currentActivity.bgClass}`}
            id={`live-activity-pill-${currentActivity.id}`}
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black/10 shrink-0">
              {currentActivity.icon}
            </span>
            <span className="font-sans text-left tracking-wide leading-tight truncate min-w-0 flex-1">
              {language === 'hi' ? currentActivity.hi : currentActivity.en}
            </span>
            <span className="text-[9px] font-mono opacity-60 uppercase tracking-wider shrink-0 bg-black/10 px-1.5 py-0.5 sm:px-2 rounded-full">
              {language === 'hi' ? currentActivity.timeHi : currentActivity.timeEn}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
