import React from 'react';
import { Truck, Calendar, MapPin, Sparkles, CheckCircle, Package, Clock, Search, ArrowRight, Clipboard } from 'lucide-react';
import { getUiTranslation } from '../lib/translations.ts';

interface OrderTrackerProps {
  language: 'en' | 'hi';
  triggerToast: (msg: string, type: 'success' | 'err' | 'info') => void;
}

export default function OrderTracker({ language, triggerToast }: OrderTrackerProps) {
  const [orderQuery, setOrderQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [trackingResult, setTrackingResult] = React.useState<any | null>(null);

  // Auto populate a mock simulator if query is blank and they want to test
  const handleSimulateDefault = (simId: string) => {
    setOrderQuery(simId);
    handleTrack(null, simId);
  };

  const handleTrack = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const idToTrack = (customId || orderQuery).trim();
    
    if (!idToTrack) {
      triggerToast(language === 'hi' ? "कृपया एक वैध ऑर्डर आईडी या ट्रैकिंग नंबर दर्ज करें।" : "Please enter a valid Order ID or Tracking Number.", "info");
      return;
    }

    setLoading(true);
    setTrackingResult(null);

    // Give it a smooth natural network query feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // First, attempt to retrieve real order from our DB endpoints if numeric
      const numericId = parseInt(idToTrack.replace(/\D/g, ''));
      let dbOrder: any = null;

      if (!isNaN(numericId)) {
        try {
          const res = await fetch(`/api/orders/track/${numericId}`);
          if (res.ok) {
            dbOrder = await res.json();
          }
        } catch (err) {
          // ignore error to fallback to mock gracefully
        }
      }

      if (dbOrder) {
        // Success: Found a real database order! Parse timelines based on its database status
        const dbStatus = dbOrder.status || "Pending";
        let stepIndex = 1;
        if (dbStatus.toLowerCase() === 'paid') stepIndex = 2;
        if (dbStatus.toLowerCase() === 'shipped') stepIndex = 3;
        if (dbStatus.toLowerCase() === 'completed') stepIndex = 4;

        setTrackingResult({
          type: 'real',
          orderId: dbOrder.id,
          trackingNumber: dbOrder.trackingNumber || `ANT-${100000 + dbOrder.id}`,
          fullName: dbOrder.fullName,
          totalAmount: dbOrder.totalAmount,
          paymentMethod: dbOrder.paymentMethod,
          shippingAddress: `${dbOrder.address}, ${dbOrder.city}, ${dbOrder.state} - ${dbOrder.zipCode}`,
          city: dbOrder.city || "Patna, Bihar",
          estimatedDelivery: new Date(new Date(dbOrder.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          carrier: "Mithila Rural Express",
          items: dbOrder.items || [],
          step: stepIndex,
          statusLabel: dbStatus,
          timeline: [
            {
              title: language === 'hi' ? "ऑर्डर सफलतापूर्वक स्वीकृत" : "Order Confirmed & Approved",
              desc: language === 'hi' ? "किसान निधि से मखाना पैकेट चुना गया।" : "Your hand-harvested Bihar Makhana is allocated.",
              time: new Date(dbOrder.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
              done: true
            },
            {
              title: language === 'hi' ? "गुणवत्ता निरीक्षण पूर्ण" : "Quality Inspection Completed",
              desc: language === 'hi' ? "मधुबनी प्रोसेसिंग प्लांट में शुद्धता जांच।" : "Moisture checked and certified grade-A makhana packs.",
              time: stepIndex >= 2 ? language === 'hi' ? "सत्यापित और सुरक्षित" : "Verified & sealed" : language === 'hi' ? "लंबित" : "Awaiting verification",
              done: stepIndex >= 2
            },
            {
              title: language === 'hi' ? "पारगमन में - पटना टर्मिनल" : "In Transit - Patna Distribution Hub",
              desc: language === 'hi' ? "साझा कार्गो के माध्यम से आपके शहर की ओर जारी।" : "Package sent out from Bihar sorting center via cargo flight.",
              time: stepIndex >= 3 ? language === 'hi' ? "मार्ग में" : "Dispatched in transit" : language === 'hi' ? "लंबित" : "Awaiting dispatch",
              done: stepIndex >= 3
            },
            {
              title: language === 'hi' ? "वितरण के लिए तैयार" : "Out for Delivery",
              desc: language === 'hi' ? "स्थानीय वितरण कूरियर के वाहन में लोड।" : "Your healthy snack superbag is with the local deliverer.",
              time: stepIndex >= 4 ? language === 'hi' ? "पूर्ण वितरण" : "Delivered safely" : language === 'hi' ? "लंबित" : "Awaiting arrival",
              done: stepIndex >= 4
            }
          ]
        });
        triggerToast(language === 'hi' ? "सक्रिय आदेश सफलतापूर्वक मिल गया!" : "Active order located from live database!", "success");
      } else {
        // Fallback: Generate an exceptionally gorgeous simulated, mock delivery status report!
        // We hash the entered ID to generate persistent, fun, realistic values so if they search the same thing again, it is consistent!
        const normalizedId = idToTrack.trim().toLowerCase();
        const hash: number = normalizedId.split('').reduce((acc: number, char: string): number => acc + char.charCodeAt(0), 0);
        const steps: number = (hash % 4) + 1; // persistent mock step between 1 and 4

        // Generate reliable mock data based on seeded hash
        const mockAmount: number = (hash % 1200) + 499;
        const mockNames = ["Rohit Kumar", "Anjali Singh", "Siddharth Jha", "Rishi Mishra", "Priya Verma", "Vikram Sen"];
        const mockCities = ["Patna, Bihar", "Delhi NCR", "Mumbai, MH", "Bengaluru, KA", "Kolkata, WB", "Pune, MH"];
        const mockName = mockNames[hash % mockNames.length];
        const mockCity = mockCities[hash % mockCities.length];

        const statuses = ["Processing", "Dispatched", "In Transit", "Out for Delivery"];
        const mockStatus = statuses[steps - 1];

        // Anchor the order seed date deterministically to a target timeframe in June 2026
        // 1780281600000 correspond to June 5, 2026. This guarantees 100% consistent dates.
        const baseTimestamp = 1780281600000 + (hash % 5) * 24 * 60 * 60 * 1000;
        const dateOrder = new Date(baseTimestamp);
        const dateQC = new Date(baseTimestamp + 14 * 60 * 60 * 1000); // QC after 14 hours
        const dateTransit = new Date(baseTimestamp + 30 * 60 * 60 * 1000); // Transit after 30 hours
        const dateDelivery = new Date(baseTimestamp + 56 * 60 * 60 * 1000); // Delivery after 56 hours

        const formatOptions: Intl.DateTimeFormatOptions = { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        };

        const strOrder = dateOrder.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', formatOptions);
        const strQC = dateQC.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', formatOptions);
        const strTransit = dateTransit.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', formatOptions);
        const strDelivery = dateDelivery.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', formatOptions);

        // Est delivery: deterministic 3 days from seed date
        const estDeliveryDate = new Date(baseTimestamp + 3 * 24 * 60 * 60 * 1000);
        const strEstDelivery = estDeliveryDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

        setTrackingResult({
          type: 'simulated',
          orderId: idToTrack,
          trackingNumber: idToTrack.toUpperCase().startsWith('ANT') ? idToTrack.toUpperCase() : `ANT-${100000 + (hash % 900000)}`,
          fullName: mockName,
          totalAmount: mockAmount,
          paymentMethod: hash % 2 === 0 ? "Cash on Delivery" : "Prepaid (Razorpay)",
          shippingAddress: `${language === 'hi' ? 'सेक्टर-4, आवास बोर्ड' : 'Sector 4, Housing Board Area'}, ${mockCity}`,
          city: mockCity,
          estimatedDelivery: strEstDelivery,
          carrier: "Mithila Rural Farmer Express",
          step: steps,
          statusLabel: mockStatus,
          timeline: [
            {
              title: language === 'hi' ? "ऑर्डर प्राप्त और सत्यापित" : "Order Placed & Farmer Sourced",
              desc: language === 'hi' ? "बिहार मखाना भंडार गृह में पैकेट की तैयारी पूर्ण।" : "Fresh makhana batch sourced from local cooperative farms.",
              time: strOrder,
              done: true
            },
            {
              title: language === 'hi' ? "धूप शुष्क गुणवत्ता पैकिंग" : "Sun-drying & Crispness Packing",
              desc: language === 'hi' ? "जैतून तेल धीमे भुनाव के बाद उत्कृष्ट गुणवत्ता सील।" : "Slow-roasted and locked in eco-friendly pouch.",
              time: steps >= 2 ? strQC : (language === 'hi' ? "लंबित" : "Awaiting verification"),
              done: steps >= 2
            },
            {
              title: language === 'hi' ? "राष्ट्रीय कृषि पारगमन मार्ग" : "Agricultural Cargo Transport",
              desc: language === 'hi' ? "बिहार से एक्सप्रेस वितरण वाहन द्वारा प्रस्थान।" : "Left regional Mithila sorting facility via priority cargo.",
              time: steps >= 3 ? strTransit : (language === 'hi' ? "लंबित" : "Awaiting dispatch"),
              done: steps >= 3
            },
            {
              title: language === 'hi' ? "वितरण और होम डिलीवरी" : "Last-Mile Delivery Network",
              desc: language === 'hi' ? "ग्राहक के पते के स्थानीय कूरियर को सौंपा गया।" : "Dispatched for hand-to-hand delivery to your doorstep.",
              time: steps >= 4 ? strDelivery : (language === 'hi' ? "लंबित" : "Awaiting arrival"),
              done: steps >= 4
            }
          ]
        });
        triggerToast(language === 'hi' ? "सिम्युलेटेड ट्रैकिंग रिपोर्ट प्रस्तुत की गई!" : "Simulated delivery progress retrieved successfully!", "success");
      }
    } catch (err: any) {
      triggerToast(language === 'hi' ? "ऑर्डर ट्रैकिंग में त्रुटि।" : "Error pulling tracking report.", "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="order-tracking-card-container">
      {/* Intro display block */}
      <div className="text-center space-y-4 mb-10">
        <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block font-sans">
          {language === 'hi' ? "सुरक्षित डिलीवरी ट्रैकर" : "Secure Logistics Delivery Tracker"}
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
          {language === 'hi' ? "अपने ऑर्डर को ट्रैक करें" : "Track Your Active Shipments"}
        </h2>
        <p className="text-[#999] text-xs max-w-lg mx-auto leading-relaxed">
          {getUiTranslation(language, 'trackPromo')}
        </p>
      </div>

      {/* Input Search Form code block */}
      <form onSubmit={(e) => handleTrack(e)} className="bg-[#121417] border border-white/5 p-6 rounded-3xl shadow-xl max-w-2xl mx-auto space-y-4">
        <label className="text-xs font-semibold text-[#CCC] block">
          {getUiTranslation(language, 'enterOrderId')}
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={getUiTranslation(language, 'trackingIdPlaceholder')}
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full bg-[#1A1D21] border border-white/10 focus:border-[#D4AF37]/50 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-[#666] outline-none transition-all font-mono tracking-wider"
            />
            <Search className="absolute left-4 top-4 text-[#888]" size={15} />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="bg-[#D4AF37] hover:bg-[#B48F27] text-[#0C0D0E] font-bold text-xs py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer select-none shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 border-2 border-[#0C0D0E] border-t-transparent rounded-full animate-spin"></span>
                <span>{language === 'hi' ? "सर्च..." : "Searching..."}</span>
              </span>
            ) : (
              <>
                <span>{getUiTranslation(language, 'trackButton')}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Suggested Quick Tracker Links for simulation */}
        <div className="border-t border-white/5 pt-4 flex flex-wrap gap-2 items-center text-[11px]">
          <span className="text-[#666] font-semibold">{language === 'hi' ? "त्वरित सिम्युलेटर टेस्ट:" : "Try Simulator Demo IDs:"}</span>
          <button 
            type="button" 
            onClick={() => handleSimulateDefault('ANT-20265')}
            className="bg-[#1A1D21] hover:bg-[#23262B] text-[#D4AF37] hover:text-white border border-[#D4AF37]/15 rounded-lg px-2.5 py-1 text-[10px] font-mono cursor-pointer transition-all"
          >
            ANT-20265
          </button>
          <button 
            type="button" 
            onClick={() => handleSimulateDefault('ANT-91953')}
            className="bg-[#1A1D21] hover:bg-[#23262B] text-[#D4AF37] hover:text-white border border-[#D4AF37]/15 rounded-lg px-2.5 py-1 text-[10px] font-mono cursor-pointer transition-all"
          >
            ANT-91953
          </button>
          <button 
            type="button" 
            onClick={() => handleSimulateDefault('1')}
            className="bg-[#1A1D21] hover:bg-[#23262B] text-white border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-mono cursor-pointer transition-all"
          >
            Database Order #1
          </button>
        </div>
      </form>

      {/* Tracking Result Screen output */}
      {trackingResult && (
        <div key={`${trackingResult.trackingNumber.toLowerCase()}_${trackingResult.fullName.toLowerCase()}`} className="mt-10 bg-[#121417] border border-[#D4AF37]/20 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-8 animate-fade-in duration-300">
          
          {/* Top Invoice Block details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/5 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-md uppercase">
                {trackingResult.type === 'real' ? (language === 'hi' ? "लाइव डेटाबेस ऑर्डर" : "Live Database Order") : (language === 'hi' ? "सिम्युलेटेड ट्रैक" : "Simulated Track")}
              </span>
              <h3 className="text-xl font-bold font-mono text-white pt-1">
                {trackingResult.trackingNumber}
              </h3>
              <p className="text-xs text-[#888] font-sans">
                {language === 'hi' ? "प्राप्तकर्ता:" : "Recipient:"} <span className="text-[#CCC] font-semibold">{trackingResult.fullName}</span>
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <p className="text-xs text-[#888]">
                {language === 'hi' ? "अनुमानित आगमन तारीख:" : "Estimated Arrival Date:"}
              </p>
              <div className="flex sm:justify-end items-center gap-1.5 text-[#D4AF37] font-semibold text-sm">
                <Calendar size={14} />
                <span>{trackingResult.estimatedDelivery}</span>
              </div>
              <p className="text-[11px] text-[#666]">
                {language === 'hi' ? "रसद प्रदाता:" : "Logistics Provider:"} {trackingResult.carrier}
              </p>
            </div>
          </div>

          {/* Progress Bar Indicators */}
          <div className="relative pt-2">
            <div className="absolute top-6 left-5 sm:left-8 right-5 sm:right-8 h-1 bg-white/5 -z-10 rounded-full"></div>
            {/* Active percentage loader */}
            <div 
              className="absolute top-6 left-5 sm:left-8 h-1 bg-[#D4AF37] -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((trackingResult.step - 1) / 3) * 100}%` }}
            ></div>

            {/* Steps indicator bubbles */}
            <div className="flex justify-between items-center text-center">
              {[
                { label: language === 'hi' ? "सृजित" : "Created", stepNum: 1 },
                { label: language === 'hi' ? "निरीक्षित" : "Quality Check", stepNum: 2 },
                { label: language === 'hi' ? "मार्ग में" : "In Transit", stepNum: 3 },
                { label: language === 'hi' ? "वितरित" : "Out for Delivery", stepNum: 4 }
              ].map((s) => {
                const isActive = trackingResult.step >= s.stepNum;
                const isCurrent = trackingResult.step === s.stepNum;
                return (
                  <div key={s.stepNum} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                        isActive 
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0C0D0E] shadow-lg shadow-[#D4AF37]/10' 
                          : 'bg-[#121417] border-white/10 text-[#666]'
                      } ${isCurrent ? 'ring-4 ring-[#D4AF37]/20 scale-110' : ''}`}
                    >
                      {isActive ? "✓" : s.stepNum}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold mt-2 ${isActive ? 'text-white' : 'text-[#666]'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIMULATED TRANSIT MAP FOR DISPATCHED ORDERS */}
          {trackingResult.step >= 2 && (
            <div className="bg-[#1A1D21] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-in" id="transit-route-map-panel">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/5">
                <div className="space-y-0.5">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <MapPin size={14} className="text-[#D4AF37] animate-bounce" />
                    <span>{language === 'hi' ? "शिपमेंट लाइव पारगमन मानचित्र" : "Live Shipment Transit Map"}</span>
                  </h4>
                  <p className="text-[11px] text-[#888] leading-relaxed">
                    {language === 'hi' ? "पूर्णिया, बिहार (मखाना सहकारी) से आपके शहर तक का मार्ग" : "Simulated delivery route from Purnea, Bihar to your destination city"}
                  </p>
                </div>
                <span className="text-[9px] bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider self-start sm:self-auto shrink-0 flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span>{language === 'hi' ? "मार्ग लाइव" : "DISPATCHED LIVE"}</span>
                </span>
              </div>

              {/* Map visualization area with simulated paths */}
              <div className="relative w-full h-[200px] bg-[#0E1012] rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between p-4 font-sans">
                {/* Cyber grid background */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFF 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}></div>
                
                {/* Soft glow background shapes */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-[#D4AF37]/5 rounded-full filter blur-xl pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none"></div>

                {/* Simulated routes overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer glowing path */}
                  <path 
                    d="M 60 120 C 180 30, 280 180, 420 50 C 480 20, 520 80, 580 90" 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeOpacity="0.1"
                    strokeWidth="5" 
                    strokeLinecap="round"
                  />

                  {/* Main Route Line */}
                  <path 
                    d="M 60 120 C 180 30, 280 180, 420 50 C 480 20, 520 80, 580 90" 
                    fill="none" 
                    stroke="url(#routeGrad)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: '6 4',
                      animation: 'dashEffect 25s linear infinite'
                    }}
                  />
                  
                  {/* Animated delivery truck / pulsing cargo rider */}
                  <circle r="6" fill="#10B981" className="animate-ping">
                    <animateMotion 
                      path="M 60 120 C 180 30, 280 180, 420 50 C 480 20, 520 80, 580 90" 
                      dur="8s" 
                      repeatCount="indefinite" 
                    />
                  </circle>
                  <circle r="4" fill="#10B981">
                    <animateMotion 
                      path="M 60 120 C 180 30, 280 180, 420 50 C 480 20, 520 80, 580 90" 
                      dur="8s" 
                      repeatCount="indefinite" 
                    />
                  </circle>
                </svg>

                <style>{`
                  @keyframes dashEffect {
                    to {
                      stroke-dashoffset: -500;
                    }
                  }
                `}</style>

                {/* Origin Pin - Bihar Farmers cooperative */}
                <div className="relative z-10 flex items-center gap-2 bg-[#16181C]/90 backdrop-blur-xs border border-white/10 p-2 rounded-xl max-w-[170px] shadow-lg self-start transform translate-y-2 select-none">
                  <div className="w-5 h-5 bg-[#D4AF37]/15 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-[10px]">🌾</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-extrabold uppercase text-[#D4AF37] tracking-widest font-mono">Origin Hub</p>
                    <p className="text-[10px] font-bold text-white truncate">{language === 'hi' ? "पूर्णिया, बिहार" : "Purnea, Bihar"}</p>
                  </div>
                </div>

                {/* Destination Pin - User destination city */}
                <div className="relative z-10 flex items-center gap-2 bg-[#16181C]/90 backdrop-blur-xs border border-emerald-500/20 p-2 rounded-xl max-w-[170px] shadow-lg self-end transform -translate-y-2 select-none">
                  <div className="w-5 h-5 bg-emerald-500/15 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-[10px]">🏠</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-extrabold uppercase text-emerald-400 tracking-widest font-mono">Receiver City</p>
                    <p className="text-[10px] font-bold text-white truncate">{trackingResult.city || (language === 'hi' ? "आपका शहर" : "Your City")}</p>
                  </div>
                </div>

                {/* Speed Details Footer line overlay */}
                <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-[9px] font-mono text-[#777] [text-shadow:0_1px_1px_rgba(0,0,0,0.9)]">
                  <span>MITHILA TRANSIT CORRIDOR NH-31</span>
                  <span className="text-[#D4AF37] font-bold tracking-wider uppercase">
                    {language === 'hi' ? "ताज़ा मखाना एक्सप्रेस डिलीवरी गतिमान " : "Farmer Fresh Express Delivery Ongoing"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline details checklist with nice icons */}
          <div className="bg-[#1A1D21] border border-white/5 p-6 rounded-2xl space-y-6">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#D4AF37] flex items-center gap-1.5 mb-2">
              <Clock size={13} />
              <span>{language === 'hi' ? "वितरण लाइव टाइमलाइन घटनाएँ" : "Detailed Transit Events Log"}</span>
            </h4>

            <div className="space-y-6 relative border-l border-white/10 pl-6 ml-3">
              {trackingResult.timeline.map((entry: any, idx: number) => {
                return (
                  <div key={idx} className="relative">
                    {/* Bubble timeline dot */}
                    <div className={`absolute -left-10 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                      entry.done 
                        ? 'bg-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37]' 
                        : 'bg-[#121417] border border-white/10 text-[#555]'
                    }`}>
                      {entry.done ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className={`text-xs font-bold font-sans ${entry.done ? 'text-white' : 'text-[#666]'}`}>
                          {entry.title}
                        </h5>
                        <span className="text-[10px] font-mono text-[#888]">
                          {entry.time}
                        </span>
                      </div>
                      <p className={`text-xs ${entry.done ? 'text-[#999]' : 'text-[#555]'}`}>
                        {entry.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary alert info details */}
          <div className="flex items-start gap-3 bg-[#D4AF37]/5 border border-[#D4AF37]/10 p-4 rounded-xl text-xs text-[#CCC] font-sans">
            <Truck size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                {language === 'hi' ? "सुरक्षित डिलीवरी आश्वासन" : "Our Natural Farmer Fresh Delivery Promise"}
              </p>
              <p className="text-[11px] leading-relaxed">
                {language === 'hi' 
                  ? "सभी पैकेट्स सीधे बिहार से वातानुकूलित जैविक सुरक्षा बैग्स में पैक किए जाते हैं ताकि कुरकुरापन बना रहे। किसी भी पूछताछ के लिए, संकोच न करें और हमारे ग्राहक सहायता से संपर्क करें।"
                  : "All shipments are packed in oxygen-barrier packaging directly in Bihar to preserve supreme crispness. If you face any delivery issues, contact +91 82103 51543."}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
