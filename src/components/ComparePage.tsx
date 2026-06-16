import React from 'react';
import { Trash2, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types.ts';
import { getUiTranslation, getProductLocalization } from '../lib/translations.ts';

interface ComparePageProps {
  comparedIds: number[];
  products: Product[];
  language: 'en' | 'hi';
  onRemoveFromCompare: (id: number) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product) => void;
}

// Dynamically generate realistic organic nutritional facts based on product categories
const getNutritionalFacts = (category: string, name: string) => {
  const normName = name.toLowerCase();
  
  if (category === 'almonds') {
    return {
      energy: '579 kcal',
      protein: '21.1 g',
      calcium: '264 mg',
      dietaryFiber: '12.5 g',
      fat: '49.9 g',
    };
  }
  if (category === 'cashews') {
    return {
      energy: '553 kcal',
      protein: '18.2 g',
      calcium: '37 mg',
      dietaryFiber: '3.3 g',
      fat: '43.8 g',
    };
  }
  if (normName.includes('raw') || category === 'raw') {
    return {
      energy: '347 kcal',
      protein: '9.7 g',
      calcium: '60 mg',
      dietaryFiber: '7.6 g',
      fat: '0.1 g',
    };
  }
  
  // Default roasted makhana varieties
  return {
    energy: '382 kcal',
    protein: '10.5 g',
    calcium: '82 mg',
    dietaryFiber: '6.4 g',
    fat: '1.2 g',
  };
};

export default function ComparePage({
  comparedIds,
  products,
  language,
  onRemoveFromCompare,
  onClearCompare,
  onAddToCart,
}: ComparePageProps) {
  // Get full products matching the compared ids
  const comparedProducts = products.filter((p) => comparedIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 font-sans min-h-[500px]" id="compare-view-container">
      {/* Title block */}
      <div className="border-b border-white/5 pb-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[#D4AF37] block font-extrabold uppercase tracking-widest text-[10px] sm:text-xs">
            {getUiTranslation(language, 'compare')}
          </span>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight mt-1">
            {getUiTranslation(language, 'compareTitle')}
          </h1>
          <p className="text-[#999] text-xs sm:text-sm mt-1 leading-relaxed">
            {getUiTranslation(language, 'comparisonLimit')}
          </p>
        </div>

        {comparedProducts.length > 0 && (
          <button
            onClick={onClearCompare}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2 px-4 text-xs font-semibold cursor-pointer transition-colors shrink-0"
          >
            {language === 'hi' ? 'सभी तुलनाएं हटाएं' : 'Clear All Comparison'}
          </button>
        )}
      </div>

      {comparedProducts.length === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto" id="compare-empty-state">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mx-auto mb-4">
            📊
          </div>
          <p className="text-[#999] text-sm leading-relaxed font-semibold">
            {language === 'hi' 
              ? 'तुलना करने के लिए कोई उत्पाद नहीं चुना गया है। दुकान पेज पर जाएँ और उत्पादों को जोड़ने के लिए तुलना बटन पर क्लिक करें।' 
              : 'No products selected for comparison. Browse the shop and click the Compare button on items to add them here.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm" id="compare-table-wrapper">
          <table className="w-full text-left border-collapse table-fixed min-w-[650px] sm:min-w-[800px]" id="compare-table">
            <thead>
              <tr className="border-b border-white/10 bg-[#121417]">
                <th className="p-4 sm:p-5 text-xs font-bold text-[#888] uppercase tracking-wider w-1/4">
                  {language === 'hi' ? 'विशेषताएं' : 'Specifications'}
                </th>
                {comparedProducts.map((prod) => {
                  const locale = getProductLocalization(language, prod.name, prod.description);
                  return (
                    <th key={prod.id} className="p-4 sm:p-5 relative text-white w-[25%] font-sans">
                      <button
                        onClick={() => onRemoveFromCompare(prod.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none p-1 cursor-pointer"
                        title={getUiTranslation(language, 'removeFromCompare')}
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="space-y-3 pt-3">
                        <div className="aspect-square rounded-xl overflow-hidden bg-[#0C0D0E] border border-white/10 w-24 sm:w-32 mx-auto">
                          <img
                            src={prod.image}
                            alt={locale.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block mb-1">
                            {getUiTranslation(language, prod.category as any)}
                          </span>
                          <span className="font-serif font-bold text-sm sm:text-base text-white block line-clamp-2 h-12 leading-tight">
                            {locale.name}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
                {/* Pad empty slots up to 4 columns total (1 attributes + 3 comparative columns) */}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <th key={`empty-th-${i}`} className="p-4 sm:p-5 text-gray-600 italic text-center text-xs font-medium border-l border-white/5 bg-[#121417]/30">
                    {language === 'hi' ? 'तुलना स्लॉट खाली' : 'Empty slot'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs text-[#CCC] font-sans">
              {/* MRP Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-bold text-[#888]">{getUiTranslation(language, 'mrpWord')}</td>
                {comparedProducts.map((prod) => (
                  <td key={prod.id} className="p-4 font-bold text-gray-500 text-center line-through">₹{prod.mrp}</td>
                ))}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-mrp-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Price Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-bold text-[#888]">{getUiTranslation(language, 'priceWord')}</td>
                {comparedProducts.map((prod) => (
                  <td key={prod.id} className="p-4 font-black text-white text-center text-sm font-mono">₹{prod.price}</td>
                ))}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-price-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-bold text-[#888]">{getUiTranslation(language, 'ratingWord')}</td>
                {comparedProducts.map((prod) => (
                  <td key={prod.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                      <Star size={13} fill="currentColor" stroke="none" />
                      <span>{prod.rating} / 5.0</span>
                    </div>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-rating-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Nutritional block header row */}
              <tr className="border-b border-white/10 bg-[#121417]/50 font-bold">
                <td colSpan={4} className="p-3 text-[#D4AF37] uppercase tracking-wider text-[10px] sm:text-xs">
                  {getUiTranslation(language, 'nutrition')}
                </td>
              </tr>

              {/* Energy Fact Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-semibold text-[#888] pl-6">⚡ {getUiTranslation(language, 'energy')}</td>
                {comparedProducts.map((prod) => {
                  const facts = getNutritionalFacts(prod.category, prod.name);
                  return (
                    <td key={prod.id} className="p-4 text-center font-bold text-white font-mono">{facts.energy}</td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-energy-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Protein Fact Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-semibold text-[#888] pl-6">💪 {getUiTranslation(language, 'protein')}</td>
                {comparedProducts.map((prod) => {
                  const facts = getNutritionalFacts(prod.category, prod.name);
                  return (
                    <td key={prod.id} className="p-4 text-center font-bold text-white font-mono">{facts.protein}</td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-protein-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Calcium Fact Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-semibold text-[#888] pl-6">🦷 {getUiTranslation(language, 'calcium')}</td>
                {comparedProducts.map((prod) => {
                  const facts = getNutritionalFacts(prod.category, prod.name);
                  return (
                    <td key={prod.id} className="p-4 text-center font-semibold font-mono">{facts.calcium}</td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-calcium-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Dietary Fiber Fact Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="p-4 font-semibold text-[#888] pl-6">🌾 {language === 'hi' ? 'डाइट्री फाइबर' : 'Dietary Fiber'}</td>
                {comparedProducts.map((prod) => {
                  const facts = getNutritionalFacts(prod.category, prod.name);
                  return (
                    <td key={prod.id} className="p-4 text-center font-semibold font-mono">{facts.dietaryFiber}</td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-fiber-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Fat Fact Row */}
              <tr className="border-b border-white/10 hover:bg-white/5 transition-all">
                <td className="p-4 font-semibold text-[#888] pl-6">🧈 {getUiTranslation(language, 'fat')}</td>
                {comparedProducts.map((prod) => {
                  const facts = getNutritionalFacts(prod.category, prod.name);
                  return (
                    <td key={prod.id} className="p-4 text-center font-semibold font-mono">{facts.fat}</td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-fat-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>

              {/* Add to Cart button row */}
              <tr className="bg-[#121417]/40">
                <td className="p-4 font-bold text-[#888]">{language === 'hi' ? 'जल्दी ख़रीदें' : 'Action'}</td>
                {comparedProducts.map((prod) => (
                  <td key={prod.id} className="p-4 text-center">
                    <button
                      onClick={() => onAddToCart(prod)}
                      className="bg-[#D4AF37] hover:bg-[#B48F27] active:scale-95 text-[#0C0D0E] font-bold py-2 px-3 sm:px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mx-auto cursor-pointer border-none"
                    >
                      <ShoppingCart size={13} />
                      <span>{getUiTranslation(language, 'addToBag')}</span>
                    </button>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, i) => (
                  <td key={`empty-actions-${i}`} className="p-4 bg-[#121417]/10"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
