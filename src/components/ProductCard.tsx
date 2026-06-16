import React from 'react';
import { Star, ShoppingCart, ShieldCheck, Heart, Sparkles, Bell, Eye } from 'lucide-react';
import { Product } from '../types.ts';
import { getProductLocalization } from '../lib/translations.ts';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  allProducts?: Product[];
  onAddToCart: (p: Product, qty?: number) => void;
  onBuyNow: (p: Product) => void;
  onViewProduct: (p: Product) => void;
  isInWishlist: boolean;
  onToggleWishlist: (id: number) => void;
  language?: 'en' | 'hi';
  isCompared: boolean;
  onToggleCompare: (id: number) => void;
  triggerToast?: (msg: string, type: 'success' | 'err' | 'info') => void;
  showQuickAdd?: boolean;
}

export default function ProductCard({
  product,
  allProducts = [],
  onAddToCart,
  onBuyNow,
  onViewProduct,
  isInWishlist,
  onToggleWishlist,
  language = 'en',
  isCompared,
  onToggleCompare,
  triggerToast,
  showQuickAdd = false
}: ProductCardProps) {
  const getBaseProductName = (name: string): string => {
    return name.replace(/\s*(100g|200g|250g|500g|1kg)\s*$/i, '').trim();
  };

  const baseName = React.useMemo(() => getBaseProductName(product.name), [product.name]);

  const variants = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    // Find all products that share the same base product name
    const matches = allProducts.filter(p => getBaseProductName(p.name) === baseName);
    
    // Sort logically by their weight: 100g < 200g < 250g < 500g < 1kg
    const getWeightNum = (str: string) => {
      if (str.includes("1kg")) return 1000;
      const match = str.match(/(\d+)g/i);
      return match ? parseInt(match[1]) : 0;
    };
    
    return matches.sort((a, b) => getWeightNum(a.name) - getWeightNum(b.name));
  }, [allProducts, baseName]);

  const [selectedVariantId, setSelectedVariantId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (variants.length > 0) {
      const exists = variants.some(v => v.id === selectedVariantId);
      if (!exists) {
        const defaultVariant = variants.find(v => v.name.includes("250g"));
        if (defaultVariant) {
          setSelectedVariantId(defaultVariant.id);
        } else {
          setSelectedVariantId(variants[0].id);
        }
      }
    }
  }, [variants, selectedVariantId]);

  const activeProduct = React.useMemo(() => {
    if (selectedVariantId && allProducts && allProducts.length > 0) {
      const found = allProducts.find(p => p.id === selectedVariantId);
      if (found) return found;
    }
    return product;
  }, [product, selectedVariantId, allProducts]);

  const localized = React.useMemo(() => getProductLocalization(language, activeProduct.name, activeProduct.description), [activeProduct, language]);

  const discountPercent = React.useMemo(() => {
    if (activeProduct.mrp && activeProduct.price && activeProduct.mrp > activeProduct.price) {
      return Math.round(((activeProduct.mrp - activeProduct.price) / activeProduct.mrp) * 100);
    }
    return 0;
  }, [activeProduct.mrp, activeProduct.price]);

  const [isNotified, setIsNotified] = React.useState(() => {
    try {
      return localStorage.getItem(`price_drop_notify_${activeProduct.id}`) === 'true';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      setIsNotified(localStorage.getItem(`price_drop_notify_${activeProduct.id}`) === 'true');
    } catch {}
  }, [activeProduct.id]);

  // Coordinates-based magnifying hover-to-zoom state to let users inspect rich makhana textures
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  // Simple category labeling helper
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'raw-makhana':
      case 'raw': return language === 'hi' ? 'कच्चा मखाना' : 'Raw Makhana';
      case 'flavoured-makhana':
      case 'flavored': return language === 'hi' ? 'स्वादिष्ट मखाना' : 'Flavoured Makhana';
      case 'health-nutrition': return language === 'hi' ? 'स्वास्थ्य और पोषण' : 'Health & Nutrition';
      case 'dry-fruit-mixes': return language === 'hi' ? 'सूखे मेवे मिश्रण' : 'Dry Fruit Mixes';
      case 'gift-packs': return language === 'hi' ? 'उपहार पैक' : 'Gift Packs';
      case 'combo-packs': return language === 'hi' ? 'कॉम्बो पैक' : 'Combo Packs';
      case 'premium-collection': return language === 'hi' ? 'प्रीमियम संग्रह' : 'Premium Collection';
      case 'cashews': return language === 'hi' ? 'काजू' : 'Exotic Cashew';
      case 'almonds': return language === 'hi' ? 'कैलिफ़ोर्निया बादाम' : 'California Almond';
      default: return language === 'hi' ? 'विशेष स्नैक' : 'Farm Choice';
    }
  };

  // Safe image path fallback using a high-quality free domain dry nut/healthy snacks placeholder from Unsplash
  const getProductImage = (item: Product) => {
    if (item.image && (item.image.startsWith('http') || item.image.startsWith('/images/'))) {
      return item.image;
    }
    if (item.id === 1) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop"; // lotus seeds/raw
    if (item.id === 2) return "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop"; // roasted salt
    if (item.id === 3) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60"; // peri peri
    if (item.id === 4) return "https://images.unsplash.com/photo-1486299267070-8382e2144520?w=600&auto=format&fit=crop"; // cheese herbs
    if (item.id === 5) return "https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=600&auto=format&fit=crop"; // pudina punch
    if (item.id === 6) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80"; // salt pepper
    if (item.id === 7) return "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop"; // cashew
    if (item.id === 8) return "https://images.unsplash.com/photo-1543157145-f78c636d023d?w=600&auto=format&fit=crop"; // almond
    return item.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop";
  };

  const getWeightLabel = (name: string) => {
    const match = name.match(/(\d+g|\d+kg)/i);
    return match ? match[0] : name;
  };

  const getCleanTitle = () => {
    return getBaseProductName(localized.name);
  };

  const isBestSeller = React.useMemo(() => {
    return ["Premium Raw Makhana", "Jumbo Size Makhana", "Peri Peri Makhana", "Cheese Makhana"].includes(baseName);
  }, [baseName]);

  const isPopular = React.useMemo(() => {
    return activeProduct.rating >= 4.7 && !isBestSeller;
  }, [activeProduct.rating, isBestSeller]);

  const isHealthy = React.useMemo(() => {
    return (activeProduct.category === 'raw-makhana' || activeProduct.category === 'health-nutrition');
  }, [activeProduct.category]);

  const isHighProtein = React.useMemo(() => {
    return (activeProduct.category === 'health-nutrition');
  }, [activeProduct.category]);

  const isPremiumQual = React.useMemo(() => {
    return (activeProduct.category === 'premium-collection');
  }, [activeProduct.category]);

  const activeBadge = React.useMemo(() => {
    if (isBestSeller) return { label: language === 'hi' ? '🔥 बेस्ट सेलर' : '🔥 Best Seller', color: 'bg-amber-500/95 text-black border-amber-400 font-extrabold' };
    if (isPopular) return { label: language === 'hi' ? '⭐ लोकप्रिय' : '⭐ Popular', color: 'bg-yellow-500/90 text-black border-yellow-300' };
    if (isPremiumQual) return { label: language === 'hi' ? '✨ प्रीमियम क्वालिटी' : '✨ Premium Quality', color: 'bg-purple-600/95 text-white border-purple-400' };
    if (isHighProtein) return { label: language === 'hi' ? '💪 हाई प्रोटीन' : '💪 High Protein', color: 'bg-blue-600/95 text-white border-blue-400' };
    if (isHealthy) return { label: language === 'hi' ? '🌱 हेल्दी चॉइस' : '🌱 Healthy Choice', color: 'bg-emerald-600/95 text-white border-emerald-400' };
    return null;
  }, [isBestSeller, isPopular, isPremiumQual, isHighProtein, isHealthy, language]);

  return (
    <div 
      className="bg-[#121417]/45 hover:bg-[#16181D] rounded-3xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/35 shadow-sm hover:shadow-2xl transition-all duration-300 md:duration-500 group flex flex-col justify-between h-full group/card"
      id={`product-card-${activeProduct.id}`}
    >
      {/* Product Image and overlays with live interactive coordinate-based hover-to-zoom */}
      <div 
        className="relative overflow-hidden aspect-square bg-[#0C0D0E] cursor-zoom-in" 
        onClick={() => onViewProduct(activeProduct)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* Dynamic Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 transition-transform duration-300 group-hover:translate-x-0.5">
          {activeBadge && (
            <div className={`text-[10px] font-extrabold uppercase tracking-widest py-1 px-2.5 rounded-full border shadow-sm ${activeBadge.color}`}>
              {activeBadge.label}
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm border border-red-500">
              <Sparkles size={9} className="animate-pulse" />
              <span>{language === 'hi' ? `बचत ${discountPercent}%` : `Save ${discountPercent}%`}</span>
            </div>
          )}
        </div>

        {/* Wishlist & Quick View action panel */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 transition-all duration-300">
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(activeProduct.id);
            }}
            className={`p-2 rounded-full shadow-md hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer border ${
              isInWishlist 
                ? 'bg-[#D4AF37] text-[#0C0D0E] border-[#D4AF37] hover:bg-[#B48F27]' 
                : 'bg-[#121417]/80 backdrop-blur-sm text-[#D4AF37] border-white/10 hover:bg-[#D4AF37] hover:text-[#0C0D0E]'
            }`}
            aria-label="Save to Wishlist"
            title={language === 'hi' ? 'इच्छा सुरक्षित करें' : 'Add to Wishlist'}
          >
            <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(activeProduct);
            }}
            className="p-2 rounded-full shadow-md hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer border bg-[#121417]/80 backdrop-blur-sm text-[#E0E0E0] border-white/10 hover:bg-white hover:text-black hover:border-white"
            title={language === 'hi' ? 'उत्पाद विवरण' : 'Quick Details'}
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Product image zoom-in on hover */}
        <img
          src={getProductImage(activeProduct)}
          alt={localized.name}
          className="w-full h-full object-cover transition-transform duration-200 ease-out animate-fade-in"
          style={zoomStyle}
          referrerPolicy="no-referrer"
        />

        {/* Low Stock Indicator overlays */}
        {activeProduct.stock < 5 && activeProduct.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 text-[#0C0D0E] text-[8px] font-black uppercase tracking-wider py-0.5 px-2 rounded z-10 shadow-md">
            {language === 'hi' ? `केवल ${activeProduct.stock} उपलब्ध` : `Only ${activeProduct.stock} left`}
          </div>
        )}
      </div>

      {/* Card Content & Details (Unified spacing) */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          
          {/* Subheader category marker */}
          <div className="flex justify-between items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 py-0.5 px-2 rounded-md max-w-[120px] truncate select-none border border-[#D4AF37]/10">
              {getCategoryLabel(activeProduct.category)}
            </span>
          </div>

          {/* Product Title */}
          <h3 
            className="text-[#F0F0F0] font-serif font-extrabold text-base md:text-lg line-clamp-1 group-hover:text-[#D4AF37] transition-colors cursor-pointer tracking-tight"
            onClick={() => onViewProduct(activeProduct)}
          >
            {getCleanTitle()}
          </h3>

          {/* SOCIAL PROOF: ⭐⭐⭐⭐⭐ 4.8/5 based on 1,200+ Reviews */}
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5" id={`product-card-social-proof-${activeProduct.id}`}>
            <span className="text-amber-400 text-xs tracking-tight select-none">⭐⭐⭐⭐⭐</span>
            <span className="text-xs font-bold text-[#F0F0F0] font-sans">
              {(activeProduct.rating || 4.8).toFixed(1)}/5
            </span>
            <span className="text-[10px] text-gray-400 font-sans">
              {language === 'hi' ? '(1,200+ समीक्षाएं)' : 'Based on 1,200+ Reviews'}
            </span>
          </div>

          {/* BIHAR FARMER BADGE: 🌾 Directly Sourced from Bihar Farmers */}
          <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 py-1 px-2.5 rounded-xl text-[9px] text-[#D4AF37] font-semibold uppercase tracking-wider w-fit" id={`product-card-farmer-badge-${activeProduct.id}`}>
            <span>🌾 {language === 'hi' ? 'सीधे बिहार के किसानों से प्राप्त' : 'Directly Sourced from Bihar Farmers'}</span>
          </div>

          {/* NUTRITION HIGHLIGHTS */}
          <div className="grid grid-cols-2 gap-1 px-0.5 pt-1" id={`product-card-nutrition-${activeProduct.id}`}>
            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 bg-white/5 py-1 px-1.5 rounded-lg border border-white/5">
              <span className="text-emerald-500 font-extrabold text-[10px]">✓</span> {language === 'hi' ? 'हाई प्रोटीन' : 'High Protein'}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 bg-white/5 py-1 px-1.5 rounded-lg border border-white/5">
              <span className="text-emerald-500 font-extrabold text-[10px]">✓</span> {language === 'hi' ? 'कम फैट' : 'Low Fat'}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 bg-white/5 py-1 px-1.5 rounded-lg border border-white/5">
              <span className="text-emerald-500 font-extrabold text-[10px]">✓</span> {language === 'hi' ? 'ग्लूटेन मुक्त' : 'Gluten Free'}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 bg-white/5 py-1 px-1.5 rounded-lg border border-white/5">
              <span className="text-emerald-500 font-extrabold text-[10px]">✓</span> {language === 'hi' ? 'कैल्शियम प्रचुर' : 'Rich in Calcium'}
            </span>
          </div>

          {/* Quick Category Compare Button */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <span className="text-[8px] font-bold text-gray-500 tracking-wide uppercase select-none flex items-center gap-1">
              <ShieldCheck size={9} className="text-[#D4AF37]" />
              {language === 'hi' ? 'प्राकृतिक सामग्री' : 'All-Natural'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(activeProduct.id);
              }}
              className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded cursor-pointer transition-all duration-300 border ${
                isCompared 
                  ? 'bg-[#D4AF37] text-[#0C0D0E] border-[#D4AF37]' 
                  : 'bg-white/5 text-[#999] hover:text-white border-white/5 hover:border-white/10'
              }`}
            >
              {isCompared ? (language === 'hi' ? 'तुलना में है' : 'Compared') : (language === 'hi' ? '+ तुलना' : 'Compare')}
            </button>
          </div>

          {/* Dynamic Weight Select Buttons with vertical stabilization */}
          {variants.length > 1 ? (
            <div className="pt-1.5">
              <span className="block text-[9px] text-[#888] uppercase tracking-wider font-extrabold mb-1.5 select-none">
                {language === 'hi' ? 'पैक चुनें:' : 'Select Weight:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => {
                  const weightLabel = getWeightLabel(v.name);
                  const isSelected = v.id === activeProduct.id;
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVariantId(v.id);
                      }}
                      className={`py-1 px-2.5 rounded-lg font-bold text-[10px] transition-all duration-300 select-none cursor-pointer border ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0C0D0E] shadow-sm font-black scale-105' 
                          : 'border-white/5 bg-[#121417]/80 text-[#999] hover:border-white/20 hover:text-white hover:bg-[#1A1D21]'
                      }`}
                      id={`weight-btn-${v.id}`}
                    >
                      {weightLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pt-1.5 h-[41px] flex items-center select-none">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {language === 'hi' ? 'मानक पैक' : 'Standard Pack'}
              </span>
            </div>
          )}
        </div>

        {/* Pricing tag & CTA layout */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
          
          {/* Price line (Dynamic Price) */}
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[#D4AF37] font-sans">
                ₹{activeProduct.price}
              </span>
              {activeProduct.mrp > activeProduct.price && (
                <span className="text-xs text-gray-500 line-through font-medium">
                  ₹{activeProduct.mrp}
                </span>
              )}
            </div>
            <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded">
              Incl. GST
            </span>
          </div>

          {/* DISPLAY SAVINGS: Auto calculated and elegantly styled with sparkles */}
          {activeProduct.mrp > activeProduct.price && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-xl text-emerald-400 font-bold text-xs" id={`product-card-saving-banner-${activeProduct.id}`}>
              <Sparkles size={11} className="animate-pulse text-emerald-400" />
              <span>
                {language === 'hi' 
                  ? `बचत ₹${Math.round(activeProduct.mrp - activeProduct.price)}` 
                  : `Save ₹${Math.round(activeProduct.mrp - activeProduct.price)}`}
              </span>
            </div>
          )}

          {/* Action triggers with micro animations */}
          <div className="grid grid-cols-2 gap-2 pb-0.5">
            <button
              onClick={() => {
                onAddToCart(activeProduct);
                if (triggerToast) {
                  triggerToast(
                    language === 'hi' 
                      ? `${getCleanTitle()} (${getWeightLabel(activeProduct.name)}) बैग में जुड़ गया! ⚡` 
                      : `${getCleanTitle()} (${getWeightLabel(activeProduct.name)}) added to your bag! ⚡`,
                    'success'
                  );
                }
              }}
              className="flex items-center justify-center gap-1 border border-[#D4AF37]/35 hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold py-2.5 px-2 rounded-xl transition-all duration-300 cursor-pointer bg-transparent active:scale-95 select-none"
            >
              <ShoppingCart size={12} strokeWidth={2.5} />
              <span>{language === 'hi' ? 'कार्ट' : 'Add to Bag'}</span>
            </button>
            <button
              onClick={() => onBuyNow(activeProduct)}
              className="bg-[#D4AF37] hover:bg-[#B48F27] text-[#0C0D0E] text-xs font-extrabold py-2.5 px-2 rounded-xl text-center shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer border border-transparent select-none"
            >
              {language === 'hi' ? 'तुरंत खरीदें' : 'Buy Now'}
            </button>
          </div>

          {/* Price drop subscription tracker */}
          {discountPercent <= 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const notifyState = !isNotified;
                setIsNotified(notifyState);
                try {
                  localStorage.setItem(`price_drop_notify_${activeProduct.id}`, String(notifyState));
                } catch (e) {
                  console.error("Failed to write price notification opt-in", e);
                }
                if (triggerToast) {
                  if (notifyState) {
                    triggerToast(
                      language === 'hi'
                        ? `${activeProduct.name} की कीमत गिरने पर हम आपको सूचित करेंगे!`
                        : `We will notify you immediately when the price of ${activeProduct.name} drops!`,
                      'success'
                    );
                  } else {
                    triggerToast(
                      language === 'hi'
                        ? 'कीमत में गिरावट की अधिसूचना रद्द की गई।'
                        : 'Price drop notification request cancelled.',
                      'info'
                    );
                  }
                }
              }}
              className={`w-full relative flex items-center justify-center gap-1.5 border transition-all duration-300 text-[9px] py-1.5 px-2 rounded-xl cursor-pointer select-none ${
                isNotified 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'border-white/5 hover:border-[#D4AF37]/20 text-gray-500 hover:text-white bg-[#121417]/30 hover:bg-[#121417]'
              }`}
              id={`notify-price-drop-${activeProduct.id}`}
            >
              <Bell size={10} className={isNotified ? "animate-bounce text-emerald-400" : "text-gray-500"} />
              <span className="font-bold uppercase tracking-wider">
                {isNotified 
                  ? (language === 'hi' ? 'सूचना सक्रिय' : 'Alert Active') 
                  : (language === 'hi' ? 'मूल्य गिरने पर सूचित करें' : 'Price Alert')}
              </span>
            </button>
          ) : (
            <div className="h-[26px] flex items-center justify-center select-none">
              <span className="text-[8px] font-mono font-bold text-red-400 tracking-wider flex items-center gap-1 animate-pulse">
                🔥 {language === 'hi' ? 'भारी छूट समाप्त होने से पहले खरीदें!' : 'MEGA OFFER - ACT FAST!'}
              </span>
            </div>
          )}

          {/* Sourcing guarantee footer line */}
          <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[9px] text-[#888] font-semibold tracking-wide uppercase">
            <ShieldCheck size={11} className="text-[#D4AF37]" />
            <span>{language === 'hi' ? 'सीधे बिहार के खेतों से' : 'DIRECT FROM BIHAR FARMS'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#16181D] rounded-2xl overflow-hidden border border-white/5 shadow-md flex flex-col justify-between h-[410px] animate-pulse">
      {/* Shimmer Image spacer */}
      <div className="aspect-[4/3] bg-white/5 w-full"></div>

      {/* Details Box */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Chip */}
          <div className="h-3 bg-white/10 rounded w-1/4 mb-3"></div>
          {/* Title */}
          <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
          {/* Description line 1 & 2 */}
          <div className="space-y-1.5 mb-4">
            <div className="h-2.5 bg-white/5 rounded w-full"></div>
            <div className="h-2.5 bg-white/5 rounded w-5/6"></div>
          </div>
        </div>

        <div>
          {/* Price Line */}
          <div className="flex items-baseline gap-2 mb-4">
            <div className="h-4 bg-white/10 rounded w-14"></div>
            <div className="h-3.5 bg-white/5 rounded w-10"></div>
          </div>

          {/* Action triggers skeleton */}
          <div className="grid grid-cols-2 gap-2">
            <div className="h-[38px] bg-white/5 rounded-xl"></div>
            <div className="h-[38px] bg-[#D4AF37]/20 rounded-xl"></div>
          </div>

          {/* Sourcing footer line */}
          <div className="mt-3.5 pt-3 border-t border-white/5 flex justify-center">
            <div className="h-2.5 bg-white/5 rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
