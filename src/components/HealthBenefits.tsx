import React from 'react';
import { Sparkles, Heart, Activity, ShieldCheck, Flame, Scale } from 'lucide-react';

export default function HealthBenefits() {
  const benefits = [
    {
      icon: <Scale className="text-[#D4AF37]" size={24} />,
      title: "Weight Management helper",
      desc: "Low-calorie, low-glycemic, and fiber-rich, making it the ultimate low-fat crunchy alternative to potato chips that keeps you fuller for longer."
    },
    {
      icon: <Activity className="text-[#D4AF37]" size={24} />,
      title: "High Protein & Energy snack",
      desc: "Bursting with clean, allergen-free plant based protein, essential for muscle recovery, physical stamina, cell tissue repairs, and morning boost."
    },
    {
      icon: <ShieldCheck className="text-[#D4AF37]" size={24} />,
      title: "100% Gluten-free snack",
      desc: "Naturally harvested with absolutely zero gluten allergens, perfect for coeliacs, low-carbohydrate macro diets, or healthy child snacks."
    },
    {
      icon: <Sparkles className="text-[#D4AF37]" size={24} />,
      title: "Antioxidant Powerhouse",
      desc: "Contains natural compounds like kaempferol that protect body cells against oxidative age damage, inflammation, and cellular fatigue."
    },
    {
      icon: <Heart className="text-[#D4AF37]" size={24} />,
      title: "Heart & Kidneys Friendly",
      desc: "Naturally high in potassium and magnesium while extremely low in sodium and cholesterol, perfect to manage cardiovascular blood pressure."
    },
    {
      icon: <Flame className="text-[#D4AF37]" size={24} />,
      title: "Traditional Fasting nutrient",
      desc: "An universally approved energy snack for sacred religious fasts (Vrats like Navratri, Shivratri) supporting physical endurance."
    }
  ];

  return (
    <section className="py-16 bg-[#121417]" id="health-benefits-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block mb-1">Aesthetic Superfood</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Nutritional Health Secrets of Makhana</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded"></div>
          <p className="text-sm text-[#999] mt-3 leading-relaxed">Loved by dietitians and ancestral wisdom alike, Bihar foxnuts offer premium health ratios.</p>
        </div>

        {/* Bento Grid Panel of benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((b, idx) => (
            <div 
              key={idx} 
              className="bg-[#16181D] p-6 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 hover:shadow-md transition-all duration-300 flex gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#1A1D21] flex items-center justify-center shrink-0 shadow-inner text-[#D4AF37]">
                {b.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-serif font-bold text-base leading-snug">{b.title}</h4>
                <p className="text-[#999] text-xs leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nutritional comparison quick highlight */}
        <div className="mt-14 p-6 sm:p-8 bg-[#0C0D0E] border border-white/10 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between max-w-4xl mx-auto">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif font-bold text-white text-base">Did you know?</h4>
            <p className="text-[#999] text-xs max-w-md leading-relaxed">Makhana contains significantly more antioxidants and essential minerals than popcorn, with almost 60% less saturated fats. Truly an ancient guilt-free crunch!</p>
          </div>
          <div className="flex gap-4 shrink-0 font-serif font-extrabold text-[#D4AF37]">
            <div className="text-center bg-[#16181D] py-2 px-4 rounded-xl border border-white/10 shadow-sm">
              <span className="block text-2xl font-black">₹0</span>
              <span className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider">Trans Fat</span>
            </div>
            <div className="text-center bg-[#16181D] py-2 px-4 rounded-xl border border-white/10 shadow-sm">
              <span className="block text-2xl font-black">9g</span>
              <span className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider">Fiber / 100g</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
