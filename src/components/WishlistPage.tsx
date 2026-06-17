import React from 'react';
import { ShoppingCart, Heart, Trash2, ArrowRight, Share2 } from 'lucide-react';
import { Product } from '../types.ts';
import { getUiTranslation, getProductLocalization } from '../lib/translations.ts';

interface WishlistPageProps {
  wishlist: number[];
  products: Product[];
  language: 'en' | 'hi';
  onRemoveFromWishlist: (id: number) => void;
  onMoveToCart: (product: Product) => void;
  onNavigateToShop: () => void;
  triggerToast?: (message: string, type?: 'success' | 'err' | 'info') => void;
}

export default function WishlistPage({
  wishlist,
  products,
  language,
  onRemoveFromWishlist,
  onMoveToCart,
  onNavigateToShop,
  triggerToast,
}: WishlistPageProps) {
  // Filter only products present in wishlist state
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleShareWishlist = () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?sharedWishlist=${wishlist.join(',')}`;
      navigator.clipboard.writeText(shareUrl);
      if (triggerToast) {
        triggerToast(
          language === 'hi' 
            ? 'विशलिस्ट लिंक क्लिपबोर्ड पर कॉपी हो गया! इसे दोस्तों के साथ शेयर करें।' 
            : 'Wishlist share link copied to clipboard! Share it with friends and family.',
          'success'
        );
      }
    } catch (err) {
      console.error("Failed to copy wishlist URL to clipboard", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 font-sans min-h-[500px]" id="wishlist-view-container">
      {/* Page Title Header */}
      <div className="border-b border-white/5 pb-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[#D4AF37] block font-extrabold uppercase tracking-widest text-[10px] sm:text-xs">
            {getUiTranslation(language, 'savedItems')}
          </span>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Heart size={26} fill="#E11D48" stroke="#E11D48" className="animate-pulse" />
            <span>{getUiTranslation(language, 'wishlist')}</span>
          </h1>
        </div>

        {wishlistProducts.length > 0 && (
          <button
            onClick={handleShareWishlist}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:opacity-90 active:scale-95 text-neutral-950 font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm shadow-md cursor-pointer border-none transition-all shrink-0 self-start sm:self-center"
            id="share-wishlist-btn"
            title="Generate & copy shareable wishlist URL"
          >
            <Share2 size={14} />
            <span>{language === 'hi' ? 'विशलिस्ट शेयर करें' : 'Share Wishlist'}</span>
          </button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 space-y-6 max-w-md mx-auto" id="wishlist-empty-state">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mx-auto">
            <Heart size={24} />
          </div>
          <p className="text-[#999] text-sm leading-relaxed font-semibold">
            {getUiTranslation(language, 'wishlistEmpty')}
          </p>
          <button
            onClick={onNavigateToShop}
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B48F27] active:scale-95 text-[#0C0D0E] font-bold py-3 px-8 rounded-xl transition-all cursor-pointer border-none"
          >
            <span>{getUiTranslation(language, 'shop')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8" id="wishlist-grid">
          {wishlistProducts.map((prod) => {
            const locale = getProductLocalization(language, prod.name, prod.description);
            return (
              <div
                key={prod.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 shadow-lg overflow-hidden transition-all flex flex-col justify-between group"
                id={`wishlist-item-card-${prod.id}`}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-[#121417]">
                  <img
                    src={prod.image}
                    alt={locale.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category overlay */}
                  <span className="absolute top-3 left-3 bg-[#0C0D0E]/80 text-[#D4AF37] border border-[#D4AF37]/20 text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md">
                    {getUiTranslation(language, prod.category as any)}
                  </span>
                </div>

                {/* Info and action package */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-white font-serif font-bold text-base line-clamp-1 group-hover:text-[#D4AF37] transition-all">
                      {locale.name}
                    </h3>
                    <p className="text-[#999] text-xs line-clamp-2 leading-relaxed h-10 font-medium">
                      {locale.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-500 line-through font-bold">
                      ₹{prod.mrp}
                    </span>
                    <span className="text-lg text-white font-black font-mono">
                      ₹{prod.price}
                    </span>
                  </div>

                  {/* Actions Area */}
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    {/* Move to bag */}
                    <button
                      onClick={() => onMoveToCart(prod)}
                      className="flex-grow bg-[#D4AF37] hover:bg-[#B48F27] text-[#0C0D0E] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
                    >
                      <ShoppingCart size={13} />
                      <span>{getUiTranslation(language, 'moveToCart')}</span>
                    </button>

                    {/* Delete item */}
                    <button
                      onClick={() => onRemoveFromWishlist(prod.id)}
                      className="bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-white/10 hover:border-red-500/20 p-2.5 rounded-xl transition-all cursor-pointer"
                      title={getUiTranslation(language, 'removeFromWishlist')}
                      aria-label="Remove from Wishlist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
