import React from 'react';
import { 
  Star, ShoppingCart, ShieldCheck, Heart, Sparkles, Loader2, 
  ArrowRight, Landmark, BadgePercent, Lock, MessageSquare, Flame, Navigation, Plus, Minus, UserCheck, Play, Printer, Share2,
  Camera, CameraOff, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Header from './components/Header.tsx';
import ProductCard, { ProductCardSkeleton } from './components/ProductCard.tsx';
import { getUiTranslation, getProductLocalization } from './lib/translations.ts';
import { printOrderInvoice } from './lib/invoice.ts';
import LiveActivityBanner from './components/LiveActivityBanner.tsx';
import AnnouncementBar from './components/AnnouncementBar.tsx';
import LivePurchasePopup from './components/LivePurchasePopup.tsx';
import FestiveOffersBanner from './components/FestiveOffersBanner.tsx';
import FestiveOffersSection from './components/FestiveOffersSection.tsx';

const AboutSection = React.lazy(() => import('./components/AboutSection.tsx'));
const HealthBenefits = React.lazy(() => import('./components/HealthBenefits.tsx'));
const FAQ = React.lazy(() => import('./components/FAQ.tsx'));
const ContactSection = React.lazy(() => import('./components/ContactSection.tsx'));
const UserOrders = React.lazy(() => import('./components/UserOrders.tsx'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel.tsx'));
const OrderTracker = React.lazy(() => import('./components/OrderTracker.tsx'));
const NewsletterSignup = React.lazy(() => import('./components/NewsletterSignup.tsx'));
const WishlistPage = React.lazy(() => import('./components/WishlistPage.tsx'));
const ComparePage = React.lazy(() => import('./components/ComparePage.tsx'));

function ElegantLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 font-sans" id="elegant-suspense-spinner">
      <Loader2 className="animate-spin text-[#D4AF37] w-8 h-8" />
      <motion.span 
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{
          duration: 2.0,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-xs text-[#D4AF37] tracking-widest uppercase font-extrabold"
      >
        Aditya Nutra Farms
      </motion.span>
    </div>
  );
}

// Custom dynamic Helmet component for React 19 SEO optimization
interface HelmetProps {
  title: string;
  description: string;
}

export function Helmet({ title, description }: HelmetProps) {
  React.useEffect(() => {
    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [title, description]);

  return null;
}

const TAB_SEO_METADATA: Record<string, { title: string; description: string }> = {
  home: {
    title: "Aditya Nutra Farms | Premium Organic Bihar Makhana",
    description: "Sourced directly from lotus ponds in Bihar, India. Buy premium Makhana (foxnuts) and organic snacks from Aditya Nutra Farms."
  },
  shop: {
    title: "Shop Premium Makhana Varieties | Aditya Nutra Farms",
    description: "Explore our rich collection of Bihar Makhana varieties, handpicked organic lotus seeds, and nutritious snacks."
  },
  about: {
    title: "Our Story & Sourcing | Aditya Nutra Farms",
    description: "Learn how Aditya Nutra Farms works with local farmers in Bihar to harvest and distribute premium organic Makhana."
  },
  compare: {
    title: "Compare Makhana Varieties | Aditya Nutra Farms",
    description: "Compare nutritional facts, pricing, and health details of different premium foxnut varieties to choose the perfect snack."
  },
  faq: {
    title: "Frequently Asked Questions | Aditya Nutra Farms",
    description: "Find quick answers to common questions about Makhana health benefits, shipping, order tracking, and loyalty rewards."
  },
  contact: {
    title: "Contact Us & Farm Tours | Aditya Nutra Farms",
    description: "Get in touch with Aditya Nutra Farms. Reach out for bulk orders, farm tours, or support from Purnea, Bihar."
  },
  'track-order': {
    title: "Track Your Order | Aditya Nutra Farms",
    description: "Track your organic Makhana dispatch from Bihar lotus ponds directly to your home."
  },
  'user-profile': {
    title: "My Account & Orders | Aditya Nutra Farms",
    description: "Access your Aditya Nutra Farms account, view order history, track lotus points, and redeem rewards."
  },
  wishlist: {
    title: "My Wishlist & Saved Snacks | Aditya Nutra Farms",
    description: "View your saved organic snacks and premium Makhana varieties on Aditya Nutra Farms."
  }
};

async function safeReadJson(res: Response) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      throw new Error("Invalid json format response from server");
    }
  }
  const text = await res.text();
  throw new Error(text.substring(0, 150) || "Server returned non-JSON response");
}

import { auth, googleAuthProvider, signInWithPopup, db as firestoreDb } from './lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Product, Order, User as DBUser, CartItem, Review } from './types.ts';
import { FALLBACK_PRODUCTS, FALLBACK_TESTIMONIALS } from './lib/constants.ts';
import { Chatbot } from './components/Chatbot.tsx';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  const isOffline = errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('unavailable');
  if (isOffline) {
    console.warn('Firestore is offline or unavailable. Operating with local settings.', JSON.stringify(errInfo));
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  // Global App States
  const [scrollProgress, setScrollProgress] = React.useState<number>(0);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // default fallback
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [activeTab, setActiveTab] = React.useState<string>('home');
  const [activeGoogleForm, setActiveGoogleForm] = React.useState<{ id: string; url: string; title: string } | null>(() => {
    const fid = localStorage.getItem('an_active_google_form_id');
    const furl = localStorage.getItem('an_active_google_form_url');
    const ftitle = localStorage.getItem('an_active_google_form_title');
    if (fid && furl) {
      return { id: fid, url: furl, title: ftitle || 'Bihar Makhana Crunch Customer Feedback' };
    }
    return null;
  });

  React.useEffect(() => {
    const syncFormBanner = () => {
      const fid = localStorage.getItem('an_active_google_form_id');
      const furl = localStorage.getItem('an_active_google_form_url');
      const ftitle = localStorage.getItem('an_active_google_form_title');
      if (fid && furl) {
        setActiveGoogleForm({ id: fid, url: furl, title: ftitle || 'Bihar Makhana Crunch Customer Feedback' });
      } else {
        setActiveGoogleForm(null);
      }
    };

    window.addEventListener('google-form-banner-updated', syncFormBanner);
    return () => window.removeEventListener('google-form-banner-updated', syncFormBanner);
  }, []);

  const [modalZoomStyle, setModalZoomStyle] = React.useState<React.CSSProperties>({});
  
  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setModalZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)',
      transition: 'transform 0.15s ease-out'
    });
  };

  const handleModalMouseLeave = () => {
    setModalZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
      transition: 'transform 0.3s ease-out'
    });
  };
  const [language, setLanguage] = React.useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('an_lang') as 'en' | 'hi') || 'en';
  });

  const handleToggleLanguage = async () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('an_lang', nextLang);
    triggerToast(nextLang === 'hi' ? "भाषा को हिन्दी में बदला गया!" : "Language switched to English!", "success");

    // Sync preferred language change to Firestore
    if (auth.currentUser) {
      const pathName = `users/${auth.currentUser.uid}`;
      try {
        await setDoc(doc(firestoreDb, 'users', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          preferredLanguage: nextLang,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathName);
      }
    }
  };
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState<boolean>(true);
  const [testimonials, setTestimonials] = React.useState<Review[]>([]);
  
  // Auth state
  const [user, setUser] = React.useState<DBUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState<boolean>(true);

  // Cart & Wishlist state (persisted in client side local storage)
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedSort, setSelectedSort] = React.useState<string>('default');

  // Checkout Form
  const [checkoutStep, setCheckoutStep] = React.useState<'cart' | 'details' | 'success'>('cart');
  const [checkoutMessage, setCheckoutMessage] = React.useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = React.useState({
    fullName: '',
    address: '',
    city: '',
    state: 'Bihar',
    zipCode: '',
    phone: '',
    paymentMethod: 'COD' // 'COD' or 'Razorpay'
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = React.useState<number | "new">("new");
  const [placingOrder, setPlacingOrder] = React.useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = React.useState<Order | null>(null);

  // OTP Verification States
  const [showOtpVerificationModal, setShowOtpVerificationModal] = React.useState<boolean>(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = React.useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = React.useState<string>('');
  const [enteredOtp, setEnteredOtp] = React.useState<string>('');
  const [otpVerificationError, setOtpVerificationError] = React.useState<string | null>(null);
  const [otpTimer, setOtpTimer] = React.useState<number>(0);

  React.useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // User orders list (syncs dynamically)
  const [userOrders, setUserOrders] = React.useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState<boolean>(false);

  const uniquePreviousAddresses = React.useMemo(() => {
    const seen = new Set<string>();
    const addrs: Array<{
      fullName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      phone: string;
    }> = [];
    
    userOrders.forEach(o => {
      if (!o.address) return;
      const key = `${o.fullName || ''}|${o.address || ''}|${o.city || ''}|${o.state || ''}|${o.zipCode || ''}|${o.phone || ''}`.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        addrs.push({
          fullName: o.fullName || '',
          address: o.address || '',
          city: o.city || '',
          state: o.state || 'Bihar',
          zipCode: o.zipCode || '',
          phone: o.phone || ''
        });
      }
    });
    return addrs;
  }, [userOrders]);

  React.useEffect(() => {
    if (typeof selectedAddressIndex === 'number' && uniquePreviousAddresses[selectedAddressIndex]) {
      const selected = uniquePreviousAddresses[selectedAddressIndex];
      setCheckoutForm(prev => ({
        ...prev,
        fullName: selected.fullName,
        address: selected.address,
        city: selected.city,
        state: selected.state,
        zipCode: selected.zipCode,
        phone: selected.phone
      }));
    }
  }, [selectedAddressIndex, uniquePreviousAddresses]);

  React.useEffect(() => {
    if (checkoutStep === 'details' && uniquePreviousAddresses.length > 0) {
      setSelectedAddressIndex(0);
    }
  }, [checkoutStep, uniquePreviousAddresses.length]);

  // Loyalty Program States
  const [spentPoints, setSpentPoints] = React.useState<number>(() => {
    return Number(localStorage.getItem('an_spent_points') || '0');
  });
  const [redeemedCoupons, setRedeemedCoupons] = React.useState<{code: string; discount: number; date: string}[]>(() => {
    return JSON.parse(localStorage.getItem('an_redeemed_coupons') || '[]');
  });
  const [appliedCoupon, setAppliedCoupon] = React.useState<{code: string; discount: number} | null>(null);
  const [couponInput, setCouponInput] = React.useState<string>('');

  const totalSpentAllOrders = userOrders
    .filter(order => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const totalPointsAccumulated = Math.floor(totalSpentAllOrders * 0.10);
  const totalPointsAvailable = Math.max(0, totalPointsAccumulated - spentPoints);

  const handleRedeemPoints = (ptsToRedeem: number, discountValue: number, applyToCart?: boolean) => {
    if (totalPointsAvailable < ptsToRedeem) {
      triggerToast(language === 'hi' ? "लॉयल्टी पॉइंट्स अपर्याप्त हैं!" : "Insufficient loyalty points for redemption.", "err");
      return false;
    }

    const newSpent = spentPoints + ptsToRedeem;
    setSpentPoints(newSpent);
    localStorage.setItem('an_spent_points', String(newSpent));

    const newCoupon = {
      code: `MAKHANA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      discount: discountValue,
      date: new Date().toLocaleDateString()
    };
    const updatedCoupons = [newCoupon, ...redeemedCoupons];
    setRedeemedCoupons(updatedCoupons);
    localStorage.setItem('an_redeemed_coupons', JSON.stringify(updatedCoupons));

    if (applyToCart && cart && cart.length > 0) {
      setAppliedCoupon({ code: newCoupon.code, discount: newCoupon.discount });
      setCouponInput(newCoupon.code);
      triggerToast(
        language === 'hi'
          ? `सफलतापूर्वक ₹${discountValue} के कूपन को रिडीम करके कार्ट में लागू किया गया!`
          : `Successfully redeemed and applied coupon ${newCoupon.code} (₹${discountValue} discount) directly to your shopping bag!`,
        "success"
      );
    } else {
      triggerToast(
        language === 'hi' 
          ? `सफलतापूर्वक ₹${discountValue} के कूपन के लिए ${ptsToRedeem} पॉइंट्स रिडीम किए गए!` 
          : `Successfully redeemed ${ptsToRedeem} points for a ₹${discountValue} discount coupon!`, 
        "success"
      );
    }
    return true;
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        triggerToast(language === 'hi' ? 'ऑर्डर सफलतापूर्वक निरस्त कर दिया गया है।' : 'Order cancelled successfully.', "success");
        fetchUserOrders(token);
        return true;
      } else {
        const data = await safeReadJson(res);
        triggerToast(data.error || 'Failed to cancel order.', "err");
        return false;
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network error while cancelling order.', "err");
      return false;
    }
  };

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    // Define function to check if coupon belongs to the seasonal/festive campaign list
    const isFestiveCouponCode = (cCode: string): boolean => {
      const upper = cCode.toUpperCase();
      return ['MONSOON25', 'DIWALI50', 'HOLI20', 'CHHATH15', 'NEWYEAR20'].includes(upper) || upper.startsWith('FESTIVE');
    };

    if (isFestiveCouponCode(cleanCode)) {
      const alreadyClaimed = localStorage.getItem('an_used_festive_offer_claimed') === 'true';
      if (alreadyClaimed) {
        triggerToast(
          language === 'hi'
            ? `उत्सव कूपन केवल एक बार उपयोग के लिए ही मान्य है। आपने पहले ही इसका लाभ उठा लिया है!`
            : `Sorry, festive promotional coupons are limited to one use per customer. You have already redeemed one!`,
          "err"
        );
        return;
      }
    }
    
    // Fetch dynamic coupon list defined in Admin Panel localStorage
    const adminCouponsRaw = localStorage.getItem('an_admin_promo_coupons');
    let couponsList: { code: string; discount: number; description: string; minOrder?: number; expiryDate?: string; usageCount?: number }[] = [];
    if (adminCouponsRaw) {
      try {
        couponsList = JSON.parse(adminCouponsRaw);
      } catch (e) {
        console.error(e);
      }
    }

    if (couponsList.length === 0) {
      couponsList = [
        { code: 'MONSOON25', discount: 120, description: 'June Harvest Festival Organic Special Coupon', minOrder: 399, expiryDate: '2026-06-30', usageCount: 4 },
        { code: 'DIWALI50', discount: 150, description: 'Diwali Grand Festival Celebration Coupon', minOrder: 499, expiryDate: '2026-11-15', usageCount: 12 },
        { code: 'HOLI20', discount: 100, description: 'Holi Festival of Colors Discount Coupon', minOrder: 299, expiryDate: '2026-03-15', usageCount: 22 },
        { code: 'CHHATH15', discount: 85, description: 'Mithila Chhath Puja High Protein Sourcing Sickness Sucker Coupon', minOrder: 199, expiryDate: '2026-10-31', usageCount: 1 },
        { code: 'NEWYEAR20', discount: 90, description: 'New Year Winter Wellness Superfoods Coupon', minOrder: 249, expiryDate: '2026-01-05', usageCount: 18 }
      ];
      localStorage.setItem('an_admin_promo_coupons', JSON.stringify(couponsList));
    }

    // 1. Look up in Admin Promo Coupons list
    const promoMatch = couponsList.find(c => c.code.toUpperCase() === cleanCode);
    if (promoMatch) {
      // Check Expiry dynamically aligned with Admin anchor calculations
      if (promoMatch.expiryDate) {
        const d = new Date();
        const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const todayClean = new Date(todayStr);
        const exp = new Date(promoMatch.expiryDate);
        todayClean.setHours(0,0,0,0);
        exp.setHours(0,0,0,0);

        if (!isNaN(exp.getTime()) && exp < todayClean) {
          triggerToast(
            language === 'hi'
              ? `यह कूपन कोड (${cleanCode}) की अवधि समाप्त हो चुकी है (समाप्ति तिथि: ${promoMatch.expiryDate})।`
              : `This coupon code (${cleanCode}) has already expired on ${promoMatch.expiryDate}.`,
            "err"
          );
          return;
        }
      }

      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const minRequired = promoMatch.minOrder || 0;
      
      if (subtotal < minRequired) {
        triggerToast(
          language === 'hi'
            ? `न्यूनतम ₹${minRequired} के आर्डर पर ही यह कूपन मान्य है। अभी आपका कार्ट मूल्य ₹${subtotal} है।`
            : `This coupon is only valid for orders above ₹${minRequired}. Your current cart is ₹${subtotal}.`,
          "err"
        );
        return;
      }

      setAppliedCoupon({ code: cleanCode, discount: promoMatch.discount });
      setCouponInput(cleanCode);
      setIsCartOpen(true); // Open the side-drawer immediately to show savings
      triggerToast(
        language === 'hi'
          ? `कूपन ${cleanCode} लागू हुआ! ₹${promoMatch.discount} की विशेष छूट सक्रिय।`
          : `Promo coupon ${cleanCode} applied! Special ₹${promoMatch.discount} discount is active.`,
        "success"
      );
      return;
    }

    // 2. Look up in Loyalty redeemed coupons
    const coupon = redeemedCoupons.find(c => c.code.toUpperCase() === cleanCode);
    if (coupon) {
      setAppliedCoupon({ code: coupon.code, discount: coupon.discount });
      setIsCartOpen(true); // Open the side-drawer immediately to show savings
      triggerToast(
        language === 'hi' 
          ? `लॉयल्टी कूपन ${coupon.code} सफलतापूर्वक लागू किया गया! ₹${coupon.discount} की छूट सक्रिय है।` 
          : `Loyalty Coupon ${coupon.code} applied successfully! ₹${coupon.discount} discount active.`, 
        "success"
      );
    } else {
      triggerToast(
        language === 'hi' ? "अमान्य या समाप्त कूपन कोड।" : "Invalid or expired coupon code.", 
        "err"
      );
    }
  };

  // Subscribe to Festive Offer Banner coupon application events
  React.useEffect(() => {
    const handleFestiveCoupon = (e: Event) => {
      const customEvent = e as CustomEvent<{ code: string }>;
      if (customEvent.detail && customEvent.detail.code) {
        handleApplyCoupon(customEvent.detail.code);
      }
    };
    window.addEventListener('apply-festive-coupon', handleFestiveCoupon);
    return () => {
      window.removeEventListener('apply-festive-coupon', handleFestiveCoupon);
    };
  }, [redeemedCoupons, language, cart]);

  // Product specific modal
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [submittingReview, setSubmittingReview] = React.useState<boolean>(false);
  const [reviewForm, setReviewForm] = React.useState({ rating: 5, comment: '', photo: '' });

  // Camera integration for reviews feedback delivery photos
  const [showCamera, setShowCamera] = React.useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      setShowCamera(true);
    } catch (err: any) {
      console.error(err);
      triggerToast(language === 'hi' 
        ? "कैमरा खोलने में विफ़ल! अनुमति की जांच करें।" 
        : "Failed to access camera. Please check your browser or camera permissions.", "err");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setReviewForm(prev => ({ ...prev, photo: dataUrl }));
        triggerToast(language === 'hi' ? "तस्वीर सफलतापूर्वक ली गई!" : "Photo captured successfully!", "success");
      }
      stopCamera();
    }
  };

  React.useEffect(() => {
    if (!selectedProduct) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setShowCamera(false);
    }
  }, [selectedProduct]);

  // Admin console status
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = React.useState<boolean>(false);

  // Custom Toast Notification State & Trigger
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'err' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'err' | 'info' = 'info') => {
    setToast({ message, type });
    // Auto collapse banner after 6 seconds
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 6000);
  };

  // 1. Setup Firebase Auth Synchronizer
  React.useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // Restore language settings from user's Firestore database profile
          const pathName = `users/${firebaseUser.uid}`;
          try {
            const userLangDoc = await getDoc(doc(firestoreDb, 'users', firebaseUser.uid));
            if (userLangDoc.exists()) {
              const data = userLangDoc.data();
              if (data && (data.preferredLanguage === 'hi' || data.preferredLanguage === 'en')) {
                const fetchedLang = data.preferredLanguage as 'en' | 'hi';
                setLanguage(fetchedLang);
                localStorage.setItem('an_lang', fetchedLang);
              }
            } else {
              const storedLang = (localStorage.getItem('an_lang') as 'en' | 'hi') || 'en';
              const initialLangObj = {
                uid: firebaseUser.uid,
                preferredLanguage: storedLang,
                updatedAt: new Date().toISOString()
              };
              await setDoc(doc(firestoreDb, 'users', firebaseUser.uid), initialLangObj);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, pathName);
          }
          
          // Synced database user from users/me API
          const response = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          
          if (response.ok) {
            const dbData = await safeReadJson(response);
            setUser(dbData);
            // Autofill checkout details
            setCheckoutForm(prev => ({
              ...prev,
              fullName: dbData.fullName || '',
              phone: ''
            }));
            fetchUserOrders(idToken);
          } else {
            console.error('Failed to sync auth credentials.');
          }
        } catch (err) {
          console.error('Error on firebase state resolve:', err);
        }
      } else {
        setUser(null);
        setToken(null);
        setUserOrders([]);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch public products & testimonials
  const fetchProducts = async () => {
    setLoadingProducts(true);
    let loadedProducts = false;
    let loadedTestimonials = false;

    try {
      const pUrl = `/api/products`;
      const pRes = await fetch(pUrl);
      if (pRes.ok) {
        const pData = await safeReadJson(pRes);
        if (pData && pData.length > 0) {
          setProducts(pData);
          loadedProducts = true;
        }
      }
    } catch (err) {
      console.warn('API Products fetch failed, will check fallback:', err);
    }

    try {
      // Testimonials loading
      const tRes = await fetch('/api/testimonials');
      if (tRes.ok) {
        const tData = await safeReadJson(tRes);
        if (tData && tData.length > 0) {
          setTestimonials(tData);
          loadedTestimonials = true;
        }
      }
    } catch (err) {
      console.warn('API Testimonials fetch failed, will check fallback:', err);
    }

    // Set fallbacks if API couldn't populate lists
    if (!loadedProducts) {
      setProducts(FALLBACK_PRODUCTS);
    }
    if (!loadedTestimonials) {
      setTestimonials(FALLBACK_TESTIMONIALS);
    }

    setLoadingProducts(false);
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  // Load client browser cart & wishlist states on start or handle public shared wishlist URLs
  React.useEffect(() => {
    // Clear any legacy persistent localStorage cart data to immediately fix the issue where
    // previous items are silently restored upon reloading or starting a fresh visit.
    if (localStorage.getItem('an_cart')) {
      localStorage.removeItem('an_cart');
    }

    // Migrate shopping cart state to sessionStorage. This ensures that:
    // 1. Reloading/refreshing the current tab preserves active cart items (desirable UX).
    // 2. Opening the page in a new window/tab starts completely clean with 0 items.
    const sessionCart = sessionStorage.getItem('an_cart');
    const localWish = localStorage.getItem('an_wishlist');
    if (sessionCart) setCart(JSON.parse(sessionCart));

    // Support public shared wishlists via unique query parameter
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedPara = params.get('sharedWishlist');
      if (sharedPara) {
        const sharedIds = sharedPara
          .split(',')
          .map(id => parseInt(id, 10))
          .filter(id => !isNaN(id));

        if (sharedIds.length > 0) {
          let mergedWish = [...sharedIds];
          if (localWish) {
            const parsedLocal = JSON.parse(localWish);
            if (Array.isArray(parsedLocal)) {
              mergedWish = Array.from(new Set([...parsedLocal, ...sharedIds]));
            }
          }
          setWishlist(mergedWish);
          localStorage.setItem('an_wishlist', JSON.stringify(mergedWish));

          // Set active tab to let the user see the imported wishlist
          setTimeout(() => {
            triggerToast(
              language === 'hi' 
                ? "साझा सूची सफलतापूर्वक लोड हुई! आपके मित्र के सहेजे गए उत्पाद अब जोड़े गए हैं।" 
                : "Shared makhana collection imported! Your friend's saved products are now in your list.", 
              "success"
            );
            setActiveTab('wishlist');
            // Clean up address bar query params
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }, 600);
          return;
        }
      }
    } catch (err) {
      console.error("Error setting up shared wishlist URL parsing:", err);
    }

    if (localWish) setWishlist(JSON.parse(localWish));
  }, []);

  // Sync state helpers
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    sessionStorage.setItem('an_cart', JSON.stringify(newCart));
  };

  const saveWishlist = (newWish: number[]) => {
    setWishlist(newWish);
    localStorage.setItem('an_wishlist', JSON.stringify(newWish));
  };

  const fetchUserOrders = async (authToken: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders/my', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const oData = await safeReadJson(res);
        setUserOrders(oData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      triggerToast("Signed in successfully with Google!", "success");
    } catch (err: any) {
      const isClosedByUser = err?.code === 'auth/popup-closed-by-user' || 
                             err?.message?.includes('popup-closed-by-user') ||
                             err?.message?.includes('closed by user') ||
                             err?.code === 'auth/cancelled-popup-request';
      
      if (isClosedByUser) {
        console.warn('Login popup closed by user (graceful user cancel state)');
        triggerToast("Login closed. For secure authentication inside previews, click 'Open in a New Tab' at the top, or check pop-up blocker settings.", "info");
      } else {
        console.warn('Google authentication issues detected:', err?.message || err);
        triggerToast(err?.message || "Google authentication failed. Please verify browser settings.", "err");
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      sessionStorage.removeItem('an_cart');
      localStorage.removeItem('an_cart');
      saveCart([]);
      setActiveTab('home');
      triggerToast("Logged out successfully.", "info");
    } catch (err) {
      console.warn('Logout failed:', err);
    }
  };

  // Search trigger inside store
  const handleToggleWishlist = (id: number) => {
    const isSaved = wishlist.includes(id);
    const updated = isSaved 
      ? wishlist.filter(item => item !== id) 
      : [...wishlist, id];
    saveWishlist(updated);

    const product = products.find(p => p.id === id);
    if (product) {
      const localized = getProductLocalization(language, product.name, product.description);
      if (isSaved) {
        triggerToast(
          language === 'hi' 
            ? `${localized.name} को इच्छा सूची (Wishlist) से हटाया गया।` 
            : `${localized.name} has been removed from your wishlist.`,
          "info"
        );
      } else {
        triggerToast(
          language === 'hi' 
            ? `${localized.name} को इच्छा सूची (Wishlist) में जोड़ा गया!` 
            : `${localized.name} has been added to your wishlist!`,
          "success"
        );
      }
    } else {
      if (isSaved) {
        triggerToast(
          language === 'hi' ? "इच्छा सूची से हटाया गया!" : "Removed from wishlist.",
          "info"
        );
      } else {
        triggerToast(
          language === 'hi' ? "इच्छा सूची में जोड़ा गया!" : "Added to wishlist!",
          "success"
        );
      }
    }
  };

  const [comparedIds, setComparedIds] = React.useState<number[]>([]);

  const handleToggleCompare = (id: number) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter(item => item !== id));
      triggerToast(language === 'hi' ? "तुलना सूची से हटाया गया!" : "Removed from comparison table.", "info");
    } else {
      if (comparedIds.length >= 3) {
        triggerToast(
          language === 'hi' 
            ? "आप अधिकतम 3 उत्पादों की तुलना कर सकते हैं।" 
            : "You can compare up to 3 products side-by-side.", 
          "err"
        );
        return;
      }
      setComparedIds([...comparedIds, id]);
      triggerToast(language === 'hi' ? "तुलना में जोड़ा गया! ऊपर 'तुलना करें' दबाएं।" : "Added to comparison list. Click 'Compare' in menu to view table side-by-side!", "success");
    }
  };

  const handleClearCompare = () => {
    setComparedIds([]);
  };

  const handleMoveWishlistToCart = (prod: Product) => {
    handleAddToCart(prod, 1);
    saveWishlist(wishlist.filter(id => id !== prod.id));
    triggerToast(language === 'hi' ? "उत्पाद को झोले में भेज दिया गया!" : "Product moved to your makhana bag!", "success");
  };

  // Cart operations
  const handleAddToCart = (product: Product, qty: number = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    let updated;
    if (existing) {
      updated = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + qty } 
          : item
      );
    } else {
      updated = [...cart, { product, quantity: qty }];
    }
    saveCart(updated);
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      triggerToast(language === 'hi' ? "ऑर्डर में कोई उत्पाद नहीं मिला!" : "No items found in this order!", "info");
      return;
    }

    let itemsAddedCount = 0;
    let newCart = [...cart];

    order.items.forEach(item => {
      // Find matching product in our catalogue by ID or name
      const matchingProduct = products.find(p => p.id === item.productId || p.name === item.productName);
      
      if (matchingProduct) {
        const existing = newCart.find(c => c.product.id === matchingProduct.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newCart.push({
            product: matchingProduct,
            quantity: item.quantity
          });
        }
        itemsAddedCount += item.quantity;
      }
    });

    if (itemsAddedCount > 0) {
      saveCart(newCart);
      setIsCartOpen(true);
      triggerToast(
        language === 'hi'
          ? `सफलतापूर्वक ${itemsAddedCount} आइटम वर्तमान बैग में जोड़े गए!`
          : `Successfully added ${itemsAddedCount} items from your previous order to your bag!`, 
        "success"
      );
      // Switch view back to shop tab so the customer sees their bag and can checkout
      setActiveTab('shop');
    } else {
      triggerToast(
        language === 'hi'
          ? "माफ़ कीजिए, इस आर्डर के उत्पाद वर्तमान में उपलब्ध नहीं हैं।"
          : "Sorry, the products from this order are not currently available.",
        "err"
      );
    }
  };

  const handleUpdateCartQty = (id: number, offset: number) => {
    const updated = cart.map(item => {
      if (item.product.id === id) {
        const newQty = item.quantity + offset;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const handleRemoveFromCart = (id: number) => {
    const updated = cart.filter(item => item.product.id !== id);
    saveCart(updated);
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    setCheckoutStep('cart');
    setIsCartOpen(true);
  };

  const handleShareProduct = async (product: Product) => {
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    const shareTitle = `${product.name} | Aditya Nutra Farms`;
    const shareText = `Check out this premium Bihar lotus makhana variety on Aditya Nutra Farms: ${product.name}! Unique quality directly from Purnea ponds.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        triggerToast(language === 'hi' ? "सफलतापूर्वक साझा किया गया!" : "Product shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          triggerToast(language === 'hi' ? "साझा करने में विफल।" : "Failed to share product.", "err");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        triggerToast(
          language === 'hi' 
            ? "उत्पाद लिंक क्लिपबोर्ड पर कॉपी किया गया!" 
            : "Product link copied to clipboard! Share it with your friends via WhatsApp or Email.", 
          "success"
        );
      } catch (err) {
        triggerToast(language === 'hi' ? "लिंक कॉपी करने में विफल।" : "Could not copy link to clipboard.", "err");
      }
    }
  };

  const handleOpenProductDetail = async (p: Product) => {
    // Automatically close the chatbot drawer when any product is opened
    window.dispatchEvent(new CustomEvent('close-chatbot'));
    try {
      const res = await fetch(`/api/products/${p.id}`);
      if (res.ok) {
        const fullProd = await safeReadJson(res);
        setSelectedProduct(fullProd);
      } else {
        setSelectedProduct(p);
      }
    } catch (err) {
      setSelectedProduct(p);
    }
  };

  // Post dynamic product reviews
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      triggerToast("Please sign in to post a review and rate products!", "info");
      return;
    }
    if (!selectedProduct) return;
    
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });
      
      const resData = await safeReadJson(res);
      if (!res.ok) throw new Error(resData.error || "Failed to submit review");

      // Review appended successfully
      setReviewForm({ rating: 5, comment: '', photo: '' });
      handleOpenProductDetail(selectedProduct); // reload modal content
      fetchProducts(); // reload list cards main screen rating averages
      triggerToast("Your review was posted successfully! Thank you for the feedback.", "success");
    } catch (err: any) {
      triggerToast(err.message || "Failed to submit review.", "err");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutMessage(null);

    // Validate phone number - strip symbols
    const digits = checkoutForm.phone.replace(/\D/g, '');
    if (digits.length !== 10 && !(digits.length === 12 && digits.startsWith('91'))) {
      const errMsg = language === 'hi'
        ? "अमान्य मोबाइल नंबर! कृपया एक उचित 10-अंकीय भारतीय फोन नंबर दर्ज करें।"
        : "Invalid Mobile Number! Please enter a valid 10-digit mobile number.";
      setCheckoutMessage(errMsg);
      triggerToast(errMsg, "err");
      return;
    }

    if (!checkoutForm.fullName.trim() || !checkoutForm.address.trim() || !checkoutForm.city.trim() || !checkoutForm.zipCode.trim()) {
      const errMsg = language === 'hi'
        ? "कृपया सभी आवश्यक विवरण सही से भरें।"
        : "Please fill in all the required checkout details correctly.";
      setCheckoutMessage(errMsg);
      return;
    }

    const cleanZip = checkoutForm.zipCode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanZip)) {
      const errMsg = language === 'hi'
        ? "अमान्य पिन कोड! कृपया एक वैध ६-अंकीय भारतीय पिन कोड दर्ज करें (उदा. 110001)।"
        : "Invalid PIN Code! Please enter a valid 6-digit Indian PIN code (e.g., 110001).";
      setCheckoutMessage(errMsg);
      triggerToast(errMsg, "err");
      return;
    }

    // Instead of OTP directly, open the pre-payment order summary modal
    setShowOrderSummaryModal(true);
  };

  const handleConfirmOrderSummary = () => {
    setShowOrderSummaryModal(false);

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpVerificationError(null);
    setShowOtpVerificationModal(true);
    setOtpTimer(30);

    // Show simulated SMS alert/toast
    const notice = language === 'hi'
      ? `💬 [SIMULATION SMS] प्रमाणीकरण कोड: ${code}`
      : `💬 [SIMULATED SMS] OTP Verification Code is: ${code}`;
    triggerToast(notice, "success");
  };

  const triggerMockEmailToast = (orderId: number, name: string, userEmail: string) => {
    const estDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const emailMsg = language === 'hi'
      ? `📧 [पुष्टि ईमेल!] ऑर्डर #${orderId} के लिए विस्तृत रसीद ${name} (${userEmail}) को ईमेल कर दी गई है। अनुमानित डिलीवरी: ${estDate}।`
      : `📧 [Email Confirmation Sent!] A detailed order receipt and payment confirmation for Order #${orderId} has been successfully emailed to ${name} (${userEmail}). Estimated Delivery: ${estDate} via Farmer Fresh Express.`;
    triggerToast(emailMsg, "success");
  };

  // Place checkout order after validation
  const executeOrderPlacement = async () => {
    if (!token) {
      triggerToast("Sign in required to proceed with checkout.", "info");
      handleLogin();
      return;
    }
    setCheckoutMessage(null);
    setPlacingOrder(true);

    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        ...checkoutForm,
        discount: appliedCoupon ? appliedCoupon.discount : 0
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await safeReadJson(res);
      if (!res.ok) throw new Error(data.error || "Order placement failed.");

      setLastPlacedOrder(data);
      saveCart([]); // clear cart
      setCheckoutStep('success');
      setShowOtpVerificationModal(false);

      // Trigger standard email conformation toast immediately
      triggerMockEmailToast(data.id, checkoutForm.fullName, user?.email || 'your makhana profile email');

      // Sync list
      fetchUserOrders(token);

      // Successfully earned points alert
      const pointsEarned = Math.floor(data.totalAmount * 0.10);
      alert(language === 'hi'
        ? `बधाई हो! आपने इस ऑर्डर से ${pointsEarned} मखाना गोल्ड लॉयल्टी पॉइंट्स अर्जित किए हैं!`
        : `Congratulations! You have successfully earned ${pointsEarned} Loyalty Points from your current order!`
      );

      // Increment coupon usage statistics in localStorage
      if (appliedCoupon) {
        const promoCode = appliedCoupon.code.toUpperCase();

        // Mark festive offer as claimed if it is of seasonal category
        const isFestiveCouponCode = (cCode: string): boolean => {
          const upper = cCode.toUpperCase();
          return ['MONSOON25', 'DIWALI50', 'HOLI20', 'CHHATH15', 'NEWYEAR20'].includes(upper) || upper.startsWith('FESTIVE');
        };
        if (isFestiveCouponCode(promoCode)) {
          localStorage.setItem('an_used_festive_offer_claimed', 'true');
          window.dispatchEvent(new Event('festive-offer-redeemed'));
        }

        const savedRaw = localStorage.getItem('an_admin_promo_coupons');
        if (savedRaw) {
          try {
            const list = JSON.parse(savedRaw);
            const index = list.findIndex((c: any) => c.code.toUpperCase() === promoCode);
            if (index !== -1) {
              list[index].usageCount = (list[index].usageCount || 0) + 1;
              localStorage.setItem('an_admin_promo_coupons', JSON.stringify(list));
            }
          } catch (e) {
            console.error('Failed to increment coupon usageCount', e);
          }
        }
      }

      // Clear applied coupon
      setAppliedCoupon(null);
      setCouponInput('');
    } catch (err: any) {
      setCheckoutMessage(err.message);
      triggerToast(err.message, "err");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Cart pricing sum
  const cartMRP = cart.reduce((sum, item) => sum + (item.product.mrp * item.quantity), 0);
  const cartSellingBeforeDiscount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartSelling = Math.max(0, cartSellingBeforeDiscount - (appliedCoupon ? appliedCoupon.discount : 0));
  const cartSavings = cartMRP - cartSelling;

  const getBaseProductName = (name: string): string => {
    return name.replace(/\s*(100g|200g|250g|500g|1kg)\s*$/i, '').trim();
  };

  const getDeduplicatedProducts = (list: Product[]) => {
    const seen = new Set<string>();
    const deduplicated: Product[] = [];
    
    for (const p of list) {
      const baseName = getBaseProductName(p.name);
      if (!seen.has(baseName)) {
        seen.add(baseName);
        deduplicated.push(p);
      }
    }
    return deduplicated;
  };

  // Sorting products helper
  const getSortedProducts = () => {
    let filteredList = [...products];

    // 1. Search Query Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filteredList = filteredList.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    // 2. Category Tab Filter
    if (selectedCategory === 'raw-collection') {
      filteredList = filteredList.filter(p => p.category === 'raw-makhana');
    } else if (selectedCategory === 'flavoured-collection') {
      filteredList = filteredList.filter(p => p.category === 'flavoured-makhana');
    } else if (selectedCategory === 'health-collection') {
      filteredList = filteredList.filter(p => p.category === 'health-nutrition');
    } else if (selectedCategory === 'premium-collection') {
      filteredList = filteredList.filter(p => p.category === 'premium-collection');
    } else if (selectedCategory === 'gift-combo-collection') {
      filteredList = filteredList.filter(p => p.category === 'gift-packs' || p.category === 'combo-packs');
    }

    // 3. Sorting Options
    if (selectedSort === 'price-low') {
      filteredList.sort((a,b) => a.price - b.price);
    } else if (selectedSort === 'price-high') {
      filteredList.sort((a,b) => b.price - a.price);
    } else if (selectedSort === 'rating') {
      filteredList.sort((a,b) => b.rating - a.rating);
    } else if (selectedSort === 'best-selling') {
      filteredList.sort((a,b) => b.rating - a.rating || b.id - a.id);
    } else if (selectedSort === 'new-arrivals') {
      filteredList.sort((a, b) => b.id - a.id);
    }

    return getDeduplicatedProducts(filteredList);
  };

  const getSectionedProducts = () => {
    const deduplicated = getSortedProducts();
    
    const isBestSellerName = (name: string): boolean => {
      const baseName = getBaseProductName(name);
      return ["Premium Raw Makhana", "Jumbo Size Makhana", "Peri Peri Makhana", "Cheese Makhana"].includes(baseName);
    };

    const bestSellers = deduplicated.filter(p => isBestSellerName(p.name));
    
    const raw = deduplicated.filter(p => p.category === 'raw-makhana' || p.category === 'raw');
    const flavoured = deduplicated.filter(p => p.category === 'flavoured-makhana' || p.category === 'flavored');
    const health = deduplicated.filter(p => p.category === 'health-nutrition');
    const premium = deduplicated.filter(p => p.category === 'premium-collection');
    const giftCombo = deduplicated.filter(p => p.category === 'gift-packs' || p.category === 'combo-packs');

    return [
      {
        id: 'best-sellers',
        titleEn: 'Best Sellers',
        titleHi: 'बेस्ट सेलर्स',
        descriptionEn: 'Our most loved of all premium superfoods.',
        descriptionHi: 'हमारे सभी प्रीमियम सुपरफूड्स में से सबसे पसंदीदा।',
        products: bestSellers,
      },
      {
        id: 'raw-collection',
        titleEn: 'Raw Collection',
        titleHi: 'कच्चा मखाना',
        descriptionEn: 'Naturally handpicked organic sorted raw lotus seeds directly from Bihar ponds.',
        descriptionHi: 'सीधे बिहार के तालाबों से प्राकृतिक रूप से चुने हुए जैविक कच्चे मखाने।',
        products: raw,
      },
      {
        id: 'flavoured-collection',
        titleEn: 'Flavoured Collection',
        titleHi: 'स्वादिष्ट मखाना',
        descriptionEn: 'Crisp popped lotus seeds seasoned with delightful natural herbs and gourmet spices.',
        descriptionHi: 'स्वादिष्ट प्राकृतिक जड़ी-बूटियों और मसालों के साथ भुने हुए कुरकुरे मखाने।',
        products: flavoured,
      },
      {
        id: 'health-collection',
        titleEn: 'Health Collection',
        titleHi: 'स्वास्थ्य और पोषण',
        descriptionEn: 'Superfood nutrition powder mixes and dietary dietary supports for active fitness.',
        descriptionHi: 'सक्रिय फिटनेस के लिए सुपरफूड पोषण पाउडर मिश्रण और आहार सहायता।',
        products: health,
      },
      {
        id: 'premium-collection',
        titleEn: 'Premium Collection',
        titleHi: 'प्रीमियम संग्रह',
        descriptionEn: 'Gourmet sweets, chocolate coatings, and exotic caramelized sensations.',
        descriptionHi: 'पेटू मिठाइयाँ, चॉकलेट कोटिंग्स और आकर्षक कारमेलाइज़्ड मखाने।',
        products: premium,
      },
      {
        id: 'gift-combo-collection',
        titleEn: 'Gift & Combo Collection',
        titleHi: 'उपहार और कॉम्बो संग्रह',
        descriptionEn: 'Curation of lovely festival gift boxes and cost-saving nutritional snack packages.',
        descriptionHi: 'प्यारे त्योहारों के उपहार बक्से और बचत वाले पोषण स्नैक्स का संग्रह।',
        products: giftCombo,
      }
    ];
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0C0D0E] text-[#F0F0F0]' : 'bg-[#FAF8F5] text-[#2C2115]'} flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0C0D0E]`} id="main-applet-root">
      
      {/* 0. SEO Head Metadata */}
      {TAB_SEO_METADATA[activeTab] && (
        <Helmet 
          title={TAB_SEO_METADATA[activeTab].title}
          description={TAB_SEO_METADATA[activeTab].description}
        />
      )}

      {/* Dynamic Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-[#D4AF37] z-[99999] transition-all duration-75 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
        id="scroll-progress-bar"
      />
      
      {/* 1. Brand Navigation Header */}
      <AnnouncementBar language={language} />
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        cart={cart}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => {
          setIsCartOpen(true);
          setCheckoutStep('cart');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setIsAdminConsoleOpen(true)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        wishlistCount={wishlist.length}
        theme={theme}
      />

      {/* 2. Main Page Layout Router */}
      <main className="flex-grow">
        <React.Suspense fallback={<ElegantLoader />}>
          
          {/* VIEW: HOME VIEW PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-16 pb-16">
            
            {/* HERO BANNER SECTION */}
            <section className="relative bg-[#121417] text-[#F0F0F0] overflow-hidden py-16 lg:py-24 border-b border-white/5">
              {/* Background farmer pond texture pattern blur */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0C0D0E]/95 via-[#0C0D0E]/80 to-transparent"></div>
              
              {/* Live Activity Banner */}
              <div className="relative mb-6 animate-fade-in">
                <LiveActivityBanner language={language} />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest leading-none">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Pure Native Makhana</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
                    Premium Bihar Makhana Delivered Fresh
                  </h1>
                  <p className="text-[#999] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed font-sans">
                    Sourced directly from lotus ponds of Mithila, Bihar. Our foxnuts are slow-roasted, handpicked, and perfectly crispy to bring wellness and natural crunch to your home.
                  </p>
                  
                  {/* Bullet badges under hero */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-bold text-[#D4AF37] font-serif">
                    <span className="flex items-center gap-1">🌿 100% Organic</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">💪 High Protein Superfood</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">🍪 Gluten-Free Crunch</span>
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
                    <button
                      onClick={() => setActiveTab('shop')}
                      className="bg-[#D4AF37] hover:bg-[#B48F27] text-[#0C0D0E] font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer border border-transparent"
                    >
                      <span>Explore Farm Inventory</span>
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => setActiveTab('about')}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold py-3 px-8 rounded-xl transition-all cursor-pointer"
                    >
                      Our Sourcing Story
                    </button>
                  </div>
                </div>

                {/* Hero visual representation of makhana pack */}
                <div className="lg:col-span-5 relative hidden lg:flex justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#D4AF37]/15 blur-3xl"></div>
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 max-w-xs relative z-10 transform hover:rotate-2 transition-all duration-500">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#121417] border border-[#D4AF37]/20">
                      <img 
                        src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop" 
                        alt="Bihar Phool Makhana Organic Bowl" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest block">Top Rated Choice</span>
                      <h4 className="text-white font-serif font-bold text-base mt-0.5">Classic Slow-Roasted Phool</h4>
                      <div className="flex items-center gap-1 mt-1 text-sm text-yellow-400 font-bold">
                        <Star size={13} fill="currentColor" stroke="none" />
                        <Star size={13} fill="currentColor" stroke="none" />
                        <Star size={13} fill="currentColor" stroke="none" />
                        <Star size={13} fill="currentColor" stroke="none" />
                        <Star size={13} fill="currentColor" stroke="none" />
                        <span className="text-[#999] text-xs font-semibold ml-1.5">(4.9 rating)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STATISTICS TELEMTRY SCORECARD */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#121417] border border-white/5 shadow-md rounded-3xl py-8 px-6 sm:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#D4AF37] font-sans">15,000+</h3>
                  <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#999] mt-1">Happy Snacking Families</p>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#D4AF37] font-sans">98,000+</h3>
                  <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#999] mt-1">Orders Dispatched</p>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#D4AF37] font-sans">120+</h3>
                  <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#999] mt-1">Cities Server across India</p>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#D4AF37] font-sans">8 Varieties</h3>
                  <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#999] mt-1">Makhana & Roasted Nuts</p>
                </div>
              </div>
            </section>

            {/* ACTIVE FESTIVE HOLIDAY CAMPAIGNS AND COUPONS */}
            <FestiveOffersSection 
              language={language}
              cartTotal={cartSellingBeforeDiscount}
              onApplyCoupon={handleApplyCoupon}
              triggerToast={triggerToast}
            />

            {/* FEATURED PRODUCTS CAROUSEL/GRID SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">Direct Selection</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Most Savored Products</h2>
                </div>
                <button
                  onClick={() => { setSelectedCategory('all'); setActiveTab('shop'); }}
                  className="text-sm font-bold text-[#D4AF37] hover:text-[#B48F27] group flex items-center gap-1 transition-all cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Explore All Products</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8 items-stretch">
                  {[1, 2, 3, 4].map((id) => (
                    <ProductCardSkeleton key={id} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8 items-stretch">
                  {getDeduplicatedProducts(products).slice(0, 4).map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        allProducts={products}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onViewProduct={handleOpenProductDetail}
                        isInWishlist={wishlist.includes(p.id)}
                        onToggleWishlist={handleToggleWishlist}
                        language={language}
                        isCompared={comparedIds.includes(p.id)}
                        onToggleCompare={handleToggleCompare}
                        triggerToast={triggerToast}
                        showQuickAdd={true}
                      />
                    ))}
                </div>
              )}
            </section>

            {/* WHY CHOOSE COMPARTMENT */}
            <AboutSection />

            {/* HEALTH BENEFITS PORTAL */}
            <HealthBenefits />

            {/* SOURCING DEMONSTRATION PLAY BLOCK CARD */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#121417] text-[#F0F0F0] rounded-3xl overflow-hidden shadow-md border border-white/5 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544816155-12df9643f363?w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="p-8 sm:p-12 md:p-16 relative z-10 max-w-2xl space-y-6">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#1A1D21] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">Fresh Processing</span>
                  <h3 className="text-3xl font-serif font-bold text-[#D4AF37]">Traditional Bihar Popping Technique</h3>
                  <p className="text-[#999] text-xs sm:text-sm leading-relaxed">
                    Lotus seeds are collected, thoroughly sun-dried under rural Bihar sun, and pan-roasted on high flames in open furnaces. When temperature peaks, every makhana seed is struck manually with a wooden mallet to instantly pop and inflate. This laborious process is what preserves organic nutrients.
                  </p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setActiveTab('about')}
                      className="bg-[#D4AF37] text-[#0C0D0E] font-bold text-xs py-3 px-5 rounded-xl shadow-md hover:bg-[#B48F27] transition-all flex items-center gap-1.5 cursor-pointer border border-transparent"
                    >
                      <Play size={12} fill="currentColor" /> Let's read full Harvesting Journey
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* CLIENT TESTIMONIALS SLIDER BAR */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#121417] py-12 rounded-3xl border border-white/5">
              <div className="text-center mb-10 max-w-lg mx-auto">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">Client Diaries</span>
                <h3 className="text-2xl font-serif font-bold text-white">Words of Verified Buyers</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testimonials.map((t, idx) => (
                  <div key={idx} className="bg-[#16181D] p-5 rounded-2xl border border-white/5 shadow-md space-y-3">
                    <div className="flex text-yellow-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" stroke="none" />
                      ))}
                    </div>
                    <p className="text-[#999] text-xs italic leading-relaxed">"{t.comment}"</p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#D4AF37] font-serif">{t.name}</span>
                      <span className="text-[#888]">{t.roleOrCity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ ACCORDION SECTION */}
            <FAQ />

          </div>
        )}

        {/* VIEW: SHOP PRODUCTS PAGE */}
        {activeTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="shop-categories-inventory">
            
            {/* Header filters catalog */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">Direct Sourcing Farm-to-Table</span>
              <h2 className="text-3xl font-serif font-bold text-white mt-0.5">{language === 'hi' ? 'विशेष मखाना संग्रह' : 'Savor Organic Delights'}</h2>
              <p className="text-[#999] text-xs mt-1">
                {language === 'hi' 
                  ? 'बिहार के प्राकृतिक खेतों से सीधे प्राप्त हस्तशिल्प जैविक और पोषक तत्वों से भरपूर मखाना।' 
                  : 'Sourced directly from native Bihar lotus growers. Pure vegetarian, chemical-free super snacks.'}
              </p>
            </div>

            {/* Premium Controls Box: Search, Categories, and Sort Dropdown */}
            <div className="bg-[#121417]/45 border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl" id="shop-controls-container">
              {/* Top Row: Search input on left, Sort choice on right */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Bar Input */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'hi' ? 'ताजा मखाना उत्पादों को खोजें...' : 'Search delicious products...'}
                    className="w-full bg-[#0C0D0E]/80 border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 rounded-2xl py-3 pl-11 pr-10 text-xs font-semibold text-[#F0F0F0] outline-none transition-all duration-300 shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors" size={15} />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] hover:text-white transition-colors text-xs font-bold p-1 cursor-pointer"
                      title={language === 'hi' ? 'खोज हटाएं' : 'Clear search'}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sort Option Dropdown */}
                <div className="flex items-center gap-2.5 text-xs font-sans shrink-0">
                  <span className="text-[#888] font-bold uppercase tracking-wider">{language === 'hi' ? 'सॉर्ट करें' : 'Sort By'}:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="bg-[#0C0D0E]/80 border border-white/10 hover:border-[#D4AF37]/35 focus:border-[#D4AF37]/50 rounded-2xl px-4 py-3 font-semibold text-[#F0F0F0] outline-none cursor-pointer transition-all duration-300 text-xs"
                  >
                    <option value="default">{language === 'hi' ? 'विशेष उत्पाद (Featured)' : 'Featured'}</option>
                    <option value="best-selling">{language === 'hi' ? 'सर्वश्रेष्ठ बिक्री (Best Selling)' : 'Best Selling'}</option>
                    <option value="new-arrivals">{language === 'hi' ? 'नवीनतम आगमन (New Arrivals)' : 'New Arrivals'}</option>
                    <option value="price-low">{language === 'hi' ? 'मूल्य: कम से अधिक' : 'Price Low to High'}</option>
                    <option value="price-high">{language === 'hi' ? 'मूल्य: अधिक से कम' : 'Price High to Low'}</option>
                  </select>
                </div>
              </div>

              {/* Bottom Row: Category Tabs Selection */}
              <div className="border-t border-white/5 pt-4">
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">{language === 'hi' ? 'कैटेगरी फ़िल्टर' : 'Category Filter'}:</span>
                <div className="flex flex-wrap gap-2 text-xs font-semibold font-sans">
                  {[
                    { id: 'all', labelEn: 'All Products', labelHi: 'सभी उत्पाद' },
                    { id: 'raw-collection', labelEn: 'Raw Collection', labelHi: 'कच्चा मखाना' },
                    { id: 'flavoured-collection', labelEn: 'Flavoured Collection', labelHi: 'स्वादिष्ट मखाना' },
                    { id: 'health-collection', labelEn: 'Health Collection', labelHi: 'स्वास्थ्य और पोषण' },
                    { id: 'premium-collection', labelEn: 'Premium Collection', labelHi: 'प्रीमियम संग्रह' },
                    { id: 'gift-combo-collection', labelEn: 'Gift & Combo Collection', labelHi: 'उपहार और कॉम्बो' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-2.5 px-4.5 rounded-2xl border transition-all duration-300 select-none cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id 
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0C0D0E] font-black shadow-md scale-[1.02]' 
                          : 'border-white/5 bg-[#0C0D0E]/65 text-[#CCC] hover:bg-[#121417] hover:text-white hover:border-white/10'
                      }`}
                    >
                      {language === 'hi' ? cat.labelHi : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Render Category Sections inside Product Catalog Grid */}
            {loadingProducts ? (
              <div className="space-y-12">
                {[1, 2].map((sectionIndex) => (
                  <div key={sectionIndex} className="space-y-6">
                    <div className="h-6 bg-white/10 rounded-md w-48 animate-pulse"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8">
                      {[1, 2, 3, 4].map((id) => (
                        <ProductCardSkeleton key={id} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (() => {
              const allSections = getSectionedProducts();
              
              // Filter sections array to match selected Category Filter
              const activeSections = selectedCategory === 'all'
                ? allSections
                : allSections.filter(sec => sec.id === selectedCategory);
                
              // Keep sections that contain at least one matching product for the search terms
              const nonNoProductsSections = activeSections.filter(sec => sec.products.length > 0);
              
              if (nonNoProductsSections.length === 0) {
                return (
                  <div className="text-center py-20 space-y-4 font-sans bg-[#121417]/25 border border-white/5 rounded-3xl" id="no-products-view">
                    <p className="text-gray-400 font-bold text-sm">
                      {language === 'hi' ? 'कोई उत्पाद आपके फ़िल्टर से मेल नहीं खाता है।' : 'No verified products match your search or filters.'}
                    </p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedSort('default'); }}
                      className="text-[#D4AF37] hover:text-[#B48F27] transition-all duration-300 text-xs font-black underline bg-transparent border-none cursor-pointer"
                    >
                      {language === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear search and filters'}
                    </button>
                  </div>
                );
              }
              
              return (
                <div className="space-y-16">
                  {nonNoProductsSections.map((sec) => (
                    <div key={sec.id} className="space-y-6 scroll-mt-24" id={`shop-sec-${sec.id}`}>
                      {/* Category Header Section with Title, count and elegant subtitle */}
                      <div className="border-b border-white/5 pb-4">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-tight flex items-center gap-2">
                            {sec.id === 'best-sellers' && <span className="text-amber-500 text-base">🔥</span>}
                            {language === 'hi' ? sec.titleHi : sec.titleEn}
                          </h3>
                          <span className="text-[10px] font-mono text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/15">
                            {sec.products.length} {sec.products.length === 1 ? 'variety' : 'varieties'}
                          </span>
                        </div>
                        <p className="text-[#888] text-xs mt-1.5 font-sans leading-relaxed">
                          {language === 'hi' ? sec.descriptionHi : sec.descriptionEn}
                        </p>
                      </div>
                      
                      {/* Ultimate e-commerce grid layout: Exactly 4 products per row on Desktop, 2 on Tablet, 2 on Mobile */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8 items-stretch">
                        {sec.products.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            allProducts={products}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            onViewProduct={handleOpenProductDetail}
                            isInWishlist={wishlist.includes(p.id)}
                            onToggleWishlist={handleToggleWishlist}
                            language={language}
                            isCompared={comparedIds.includes(p.id)}
                            onToggleCompare={handleToggleCompare}
                            triggerToast={triggerToast}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

          </div>
        )}

        {/* VIEW: ABOUT STORY PAGE */}
        {activeTab === 'about' && <AboutSection />}

        {/* VIEW: FAQS PROFILE */}
        {activeTab === 'faq' && <FAQ />}

        {/* VIEW: CONTACT PAGE MODULE */}
        {activeTab === 'contact' && <ContactSection />}

        {/* VIEW: ORDER TRACKER PAGE MOBILE & DESKTOP */}
        {activeTab === 'track-order' && (
          <OrderTracker
            language={language}
            triggerToast={triggerToast}
          />
        )}

        {/* VIEW: USER PERSONAL ACCOUNT ORDER LISTS */}
        {activeTab === 'user-profile' && (
          <UserOrders
            user={user}
            orders={userOrders}
            loading={loadingOrders}
            onRefresh={() => token && fetchUserOrders(token)}
            setActiveTab={setActiveTab}
            language={language}
            spentPoints={spentPoints}
            redeemedCoupons={redeemedCoupons}
            onRedeemPoints={handleRedeemPoints}
            totalPointsAvailable={totalPointsAvailable}
            totalPointsAccumulated={totalPointsAccumulated}
            onCancelOrder={handleCancelOrder}
            onReorder={handleReorder}
          />
        )}

        {/* VIEW: WISHLIST SAVED PAGE */}
        {activeTab === 'wishlist' && (
          <WishlistPage
            wishlist={wishlist}
            products={products}
            language={language}
            onRemoveFromWishlist={handleToggleWishlist}
            onMoveToCart={handleMoveWishlistToCart}
            onNavigateToShop={() => setActiveTab('shop')}
            triggerToast={triggerToast}
          />
        )}

        {/* VIEW: COMPARE MULTIPLE PRODUCTS PAGE */}
        {activeTab === 'compare' && (
          <ComparePage
            comparedIds={comparedIds}
            products={products}
            language={language}
            onRemoveFromCompare={handleToggleCompare}
            onClearCompare={handleClearCompare}
            onAddToCart={handleAddToCart}
          />
        )}

          <NewsletterSignup language={language} triggerToast={triggerToast} />
        </React.Suspense>
      </main>

      {/* 3. Global Footer Component */}
      <footer className="bg-[#0C0D0E] text-[#CCC] pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand block */}
          <div className="space-y-4">
            <h3 className="text-white font-serif text-xl font-bold tracking-tight">Aditya Nutra Farm</h3>
            <p className="text-[#999] text-xs leading-relaxed">
              Empowering farmers across Bihar, India to cultivate and package premium large-grade Phool Foxnuts (Makhana) with supreme crispness and no artificial preservatives.
            </p>
            <div className="flex gap-4 text-xs font-bold text-[#D4AF37] uppercase tracking-widest pt-1">
              <span>Bihar, India</span>
            </div>
          </div>

          {/* Quick linkages */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Sourcing Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-xs text-[#999] font-semibold">
              <button onClick={() => setActiveTab('home')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Main Landing</button>
              <button onClick={() => setActiveTab('shop')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Shop fresh Snacks</button>
              <button onClick={() => setActiveTab('about')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Native Farmer Story</button>
              <button onClick={() => setActiveTab('faq')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Inquiries FAQs</button>
              <button onClick={() => setActiveTab('contact')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Contact Corporate Office</button>
            </div>
          </div>

          {/* Quick policies links */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Client Policies</h4>
            <div className="flex flex-col gap-2.5 text-xs text-[#999] font-semibold">
              <button onClick={() => setActiveTab('faq')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Privacy and Cookies Policy</button>
              <button onClick={() => setActiveTab('faq')} className="text-left hover:text-[#D4AF37] transition-colors transition-all cursor-pointer bg-transparent border-none p-0">Merchant Terms & Conditions</button>
              <button onClick={() => setActiveTab('faq')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Easy Returns & Refund Policy</button>
              <button onClick={() => setActiveTab('faq')} className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-0">Shipping & Logistics details</button>
            </div>
          </div>

          {/* Corporate Office coordinates */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Office Coordinates</h4>
            <div className="text-xs text-[#999] leading-relaxed font-semibold space-y-1">
              <p>📍 MADHUBANI DISTRICT, BIHAR, INDIA</p>
              <p>📞 +91 82103 51543</p>
              <p>✉️ support@adityanutrafarm.com</p>
              <p className="text-[10px] text-[#D4AF37] font-bold uppercase mt-2">© 2026 Aditya Nutra Farm. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. CLIENT CART SLIDE-OVER DRAWER OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl relative" id="checkout-sliding-cart">
            
            {/* Drawer Header */}
            <div className="bg-amber-900 text-white p-4 flex justify-between items-center border-b border-amber-800">
              <div className="flex items-center gap-2 flex-wrap pet-header-cart-wrap">
                <ShoppingCart size={18} />
                <h3 className="font-serif font-bold text-sm">My Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
                {cartSelling > 1000 ? (
                  <span className="bg-emerald-600 border border-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1 shrink-0 animate-pulse" id="fast-delivery-badge">
                    🚀 {language === 'hi' ? 'तेज़ डिलीवरी' : 'Fast Delivery'}
                  </span>
                ) : cartSelling > 0 ? (
                  <span className="bg-amber-700/50 border border-amber-650/40 text-amber-200 font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0" title="Add more to enjoy premium fast shipping!" id="fast-delivery-upsell-nudge">
                    {language === 'hi' ? `₹${1000 - cartSelling} और जोड़ें` : `+₹${1000 - cartSelling} to qualify`}
                  </span>
                ) : null}
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white hover:bg-white/10 p-1.5 rounded-full">Close</button>
            </div>

            {/* Form state flow */}
            {checkoutStep === 'cart' && (
              <div className="flex-grow flex flex-col justify-between overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <ShoppingCart size={48} className="text-gray-300 animate-pulse" />
                    <h4 className="font-serif font-bold text-amber-950 text-base">Your shopping bag is completely empty</h4>
                    <p className="text-gray-400 text-xs max-w-xs leading-relaxed">Fill your shopping cart with delicious and crunchy Bihar makhanas to initiate checkout!</p>
                    <button
                      onClick={() => { setIsCartOpen(false); setActiveTab('shop'); }}
                      className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse hover:animate-none"
                    >
                      <span>{language === 'hi' ? 'खरीदारी जारी रखें' : 'Continue Shopping'}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items list */}
                    <div className="p-4 space-y-3 flex-grow overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex gap-4 items-center bg-amber-50/20 p-3 rounded-xl border border-amber-100">
                          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-xs text-amber-850 shrink-0">
                            {item.product.name[0]}
                          </div>
                          <div className="flex-grow text-xs">
                            <h5 className="font-serif font-bold text-amber-950 leading-tight">
                              {getProductLocalization(language, item.product.name, item.product.description).name}
                            </h5>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="font-bold text-amber-900">₹{item.product.price}</span>
                              <span className="text-gray-400 line-through scale-90">₹{item.product.mrp}</span>
                            </div>

                            {/* Counter increments offset */}
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => handleUpdateCartQty(item.product.id, -1)} className="p-1 border border-amber-200 rounded-lg hover:bg-amber-50"><Minus size={10} /></button>
                              <span className="font-bold w-4 text-center text-amber-950">{item.quantity}</span>
                              <button onClick={() => handleUpdateCartQty(item.product.id, 1)} className="p-1 border border-amber-200 rounded-lg hover:bg-amber-50"><Plus size={10} /></button>
                              
                              <button onClick={() => handleRemoveFromCart(item.product.id)} className="text-[10px] text-red-500 hover:underline font-bold tracking-wider uppercase ml-auto">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shopping Cart Summary block */}
                    <div className="p-4 bg-amber-50 border-t border-amber-150 text-xs font-semibold space-y-3 shrink-0">
                      
                      <div className="flex justify-between text-gray-500">
                        <span>Aggregate MRP value:</span>
                        <span className="font-sans">₹{cartMRP}</span>
                      </div>
                      
                      <div className="flex justify-between text-emerald-600 font-extrabold text-[11px] uppercase tracking-wider">
                        <span>Variant savings discount:</span>
                        <span className="font-sans">₹{cartSavings} savings</span>
                      </div>

                      {/* Loyalty Converted Coupon input area */}
                      {user && (
                        <div className="bg-white border border-amber-100 p-2.5 rounded-xl space-y-1.5" id="cart-loyalty-coupon-box">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                              {language === 'hi' ? 'लॉयल्टी कूपन कोड लागू करें' : 'Apply loyalty Coupon'}
                            </label>
                            <div className="relative group select-none">
                              <span className="text-[9px] text-[#D4AF37] hover:underline font-extrabold uppercase tracking-wider cursor-help flex items-center gap-0.5" id="how-to-earn-loyalty-link">
                                ℹ️ {language === 'hi' ? 'कमाएं कैसे?' : 'How to earn?'}
                              </span>
                              {/* Tooltip explaining the 10% loyalty points system */}
                              <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#140E06] text-amber-100 text-[10px] p-3 rounded-xl border border-amber-500/30 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999] leading-normal font-normal normal-case">
                                <div className="absolute bottom-0 right-4 transform translate-y-1 rotate-45 w-2 h-2 bg-[#140E06] border-r border-b border-amber-500/30"></div>
                                <p className="font-bold text-[#D4AF37] mb-1 text-left">
                                  {language === 'hi' ? '10% लॉयल्टी पॉइंट सिस्टम' : '10% Loyalty Points System'}
                                </p>
                                <p className="text-amber-200/85 text-left">
                                  {language === 'hi'
                                    ? 'हर ऑर्डर पर कुल राशि का 10% हिस्सा मखाना गोल्ड पॉइंट्स के रूप में आपके खाते में क्रेडिट होता है, जिसे आप छूट कूपन में बदल सकते हैं!'
                                    : 'Earn 10% of your total order value back as valuable Makhana Gold points on every purchase! Redeem points for cash discounts directly in your account.'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              placeholder={language === 'hi' ? 'उदा. MAKHANA-XXXXXX' : 'E.g., MAKHANA-XXXXXX'}
                              className="bg-neutral-50 border border-neutral-200 rounded-lg py-1.5 px-2.5 text-xs font-mono uppercase flex-grow outline-none focus:border-amber-500 text-amber-900"
                            />
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(couponInput)}
                              className="bg-amber-800 hover:bg-amber-950 text-white font-bold text-[10px] py-1.5 px-4 rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              {language === 'hi' ? 'लागू करें' : 'Apply'}
                            </button>
                          </div>
                          {appliedCoupon && (
                            <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded border border-emerald-100 mt-1">
                              <span>🎟️ {appliedCoupon.code} (-₹{appliedCoupon.discount})</span>
                              <button 
                                type="button" 
                                onClick={() => { setAppliedCoupon(null); setCouponInput(''); }} 
                                className="text-red-500 hover:underline px-1 cursor-pointer font-extrabold"
                              >
                                {language === 'hi' ? 'हटाएं' : 'Remove'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-baseline font-bold text-base text-amber-950 border-t border-amber-100 pt-3">
                        <span className="font-serif">Subtotal to Pay:</span>
                        <span className="font-sans text-amber-900 text-lg">₹{cartSelling}</span>
                      </div>

                      {user ? (
                        <button
                          onClick={() => setCheckoutStep('details')}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider text-xs"
                        >
                          <span>Secure Checkout</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={handleLogin}
                          className="w-full border border-amber-600 text-amber-800 bg-amber-50 hover:bg-amber-100 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-bold uppercase tracking-wider text-xs cursor-pointer"
                        >
                          <span>Sign in with Google to checkout</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SHIPPING BILLING FORM VIEW */}
            {checkoutStep === 'details' && (
              <form onSubmit={handleCheckoutSubmit} className="flex-grow flex flex-col justify-between overflow-y-auto">
                <div className="p-4 space-y-4 flex-grow overflow-y-auto text-xs">
                  
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2 mb-2">
                    <h4 className="font-serif font-bold text-amber-950 text-sm">Shipping & Payout Details</h4>
                    <button type="button" onClick={() => setCheckoutStep('cart')} className="text-amber-700 underline font-bold">Back to Bag</button>
                  </div>

                  {checkoutMessage && (
                    <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-xl">
                      {checkoutMessage}
                    </div>
                  )}

                  {/* SELECT SAVED OR NEW ADDRESS OPTION */}
                  {uniquePreviousAddresses.length > 0 && (
                    <div className="mb-4 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-900 mb-2 flex items-center gap-1">
                        <span className="text-amber-700">📍</span> Choose Shipping Destination
                      </span>
                      <div className="space-y-2">
                        {/* Render Saved Addresses */}
                        <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                          {uniquePreviousAddresses.map((addr, idx) => {
                            const isSelected = selectedAddressIndex === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedAddressIndex(idx)}
                                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600"
                                    : "border-amber-100 bg-white text-neutral-700 hover:border-amber-300"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="font-semibold text-[11px] text-amber-950 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                    {addr.fullName}
                                  </div>
                                  {isSelected && (
                                    <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                                  {addr.address}, {addr.city}, {addr.state} - {addr.zipCode}
                                </p>
                                <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                                  📞 {addr.phone}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* New Address Option */}
                        <div
                          onClick={() => {
                            setSelectedAddressIndex("new");
                            setCheckoutForm(prev => ({
                              ...prev,
                              fullName: '',
                              address: '',
                              city: '',
                              zipCode: '',
                              phone: ''
                            }));
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                            selectedAddressIndex === "new"
                              ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600"
                              : "border-amber-100 bg-white text-neutral-700 hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">
                              +
                            </div>
                            <div>
                              <span className="block font-bold text-[11px] text-amber-950">Ship to a new address</span>
                              <span className="block text-[10px] text-gray-400">Enter a completely different delivery place</span>
                            </div>
                          </div>
                          {selectedAddressIndex === "new" && (
                            <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                              Active Form
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">Full Delivery Name</label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.fullName}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                        placeholder="E.g., Aanand Kumar"
                        className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 bg-neutral-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">Full Sourcing Address</label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                        placeholder="Street address, colony, floor number..."
                        className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 bg-neutral-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">City</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.city}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                          placeholder="E.g., Patna"
                          className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 bg-neutral-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">PIN ZIP Code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={checkoutForm.zipCode}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, zipCode: e.target.value.replace(/\D/g, '') })}
                          placeholder="6 digits PIN"
                          className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 bg-neutral-50/50 font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">Active Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        placeholder="E.g., +91 98765 43210"
                        className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 bg-neutral-50/50 font-sans"
                      />
                    </div>

                    {/* Payment selectors */}
                    <div>
                      <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">Select Payment Channel</label>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs font-semibold">
                        
                        {/* Razorpay Option */}
                        <div 
                          onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'Razorpay' })}
                          className={`border rounded-xl p-3 flex flex-col justify-between aspect-[16/10] cursor-pointer relative transition-all ${
                            checkoutForm.paymentMethod === 'Razorpay' 
                              ? 'border-amber-600 bg-amber-50/50 text-amber-900 ring-2 ring-amber-600/35' 
                              : 'border-amber-100 bg-white hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex justify-between items-baseline">
                            <Landmark size={18} className="text-amber-700" />
                            {checkoutForm.paymentMethod === 'Razorpay' && <span className="bg-amber-600 w-2 h-2 rounded-full ring-2 ring-amber-300"></span>}
                          </div>
                          <div>
                            <span className="block font-bold">Online Payment</span>
                            <span className="text-[10px] text-gray-400">Razorpay Secures Gateway</span>
                          </div>
                        </div>

                        {/* COD Option */}
                        <div 
                          onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'COD' })}
                          className={`border rounded-xl p-3 flex flex-col justify-between aspect-[16/10] cursor-pointer relative transition-all ${
                            checkoutForm.paymentMethod === 'COD' 
                              ? 'border-amber-600 bg-amber-50/50 text-amber-900 ring-2 ring-amber-600/35' 
                              : 'border-amber-100 bg-white hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex justify-between items-baseline">
                            <BadgePercent size={18} className="text-amber-700" />
                            {checkoutForm.paymentMethod === 'COD' && <span className="bg-amber-600 w-2 h-2 rounded-full ring-2 ring-amber-300"></span>}
                          </div>
                          <div>
                            <span className="block font-bold">Cash On Delivery</span>
                            <span className="text-[10px] text-emerald-600">Free delivery option</span>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>

                {/* Submit row details */}
                <div className="p-4 bg-amber-50 border-t border-amber-150 text-xs font-semibold space-y-3 shrink-0">
                  <div className="flex justify-between items-baseline font-bold text-amber-950">
                    <span className="font-serif">Subtotal to Pay:</span>
                    <span className="font-sans text-amber-900 text-lg">₹{cartSelling}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">By completing the checkout order, you confirm direct sourcing metrics representing Madhubani regional lotus farmers.</p>
                  
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider text-xs"
                  >
                    {placingOrder && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    <Lock size={12} />
                    <span>Pay ₹{cartSelling} & Confirm Order</span>
                  </button>
                </div>
              </form>
            )}

            {/* ORDER SUCCESS PAGE CONFORMATION COMPONENT */}
            {checkoutStep === 'success' && lastPlacedOrder && (
              <div className="flex-grow flex flex-col justify-between overflow-y-auto p-6 text-center space-y-6">
                
                <div className="space-y-4 flex-grow flex flex-col justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 15 }}
                    className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto ring-4 ring-emerald-100 border border-emerald-300 relative overflow-hidden shadow-sm animate-pulse-subtle"
                  >
                    <motion.svg
                      className="w-8 h-8 text-emerald-600 z-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.55, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-950">E-Commerce Handshake Successful!</h3>
                    <p className="text-xs text-gray-500 mt-1">Your order #{lastPlacedOrder.id} has been created in our database cloud server.</p>
                  </div>
                  
                  <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-xs space-y-2 text-left">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Payment status:</span>
                      <span className="text-amber-800">{lastPlacedOrder.status === 'Paid' ? 'Paid Secure Gateway' : 'COD Approved'}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Consignee:</span>
                      <span>{lastPlacedOrder.fullName}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Expected logistics:</span>
                      <span className="text-emerald-700">ANT Cargo India</span>
                    </div>
                  </div>

                  {/* Sparkly Loyalty Points section */}
                  <div className="bg-[#1C120C] border border-[#D4AF37]/30 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex items-center gap-2 text-yellow-500 font-serif font-semibold text-xs">
                      <Sparkles size={14} className="fill-yellow-500 animate-pulse text-yellow-500" />
                      <span>{language === 'hi' ? 'मखाना गोल्ड लॉयल्टी अपडेट' : 'Makhana Gold Loyalty Update'}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-gray-400 text-[11px]">{language === 'hi' ? 'इस ऑर्डर से अर्जित अंक:' : 'Points earned on this order:'}</span>
                      <span className="font-extrabold font-mono text-sm text-[#D4AF37]">+{Math.floor(lastPlacedOrder.totalAmount * 0.10)} Pts</span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-amber-500/10 pt-2">
                      <span className="text-gray-400 text-[11px]">{language === 'hi' ? 'आपका नया कुल अंक बैलेंस:' : 'Your updated loyalty balance:'}</span>
                      <span className="font-extrabold font-mono text-sm text-white">{totalPointsAvailable} Pts</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">Our native lotus growers will dispatch package units directly from our Purnea ponds within 24 hours.</p>
                </div>

                <div className="space-y-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab('user-profile');
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Track Package Logistics
                  </button>
                  <button
                    onClick={() => printOrderInvoice(lastPlacedOrder, language)}
                    className="w-full bg-amber-50 hover:bg-amber-100 text-[#0C0D0E] border border-amber-200 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer size={13} className="text-[#D4AF37]" />
                    <span>{getUiTranslation(language, 'printInvoice')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab('shop');
                    }}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-[#2C2115] py-2.5 px-4 rounded-xl font-semibold transition-all text-xs cursor-pointer border border-neutral-200"
                  >
                    Continue Snacking
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. SINGLE PRODUCT DISCOVERY MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-amber-105 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left Column product image modal with dynamic cursor tracking zoom */}
            <div 
              className="md:w-1/2 aspect-square md:aspect-auto relative bg-amber-50 overflow-hidden cursor-zoom-in"
              onMouseMove={handleModalMouseMove}
              onMouseLeave={handleModalMouseLeave}
            >
              <img 
                src={
                  selectedProduct.id === 1 ? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop" :
                  selectedProduct.id === 2 ? "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop" :
                  selectedProduct.id === 3 ? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60" :
                  selectedProduct.id === 4 ? "https://images.unsplash.com/photo-1486299267070-8382e2144520?w=600&auto=format&fit=crop" :
                  selectedProduct.id === 5 ? "https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=600&auto=format&fit=crop" :
                  selectedProduct.id === 6 ? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80" :
                  selectedProduct.id === 7 ? "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop" :
                  selectedProduct.id === 8 ? "https://images.unsplash.com/photo-1543157145-f78c636d023d?w=600&auto=format&fit=crop" :
                  selectedProduct.image
                } 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover"
                style={modalZoomStyle}
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm hover:bg-white text-amber-900 border border-amber-200 p-2 rounded-full transition-all md:hidden"
              >
                Close View
              </button>
            </div>

            {/* Right Column details modal scroll content */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
              
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    {selectedProduct.category} variety
                  </span>
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="hover:bg-neutral-100 p-1 rounded-full text-gray-400 hidden md:inline-block"
                  >
                    Close View
                  </button>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-amber-950 text-xl leading-snug">{selectedProduct.name}</h4>
                  
                  {/* SOCIAL PROOF: rating stars + based on 1,200+ Reviews */}
                  <div className="flex items-center gap-1.5 mt-1.5" id="detail-modal-social-proof">
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < Math.round(selectedProduct.rating) ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          className="stroke-[1.5]"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-950 font-sans">
                      {(selectedProduct.rating || 4.8).toFixed(1)}/5
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {language === 'hi' ? '(1,200+ समीक्षाएं)' : 'Based on 1,200+ Reviews'}
                    </span>
                  </div>
                </div>

                <p className="text-amber-900/80 text-xs leading-relaxed">{selectedProduct.description}</p>

                {/* BIHAR FARMER BADGE: 🌾 Sourced from Bihar Farmers */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 py-1.5 px-3 rounded-xl text-xs text-amber-800 font-bold w-full sm:w-fit" id="detail-modal-farmer-badge">
                  <span>🌾 {language === 'hi' ? 'सीधे बिहार के किसानों से प्राप्त' : 'Directly Sourced from Bihar Farmers'}</span>
                </div>

                {/* NUTRITION HIGHLIGHTS: ✅ High Protein, ✅ Low Fat, ✅ Gluten Free, ✅ Rich in Calcium */}
                <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-900/5 space-y-2" id="detail-modal-nutrition-grid">
                  <span className="block text-[10px] font-bold text-amber-900/60 uppercase tracking-widest">{language === 'hi' ? 'पोषण गुण' : 'Nutrition Highlights'}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-950 font-semibold">
                      <span className="text-emerald-600 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">✓</span>
                      <span>{language === 'hi' ? 'हाई प्रोटीन' : 'High Protein'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-950 font-semibold">
                      <span className="text-emerald-600 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">✓</span>
                      <span>{language === 'hi' ? 'कम फैट' : 'Low Fat'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-950 font-semibold">
                      <span className="text-emerald-600 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">✓</span>
                      <span>{language === 'hi' ? 'ग्लूटेन मुक्त' : 'Gluten Free'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-950 font-semibold">
                      <span className="text-emerald-600 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">✓</span>
                      <span>{language === 'hi' ? 'कैल्शियम प्रचुर' : 'Rich in Calcium'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[9px]">{language === 'hi' ? 'शासकीय विक्रय मूल्य' : 'Sovereign selling price'}</span>
                    <span className="font-bold text-amber-900 text-base">₹{selectedProduct.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[9px] text-right">{language === 'hi' ? 'एमआरपी मूल्य' : 'Marp value'}</span>
                    <span className="text-gray-400 line-through text-right block">₹{selectedProduct.mrp}</span>
                  </div>
                </div>

                {/* DISPLAY SAVINGS: calculated auto and styled professionally with emerald border */}
                {selectedProduct.mrp > selectedProduct.price && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs font-bold py-1.5 px-3 rounded-lg border border-emerald-200 w-fit flex items-center gap-1.5" id="detail-modal-savings-badge">
                    <Sparkles size={12} className="text-emerald-600 animate-pulse animate-duration-1000" />
                    <span>
                      {language === 'hi' 
                        ? `बचत ₹${Math.round(selectedProduct.mrp - selectedProduct.price)}` 
                        : `Save ₹${Math.round(selectedProduct.mrp - selectedProduct.price)}`}
                    </span>
                  </div>
                )}

                {/* Checkout row inside modal */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                    className="border border-amber-600 hover:bg-amber-50 text-amber-800 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    Add Variety to Bag
                  </button>
                  <button
                    onClick={() => {
                      handleBuyNow(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                  >
                    Instant Purchase
                  </button>
                </div>

                {/* Product Share Widget */}
                <div className="border-t border-amber-100 pt-3 flex flex-col gap-1.5" id="product-detail-share-box">
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                    <span>{language === 'hi' ? 'इस किस्म को साझा करें' : 'Share this Variety'}</span>
                    <span className="text-[9px] text-gray-400 capitalize font-normal">{language === 'hi' ? 'अपनों को बताएं' : 'Spread the crunch!'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareProduct(selectedProduct)}
                      className="flex-1 bg-amber-50 hover:bg-amber-100/80 active:scale-95 text-amber-800 border border-amber-200/50 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>{language === 'hi' ? 'शेयर करें / लिंक कॉपी करें' : 'Share / Copy Link'}</span>
                    </button>
                    
                    {/* Direct Quick-Share via WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${selectedProduct.name} - ${language === 'hi' ? 'प्रीमियम मिथिला मखाना' : 'Premium Bihar Lotus Makhana variety'}: ${window.location.origin}/?product=${selectedProduct.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-emerald-100 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                      title={language === 'hi' ? 'व्हाट्सएप पर साझा करें' : 'Share on WhatsApp'}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3.15 5.319.15 5.4 0 9.794-4.394 9.797-9.796.002-2.586-1.003-5.019-2.833-6.851C17.098 1.024 14.672.019 12.01.018 6.61.018 2.215 4.411 2.212 9.813c0 1.968.513 3.882 1.488 5.607l-.986 3.6L6.647 19.15z"/>
                      </svg>
                    </a>

                    {/* Direct Quick-Share via Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`${selectedProduct.name} - Aditya Nutra Farms`)}&body=${encodeURIComponent(`${language === 'hi' ? 'आदित्य न्यूट्रा फार्म्स से स्वादिष्ट मिथिला मखाना देखें:' : 'Check out this premium Bihar lotus makhana on Aditya Nutra Farms:'} ${selectedProduct.name}! \nLink: ${window.location.origin}/?product=${selectedProduct.id}`)}`}
                      className="p-2 border border-neutral-100 hover:bg-neutral-50 text-gray-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                      title={language === 'hi' ? 'ईमेल द्वारा साझा करें' : 'Share via Email'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Reviews section inside modal */}
                <div className="border-t border-amber-100 pt-4 space-y-3.5">
                  <h5 className="font-serif font-bold text-amber-950 text-sm">Customer Feedback</h5>
                  
                  {/* Review lists scroll */}
                  <div className="space-y-2 max-h-[150px] overflow-y-auto text-[11px] pr-1">
                    {!selectedProduct.reviews || selectedProduct.reviews.length === 0 ? (
                      <p className="text-gray-400 italic">No feedback published yet. Be the first to review!</p>
                    ) : (
                      selectedProduct.reviews.map((rev) => (
                        <div key={rev.id} className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-xs space-y-1.5">
                          <div className="flex justify-between font-bold">
                            <span className="text-amber-950 font-serif capitalize">{rev.name}</span>
                            <span className="text-yellow-500 font-sans tracking-wide">★{rev.rating}</span>
                          </div>
                          <p className="text-gray-600 mt-1 leading-relaxed">"{rev.comment}"</p>
                          {rev.photo && (
                            <div className="mt-1">
                              <img 
                                src={rev.photo} 
                                alt="Feedback Delivery Photo"
                                className="w-16 h-16 rounded-lg object-cover border border-amber-200/50 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add review form */}
                  {token ? (
                    <form onSubmit={handlePostReview} className="space-y-3 bg-amber-50/20 p-3 rounded-2xl border border-amber-100">
                      <div className="flex justify-between items-center">
                        <span className="block font-bold text-amber-800 uppercase tracking-wider text-[9px]">Rate this variety & Attach photo</span>
                        
                        {/* Camera access interface toggle */}
                        {!showCamera ? (
                          <button
                            type="button"
                            onClick={startCamera}
                            className="text-amber-800 hover:text-amber-950 text-[10px] font-bold flex items-center gap-1 bg-amber-100/60 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-all cursor-pointer border-none"
                          >
                            <Camera size={12} />
                            <span>{reviewForm.photo ? 'Retake Photo' : 'Delivery Photo'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="text-red-700 hover:text-red-950 text-[10px] font-bold flex items-center gap-1 bg-red-50/60 px-2 py-0.5 rounded-md hover:bg-red-50 transition-all cursor-pointer border-none"
                          >
                            <CameraOff size={12} />
                            <span>Stop Camera</span>
                          </button>
                        )}
                      </div>

                      {/* Video Camera Live Feed frame */}
                      {showCamera && (
                        <div className="border border-amber-200 bg-neutral-900 rounded-xl overflow-hidden relative">
                          <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-40 object-cover scale-x-[-1]"
                          />
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 transition-all border-none cursor-pointer"
                            >
                              <Camera size={12} />
                              <span>Take Snap</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Captured preview indicator */}
                      {!showCamera && reviewForm.photo && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-1.5 rounded-xl text-left">
                          <img 
                            src={reviewForm.photo} 
                            alt="Captured snapshot preview"
                            className="w-10 h-10 rounded-lg object-cover border border-emerald-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-[10px] text-emerald-800 leading-tight">
                            <p className="font-bold">✓ Photo Attached</p>
                            <button 
                              type="button" 
                              onClick={() => setReviewForm(prev => ({ ...prev, photo: '' }))}
                              className="text-red-600 hover:underline inline-block mt-0.5 font-medium border-none bg-transparent cursor-pointer"
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 items-center">
                        {/* Interactive Star Rating Selector with subtle hover/click scaling animations */}
                        <div className="flex gap-1 items-center bg-white border border-amber-200 rounded-lg px-2 py-1 select-none shrink-0 h-[32px]">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <motion.button
                              key={starValue}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: starValue })}
                              whileHover={{ scale: 1.3, rotate: 5 }}
                              whileTap={{ scale: 0.85 }}
                              transition={{ duration: 0.15 }}
                              className="focus:outline-none cursor-pointer p-0.5 transition-transform bg-transparent border-none"
                              id={`star-btn-${starValue}`}
                              title={`${starValue} Stars`}
                            >
                              <Star
                                size={14}
                                className={`transition-colors duration-150 ${
                                  starValue <= reviewForm.rating
                                    ? "text-amber-500 fill-amber-400"
                                    : "text-amber-200 hover:text-amber-400"
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>

                        <input
                          type="text"
                          required
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Your crispy feedback..."
                          className="flex-grow border border-amber-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-amber-950 outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="bg-amber-800 hover:bg-amber-900 text-white text-xs py-1.5 px-3.5 rounded-lg font-bold border-none cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-[10px] text-gray-400 bg-neutral-50 px-3 py-1.5 rounded-lg italic">Please sign in to rate this product or publish your reviews.</p>
                  )}

                </div>

              </div>
              
            </div>

          </div>
        </div>
      )}

      {/* 6. ADMIN SYSTEM CONSOLE CARD PANEL (RBAC BLOCKED) */}
      {isAdminConsoleOpen && token && (
        <AdminPanel
          token={token}
          language={language}
          triggerToast={triggerToast}
          onClose={() => {
            setIsAdminConsoleOpen(false);
            fetchProducts(); // reload catalogs on closes
          }}
        />
      )}

      {/* 7. AI BOT WIDGET AND WHATSAPP FLOATING WIDGET DISPATCH BUTTON (STICKY HELPLINE) */}
      <Chatbot 
        language={language}
        products={products}
        handleOpenProductDetail={handleOpenProductDetail}
        triggerToast={triggerToast}
      />

      <a
        href="https://wa.me/918210351543?text=Hi%20Aditya%20Nutra%20Farm,%20I%20have%20an%25inquiry%25regarding%25premium%25Makhana"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center border border-emerald-500 hover:scale-110 active:scale-95 transition-all group"
        title="Direct Sourcing Support Chat"
        aria-label="Direct Sourcing Support Chat"
      >
        <MessageSquare size={24} className="group-hover:rotate-6 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 font-bold text-xs uppercase tracking-wider ml-0 group-hover:ml-2 whitespace-nowrap">
          Farmer Chat
        </span>
      </a>

      {/* 7.5 GOOGLE FORMS CUSTOMERS ENGAGEMENT PIPELINE BANNER */}
      <AnimatePresence>
        {activeGoogleForm && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className={`fixed bottom-6 left-6 z-40 max-w-sm rounded-2xl shadow-2xl border p-5 space-y-3 font-sans ${theme === 'dark' ? 'bg-[#121417] text-white border-white/10 shadow-black/80' : 'bg-white border-amber-300 text-amber-950 shadow-amber-200/50'}`}
            id="google-form-floating-campaign-banner"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded leading-none">
                  📝 {language === 'hi' ? 'विशेष फीडबैक सर्वे' : 'Exclusive Brand Survey'}
                </span>
                <h4 className="font-serif font-black text-xs sm:text-sm">
                  {activeGoogleForm.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveGoogleForm(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-neutral-150 transition-colors border-none bg-transparent cursor-pointer"
                title="Dismiss Banner"
              >
                <X size={14} />
              </button>
            </div>
            
            <p className="text-[11px] leading-relaxed text-gray-400 font-normal">
              {language === 'hi' 
                ? 'हमारे मखाने के स्वाद और गुणवत्ता पर 2 मिनट का सर्वे भरकर हमें बेहतर बनने में मदद करें!' 
                : 'Help us improve by filling out a quick 2-minute survey about our crunch quality and flavoring!'}
            </p>

            <div className="pt-1.5 flex items-center gap-2">
              <a
                href={activeGoogleForm.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (triggerToast) triggerToast(
                    language === 'hi' ? 'सर्वेक्षण फॉर्म खुल रहा है, धन्यवाद!' : 'Opening feedback survey form. Thank you!', 
                    'success'
                  );
                }}
                className="bg-[#D4AF37] hover:bg-[#Bca025] text-amber-950 font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg shadow-sm transition-all text-center flex-grow flex items-center justify-center gap-1.5"
              >
                <span>{language === 'hi' ? 'गूगल फॉर्म भरें' : 'Share Feedback on Google Forms'}</span>
                <ArrowRight size={11} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. BRAND CUSTOM TOAST ALERTS OVERLAY DESIGN */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed bottom-6 left-6 z-50 max-w-sm bg-[#16181D] border border-white/10 hover:border-[#D4AF37]/30 p-4 rounded-2xl shadow-2xl flex gap-3 items-start hover:shadow-xl transition-all"
            id="elegant-app-toast"
          >
            <div className={`p-1.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : toast.type === 'err' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
              <Sparkles size={16} />
            </div>
            <div className="space-y-1">
              <p className="text-white text-xs font-semibold leading-relaxed font-sans">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-[#999] hover:text-white text-sm font-bold font-mono ml-auto leading-none border-none bg-transparent cursor-pointer"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8.5 INTERACTIVE PRE-PAYMENT ORDER SUMMARY MODAL */}
      {showOrderSummaryModal && (
        <div 
          className="fixed inset-0 bg-[#0C0D0E]/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in" 
          id="order-summary-overlay"
        >
          <div className="bg-[#141517] border border-amber-600/30 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto" id="order-summary-card">
            
            {/* Modal Header */}
            <div className="text-center pb-2 border-b border-white/5 space-y-1">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-[#D4AF37] mx-auto">
                <ShieldCheck size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                {language === 'hi' ? 'ऑर्डर सारांश रिव्यू' : 'Review Your Order'}
              </h3>
              <p className="text-gray-400 text-xs">
                {language === 'hi' ? 'कृपया भुगतान पुष्टि से पहले अपने विवरण की जांच करें:' : 'Please inspect your order breakdown before payment:'}
              </p>
            </div>

            {/* Delivery address & method recap card */}
            <div className="bg-[#1B1916] border border-amber-600/10 p-4 rounded-2xl text-xs space-y-2.5 text-left">
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-[10px] uppercase tracking-wider">
                <span>📍 {language === 'hi' ? 'वितरण और भुगतान जानकारी' : 'Shipping & Payment Target'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
                <div>
                  <p className="text-[#888] font-bold uppercase text-[9px] tracking-widest">{language === 'hi' ? 'प्राप्तकर्ता:' : 'Recipient'}</p>
                  <p className="font-bold text-white mt-0.5">{checkoutForm.fullName}</p>
                  <p className="font-medium mt-0.5">{checkoutForm.phone}</p>
                </div>
                <div>
                  <p className="text-[#888] font-bold uppercase text-[9px] tracking-widest">{language === 'hi' ? 'पता:' : 'Delivery Address'}</p>
                  <p className="mt-0.5 leading-relaxed text-gray-300 truncate-2-lines">{checkoutForm.address}, {checkoutForm.city}, Bihar - {checkoutForm.zipCode}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-gray-400">
                <span>{language === 'hi' ? 'चुना गया भुगतान चैनल:' : 'Payment Channel:'}</span>
                <span className="bg-amber-600/10 border border-amber-600/25 text-[#D4AF37] text-[10px] font-extrabold uppercase tracking-widest py-0.5 px-2.5 rounded-full">
                  {checkoutForm.paymentMethod === 'Razorpay' 
                    ? (language === 'hi' ? 'ऑनलाइन भुगतान (Razorpay)' : 'Razorpay Secure Net')
                    : (language === 'hi' ? 'कैश ऑन डिलीवरी (COD)' : 'Cash on Delivery (COD)')}
                </span>
              </div>
            </div>

            {/* Itemized Cart List breakdown */}
            <div className="space-y-2 text-left">
              <label className="block text-[#888] text-[9px] uppercase font-extrabold tracking-widest">
                {language === 'hi' ? 'बैग में उत्पाद सूची:' : 'Your Makhana Bag Items:'}
              </label>
              <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 border border-white/5 bg-black/20 p-2.5 rounded-2xl">
                {cart.map((item) => {
                  const localized = getProductLocalization(language, item.product.name, item.product.description);
                  return (
                    <div key={item.product.id} className="flex justify-between items-center gap-3 text-xs py-1 border-b border-white/5 last:border-none">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img 
                          src={item.product.image} 
                          alt={localized.name}
                          className="w-8 h-8 rounded-lg object-cover bg-neutral-900 border border-white/5 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-[11px]">{localized.name}</p>
                          <p className="text-[10px] text-gray-500">
                            ₹{item.product.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-300">₹{item.product.price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom billing breakdown featuring calculated taxes (5% GST included) */}
            <div className="bg-[#111214] border border-white/5 p-4 rounded-2xl text-xs space-y-2 text-left">
              <div className="flex justify-between text-gray-400">
                <span>{language === 'hi' ? 'कुल राशि (बिना छूट):' : 'Item Subtotal:'}</span>
                <span className="font-mono">₹{cartSellingBeforeDiscount}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>{language === 'hi' ? 'डिस्काउंट कूपन छूट:' : 'Coupon Discount:'}</span>
                  <span className="font-mono">-₹{appliedCoupon.discount}</span>
                </div>
              )}

              {/* Explicit calculated taxes breakdown standard CGST + SGST (5% total) */}
              {(() => {
                const subtotalAmt = Math.max(0, cartSellingBeforeDiscount - (appliedCoupon ? appliedCoupon.discount : 0));
                // GST is standard 5% included for food products. 2.5% CGST + 2.5% SGST.
                const totalGstInc = Math.round(subtotalAmt - (subtotalAmt / 1.05));
                const cgstInc = Math.round(totalGstInc / 2);
                const sgstInc = totalGstInc - cgstInc;
                return (
                  <>
                    <div className="flex justify-between text-[#888] text-[10px] pt-1.5 border-t border-white/5">
                      <span>{language === 'hi' ? 'केंद्रीय जीएसटी (CGST 2.5% शामिल):' : 'Calculated CGST (2.5% Included):'}</span>
                      <span className="font-mono">₹{cgstInc}</span>
                    </div>
                    <div className="flex justify-between text-[#888] text-[10px]">
                      <span>{language === 'hi' ? 'राज्य जीएसटी (SGST 2.5% शामिल):' : 'Calculated SGST (2.5% Included):'}</span>
                      <span className="font-mono">₹{sgstInc}</span>
                    </div>
                    <div className="flex justify-between text-amber-500/80 text-[10px] pb-1.5 border-b border-white/5">
                      <span>{language === 'hi' ? 'कुल गणनाकृत कर (5% जीएसटी शामिल):' : 'Total Calculated Tax (5% GST Included):'}</span>
                      <span className="font-mono">₹{totalGstInc}</span>
                    </div>
                  </>
                );
              })()}

              <div className="flex justify-between font-serif text-sm font-extrabold text-white pt-1">
                <span>{language === 'hi' ? 'कुल देय राशि:' : 'Final Pay Total:'}</span>
                <span className="font-sans text-[#D4AF37] text-base">₹{cartSelling}</span>
              </div>
            </div>

            {/* Explicit actions: 'Confirm and Pay' trigger */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOrderSummaryModal(false)}
                className="bg-[#212327] hover:bg-[#2c2f35] text-white font-medium py-3 rounded-xl transition-all text-xs cursor-pointer text-center"
              >
                {language === 'hi' ? 'वापस जाएं (Edit)' : 'Go Back & Edit'}
              </button>
              <button
                type="button"
                onClick={handleConfirmOrderSummary}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider font-sans"
              >
                <Lock size={12} className="shrink-0" />
                <span>{language === 'hi' ? 'पुष्टि और भुगतान करें ⚡' : 'Confirm & Pay ⚡'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 9. OTP MOBILE CONFORMATION VERIFICATION MODAL */}
      {showOtpVerificationModal && (
        <div 
          className="fixed inset-0 bg-[#0C0D0E]/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in" 
          id="otp-verification-overlay"
        >
          <div className="bg-[#141517] border border-amber-600/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center relative" id="otp-verification-card">
            
            {/* Modal logo badge */}
            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-[#D4AF37] mx-auto ring-4 ring-[#D4AF37]/10">
              <Lock size={22} className="text-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider">
                {language === 'hi' ? 'ऑर्डर की पुष्टि (ओटीपी सत्यापन)' : 'Order Handshake (OTP Security)'}
              </h3>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                {language === 'hi' 
                  ? `ऑर्डर सुरक्षित और त्रुटि रहित बनाने के लिए, हमने आपके मोबाइल नंबर पर एक विशिष्ट कोड भेजा है:` 
                  : `To verify that this order is genuine and there are no mistakes, we have sent a 6-digit confirmation code to your active mobile number:`}
              </p>
              <div className="text-[#D4AF37] font-mono text-xs font-extrabold mt-1 bg-[#D4AF37]/10 py-1 px-3 rounded-lg inline-block tracking-widest border border-[#D4AF37]/20">
                {checkoutForm.phone}
              </div>
            </div>

            {/* Simulating Receiving SMS payload */}
            <div className="bg-[#1B1916] border border-amber-600/20 p-3 rounded-2xl text-left space-y-1">
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-[9px] uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                <span>{language === 'hi' ? 'प्राप्त सिम्युलेटेड एसएमएस संदेश' : 'Simulated SMS Message Received'}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                {language === 'hi' 
                  ? 'आदित्य न्यूट्रा फार्म्स डायरेक्ट सर्विस। आपके मखाना ऑर्डर सत्यापन ओटीपी है:' 
                  : 'Message from Aditya Nutra Farms Direct. Your order verification OTP code is:'}
              </p>
              <div className="text-center pt-1 pb-1 selection:bg-amber-600">
                <span className="font-mono text-lg font-black tracking-widest text-[#D4AF37] bg-black/50 px-4 py-1.5 rounded-xl border border-white/5 select-all">
                  {generatedOtp}
                </span>
              </div>
            </div>

            {/* Verification digits input area */}
            <div className="space-y-1.5 text-left">
              <label className="block text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                {language === 'hi' ? '6-अंकीय ओटीपी प्रविष्ट करें:' : 'Enter 6-Digit OTP:'}
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => {
                  setOtpVerificationError(null);
                  setEnteredOtp(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="------"
                className="w-full text-center tracking-[0.4em] font-mono text-base font-extrabold py-2.5 border border-amber-600/20 rounded-xl bg-black/40 text-[#D4AF37] placeholder-gray-700 focus:border-[#D4AF37] outline-none"
              />
              {otpVerificationError && (
                <p className="text-rose-400 text-[10px] font-semibold text-center mt-1">⚠️ {otpVerificationError}</p>
              )}
            </div>

            {/* Resend counter tracker state */}
            <div className="text-center text-[10px]">
              {otpTimer > 0 ? (
                <span className="text-gray-500 font-medium">
                  {language === 'hi' ? `नया ओटीपी भेजें (${otpTimer}s)` : `Request fresh OTP code in ${otpTimer}s`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(code);
                    setEnteredOtp('');
                    setOtpVerificationError(null);
                    setOtpTimer(30);
                    triggerToast(language === 'hi' ? "नया ओटीपी कोड भेजा गया!" : "New simulated OTP code generated!", "success");
                  }}
                  className="text-[#D4AF37] hover:underline hover:text-amber-400 font-extrabold bg-transparent border-none cursor-pointer"
                >
                  {language === 'hi' ? 'ओटीपी पुनः प्राप्त करें (SMS)' : 'Resend Simulated SMS Code'}
                </button>
              )}
            </div>

            {/* Actions group button trigger */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOtpVerificationModal(false);
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Change Details'}
              </button>
              <button
                type="button"
                disabled={placingOrder}
                onClick={async () => {
                  if (enteredOtp !== generatedOtp) {
                    setOtpVerificationError(language === 'hi' ? 'गलत ओटीपी कोड प्रवेश! कृपया सही कोड दर्ज करें।' : 'Incorrect verification code. Please input the correct OTP received.');
                    triggerToast(language === 'hi' ? 'अमान्य ओटीपी कोड!' : 'Invalid OTP Code Entered!', "err");
                    return;
                  }
                  await executeOrderPlacement();
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {placingOrder && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                <span>{language === 'hi' ? 'सत्यापित और भुगतान करें' : 'Verify & Pay'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Floating Purchase Alerts System */}
      <LivePurchasePopup language={language} />
      <FestiveOffersBanner 
        language={language} 
        cartTotal={cartSellingBeforeDiscount} 
        isAdmin={user?.role === 'admin'}
        triggerToast={triggerToast}
      />

    </div>
  );
}
