import React from 'react';
import { Search, ShoppingCart, User, MapPin, Store, Leaf, LogOut, Menu, X, ShieldAlert, Globe, Heart } from 'lucide-react';
import { User as DBUser, CartItem } from '../types.ts';
import { getUiTranslation } from '../lib/translations.ts';

interface HeaderProps {
  user: DBUser | null;
  onLogin: () => void;
  onLogout: () => void;
  cart: CartItem[];
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  wishlistCount: number;
  theme?: 'light' | 'dark';
}

export default function Header({
  user,
  onLogin,
  onLogout,
  cart,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onOpenAdmin,
  language,
  onToggleLanguage,
  wishlistCount,
  theme = 'dark'
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);
  const profileCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleProfileMouseEnter = () => {
    if (profileCloseTimeoutRef.current) {
      clearTimeout(profileCloseTimeoutRef.current);
      profileCloseTimeoutRef.current = null;
    }
    setIsProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    if (profileCloseTimeoutRef.current) {
      clearTimeout(profileCloseTimeoutRef.current);
    }
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 2500);
  };

  // Click outside to immediately close user profile dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isProfileDropdownOpen && profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (profileCloseTimeoutRef.current) {
        clearTimeout(profileCloseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${theme === 'light' ? 'bg-[#FAF8F5]/95 shadow-amber-900/5' : 'bg-[#121417]/95'} backdrop-blur-md shadow-md border-b ${theme === 'light' ? 'border-amber-900/10' : 'border-[#D4AF37]/20'}`}>
      {/* Top bar with Bihar farm message */}
      <div className={`transition-colors duration-300 ${theme === 'light' ? 'bg-amber-50 text-amber-900 border-b border-amber-950/10' : 'bg-[#0C0D0E] text-[#D4AF37] border-b border-white/5'} text-xs py-1.5 px-4 flex justify-between items-center font-medium tracking-wide`}>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-[#D4AF37]" />
          <span>{language === 'hi' ? 'सीधे बिहार के मिथिला कमल तालाबों से लाया गया' : 'Sourced directly from lotus ponds in Bihar, India'}</span>
        </div>
        <div className={`hidden sm:flex items-center gap-4 text-[11px] ${theme === 'light' ? 'text-amber-800' : 'text-[#CCC]'}`}>
          <span>{language === 'hi' ? '⚡ कैश ऑन डिलीवरी उपलब्ध है' : '⚡ Cash On Delivery available'}</span>
          <span>•</span>
          <span>{language === 'hi' ? '📦 पूरे भारत में तेज़ डिलीवरी' : '📦 Fast delivery across India'}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => { setActiveTab('home'); }} 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            id="header-brand-logo"
          >
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0C0D0E] font-bold text-xl italic shadow-inner group-hover:bg-[#B48F27] transition-colors">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#D4AF37] group-hover:text-white transition-colors font-serif m-0 leading-tight">
                ADITYA NUTRA FARM
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-[#888] font-medium m-0 flex items-center gap-1">
                <Leaf size={10} className="text-[#D4AF37]" /> {language === 'hi' ? 'प्रीमियम मिथिला मखाना' : 'Premium Bihar Makhana'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center gap-6 xl:gap-8 font-medium ${theme === 'light' ? 'text-amber-900' : 'text-[#CCC]'} text-sm`}>
            {[
              { id: 'home', label: getUiTranslation(language, 'home') },
              { id: 'shop', label: getUiTranslation(language, 'ourProducts') },
              { id: 'about', label: getUiTranslation(language, 'ourStory') },
              { id: 'compare', label: getUiTranslation(language, 'compare') },
              { id: 'faq', label: getUiTranslation(language, 'faqs') },
              { id: 'contact', label: getUiTranslation(language, 'contactUs') },
              { id: 'track-order', label: getUiTranslation(language, 'trackOrder') }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`py-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === link.id 
                    ? 'border-[#D4AF37] text-[#D4AF37] font-semibold' 
                    : `border-transparent ${theme === 'light' ? 'text-[#5C4D3C] hover:text-[#2C2115]' : 'text-[#CCC] hover:text-white'}`
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Search bar, Profile, and Cart */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-1 max-w-md lg:max-w-xs xl:max-w-sm justify-end">
            {/* Live Search Input */}
            <div className="relative w-full max-w-[155px] sm:max-w-xs group hidden sm:block">
              <input
                type="text"
                placeholder={getUiTranslation(language, 'searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'shop') setActiveTab('shop');
                }}
                className={`w-full ${theme === 'light' ? 'bg-white hover:bg-amber-50/50 border-amber-900/15 text-amber-950 placeholder-amber-900/40' : 'bg-[#1A1D21] hover:bg-[#23262B] border-white/10 text-[#F0F0F0] placeholder-[#888]/80'} border focus:border-[#D4AF37]/50 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none transition-all`}
              />
              <Search className="absolute left-3 top-2 text-[#888] group-focus-within:text-[#D4AF37]" size={14} />
            </div>

            {/* Language Toggle Switcher Button */}
            <button
              onClick={onToggleLanguage}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border ${theme === 'light' ? 'border-amber-900/15 bg-white hover:bg-amber-50 text-amber-950' : 'border-white/10 bg-[#1A1D21] hover:bg-[#23262B] text-[#CCC] hover:text-white'} text-xs font-semibold transition-all cursor-pointer select-none shrink-0 animate-pulse hover:animate-none`}
              title={language === 'en' ? 'Switched to English. Click for हिन्दी' : 'हिन्दी पर स्विच किया गया। English के लिए क्लिक करें'}
            >
              <Globe size={13} className="text-[#D4AF37]" />
              <span className="font-mono leading-none tracking-wider text-[11px] font-bold">{language === 'en' ? 'HI' : 'EN'}</span>
            </button>

            {/* Admin trigger button if role === admin */}
            {user && user.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors shrink-0 cursor-pointer"
                title="Admin Control Center"
              >
                <Store size={14} />
                <span className="hidden md:inline">Console</span>
              </button>
            )}

            {/* Auth / Account Button */}
            {user ? (
              <div 
                ref={profileDropdownRef}
                className="relative flex items-center gap-1.5"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
                id="header-user-badge-dropdown"
              >
                <div 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer py-1 select-none"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || "User"}
                      className="w-8 h-8 rounded-full border border-[#D4AF37]/30 transition-all hover:border-[#D4AF37]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div 
                      className={`w-8 h-8 rounded-full ${theme === 'light' ? 'bg-white border-amber-900/20 text-amber-900' : 'bg-[#1A1D21] border-[#D4AF37]/30 text-[#D4AF37]'} border flex items-center justify-center font-bold text-sm hover:border-[#D4AF37] transition-all`}
                    >
                      {user.fullName ? user.fullName[0].toUpperCase() : <User size={14} />}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col text-left text-xs">
                    <span className={`font-semibold ${theme === 'light' ? 'text-amber-950' : 'text-[#F0F0F0]'} truncate max-w-[80px]`}>
                      {user.fullName?.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-[#888] font-medium leading-none mt-0.5">
                      {language === 'hi' ? 'मेरा खाता ▼' : 'My Account ▼'}
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu - Nested safely, not raw on the screen */}
                {isProfileDropdownOpen && (
                  <div className={`absolute right-0 top-full mt-1 w-48 rounded-2xl shadow-xl border p-2 transition-all duration-200 animate-fade-in ${
                    theme === 'light' 
                      ? 'bg-white border-amber-900/10 text-amber-950' 
                      : 'bg-[#121417] border-white/10 text-white'
                  }`} id="profile-hover-menu">
                    <div className="px-3 py-1.5 border-b border-white/5 mb-1.5">
                      <span className="block text-[10px] text-[#888] uppercase font-bold tracking-wider">{language === 'hi' ? 'नमस्ते' : 'Welcome'}</span>
                      <span className="block text-xs font-bold truncate text-[#D4AF37]">{user.fullName}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('user-profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-transparent border-none ${
                        activeTab === 'user-profile' 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                          : 'hover:bg-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      👤 {language === 'hi' ? 'मेरा खाता और ऑर्डर्स' : 'My Profile & Orders'}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('wishlist');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-transparent border-none ${
                        activeTab === 'wishlist' 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                          : 'hover:bg-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      ❤️ {language === 'hi' ? 'मेरी विशलिस्ट' : 'My Saved Wishlist'}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('compare');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-transparent border-none ${
                        activeTab === 'compare' 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                          : 'hover:bg-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      ⚖️ {language === 'hi' ? 'तुलना काउंटर' : 'Compare Varieties'}
                    </button>

                    <div className="border-t border-white/5 my-1.5 pt-1.5">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-none flex items-center gap-1.5"
                      >
                        <LogOut size={12} stopColor="currentColor" />
                        {getUiTranslation(language, 'logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 text-[#0C0D0E] hover:bg-[#B48F27] bg-[#D4AF37] border border-transparent rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <User size={13} />
                <span>{getUiTranslation(language, 'signIn')}</span>
              </button>
            )}

            {/* Wishlist Heart Button */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`relative p-2 transition-colors cursor-pointer bg-transparent border-none shrink-0 ${
                activeTab === 'wishlist' ? 'text-red-500' : 'text-[#D4AF37] hover:text-red-500'
              }`}
              aria-label="View Saved Wishlist"
              title={getUiTranslation(language, 'wishlist')}
            >
              <Heart size={21} fill={activeTab === 'wishlist' || wishlistCount > 0 ? "currentColor" : "none"} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-[#121417] shadow-md animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon with sticky counter badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-[#D4AF37] hover:text-[#B48F27] transition-colors cursor-pointer bg-transparent border-none shrink-0"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-[#121417] animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#D4AF37] hover:text-[#B48F27] focus:outline-none bg-transparent border-none shrink-0"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden ${theme === 'light' ? 'bg-[#FAF8F5] border-t border-amber-900/10' : 'bg-[#121417] border-t border-white/10'} py-3 px-4 shadow-inner space-y-3`}>
          {/* Mobile search bar */}
          <div className="relative w-full group">
            <input
              type="text"
              placeholder={getUiTranslation(language, 'searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'shop') setActiveTab('shop');
              }}
              className={`w-full ${theme === 'light' ? 'bg-white text-amber-950 border-amber-900/15' : 'bg-[#1A1D21] border-white/10 text-[#F0F0F0]'} border rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none`}
            />
            <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
          </div>

          <div className={`flex flex-col gap-2 font-medium ${theme === 'light' ? 'text-amber-950/80' : 'text-[#CCC]'}`}>
            {[
              { id: 'home', label: getUiTranslation(language, 'home') },
              { id: 'shop', label: getUiTranslation(language, 'ourProducts') },
              { id: 'about', label: getUiTranslation(language, 'ourStory') },
              { id: 'compare', label: getUiTranslation(language, 'compare') },
              { id: 'faq', label: getUiTranslation(language, 'faqs') },
              { id: 'contact', label: getUiTranslation(language, 'contactUs') },
              { id: 'track-order', label: getUiTranslation(language, 'trackOrder') }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 text-left px-3 rounded-lg transition-all text-sm cursor-pointer bg-transparent border-none ${
                    activeTab === link.id 
                      ? `${theme === 'light' ? 'bg-amber-100 text-amber-950 border-l-4 border-[#D4AF37]' : 'bg-[#1A1D21] text-[#D4AF37] border-l-4 border-[#D4AF37]'} font-semibold` 
                      : `${theme === 'light' ? 'text-amber-900/80 hover:bg-amber-50' : 'text-[#CCC]/80 hover:bg-[#1A1D21]'}`
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Profile and Auth options inside the mobile 3-line menu */}
            {user ? (
              <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
                <div className="px-3 py-1 flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full border border-[#D4AF37]/40" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#1A1D21] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-white leading-tight">{user.fullName}</span>
                    <span className="text-[10px] text-gray-500">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('user-profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left px-3 rounded-lg transition-all text-sm text-[#D4AF37] font-semibold hover:bg-[#1A1D21] cursor-pointer bg-transparent border-none flex items-center gap-2"
                >
                  👤 {language === 'hi' ? 'मेरा खाता और ऑर्डर्स' : 'My Account & Orders'}
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left px-3 rounded-lg transition-all text-sm text-red-500 font-bold hover:bg-red-500/10 cursor-pointer bg-transparent border-none flex items-center gap-2"
                >
                  <LogOut size={14} />
                  {language === 'hi' ? 'लॉग आउट' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-2 mt-2">
                <button
                  onClick={() => {
                    onLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center px-4 rounded-xl transition-all text-sm font-bold bg-[#D4AF37] text-[#0C0D0E] hover:bg-[#B48F27] cursor-pointer border-none flex items-center justify-center gap-1.5 shadow-md"
                >
                  <User size={14} />
                  {language === 'hi' ? 'लॉग इन करें' : 'Sign In / Register'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
