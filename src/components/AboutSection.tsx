import React from 'react';
import { ShieldCheck, Snowflake, Heart, Award, Users, ChevronRight, Leaf } from 'lucide-react';

export default function AboutSection() {
  const chooseReasons = [
    {
      icon: <Users className="text-[#D4AF37]" size={24} />,
      title: "Direct From Bihar Farmers",
      desc: "Sourced directly from native lotus farmers in Darbhanga and Madhubani, offering fair pricing and empowering livelihoods."
    },
    {
      icon: <Award className="text-[#D4AF37]" size={24} />,
      title: "Premium Size & Grade",
      desc: "Every single batch of our phool makhana is carefully graded to secure the largest, crispest, and brightest grade seeds."
    },
    {
      icon: <Snowflake className="text-[#D4AF37]" size={24} />,
      title: "Handpicked Selection",
      desc: "Meticulously manually cleaned and sorted by regional experts to remove hard black seed shells and imperfections."
    },
    {
      icon: <Leaf className="text-[#D4AF37]" size={24} />,
      title: "Rich In Vegan Protein",
      desc: "An organic superfood that serves as a highly nutrient-dense source of plant-based protein, calcium, and minerals."
    },
    {
      icon: <ShieldCheck className="text-[#D4AF37]" size={24} />,
      title: "Zero Preservatives",
      desc: "Absolutely no chemical additives, artificial flavors, msg, or hydrogenated trans fats. Simply raw farm-fresh purity."
    },
    {
      icon: <Heart className="text-[#D4AF37]" size={24} />,
      title: "Fast Pan-India Delivery",
      desc: "Expertly vacuum sealed and dispatched from Bihar warehouses directly to your doorsteps anywhere in India."
    }
  ];

  return (
    <section className="py-16 bg-[#0C0D0E]" id="about-us-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sourcing Narrative Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl z-0"></div>
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-xl aspect-[4/3] bg-[#121417]">
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop" 
                alt="Bihar Lotus Farming Ponds" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Direct from farmers floating badge */}
            <div className="absolute -bottom-6 right-6 bg-[#121417] border border-[#D4AF37]/20 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-[#0C0D0E] flex items-center justify-center font-bold text-lg font-serif">
                ANF
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37]">Our Pride</span>
                <h5 className="text-xs font-bold text-white font-serif m-0">100% Native Bihar Heritage</h5>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#D4AF37]/20">
              <Leaf size={12} className="text-[#D4AF37]" />
              <span>Authentic Sourcing story</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#D4AF37] tracking-tight leading-tight">
              Honoring Bihar's Rich Lotus Harvesting Ponds
            </h2>
            
            <p className="text-[#999] text-sm leading-relaxed">
              Makhana (Foxnuts) is not just a healthy superfood snack; it is a cultural legacy cultivated in the pristine wetland ecosystems of North Bihar. At <strong>Aditya Nutra Farm</strong>, we bridge the gap between hard-working rural lotus farmers and healthy homes across India.
            </p>

            <p className="text-[#999] text-sm leading-relaxed">
              Our founders envisioned a direct empowerment model that rewards agricultural dedication while preserving freshness. By roasting and seasoning the lotus seeds within days of being harvested from Bihar ponds, we preserve the highest level of crunchy freshness, antioxidants, and pristine flavor.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#D4AF37] font-semibold">
              <div className="flex items-center gap-2">
                <ChevronRight className="text-[#D4AF37]" size={16} />
                <span>Fair-pricing trade metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="text-[#D4AF37]" size={16} />
                <span>Empowering 500+ Local Harvesters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Why Choose Aditya Nutra Farm */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block mb-1">Our Pillars</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">Why Savor Aditya Nutra Farm?</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {chooseReasons.map((reason, idx) => (
            <div 
              key={idx} 
              className="bg-[#121417] p-6 rounded-2xl border border-white/5 shadow-md hover:border-[#D4AF37]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1A1D21] flex items-center justify-center mb-4 text-[#D4AF37]">
                {reason.icon}
              </div>
              <h4 className="text-white font-serif font-bold text-base mb-2">{reason.title}</h4>
              <p className="text-[#999] text-xs leading-relaxed">{reason.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
