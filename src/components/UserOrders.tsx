import React from 'react';
import { ShoppingBag, Truck, Calendar, Sparkles, CheckCircle, Package, ArrowRight, User, Printer, Award, Gift, Info, RotateCcw, TrendingUp, Copy, ChevronDown, ChevronUp, Download, Star, MessageSquare } from 'lucide-react';
import { Order, User as DBUser } from '../types.ts';
import { printOrderInvoice } from '../lib/invoice.ts';
import { getUiTranslation } from '../lib/translations.ts';
import { db as firestoreDb } from '../lib/firebase.ts';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface MonthlyData {
  month: string;
  spend: number;
  points: number;
}

const CustomTooltip = ({ active, payload, label, language }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-amber-950/95 border border-amber-500/30 p-3 rounded-xl shadow-xl text-white text-xs font-sans space-y-1">
        <p className="font-bold text-amber-300 font-mono">{label}</p>
        <div className="border-t border-amber-500/10 pt-1 space-y-0.5">
          <p className="flex justify-between gap-5">
            <span className="text-gray-300">{language === 'hi' ? 'कुल खर्च:' : 'Spending:'}</span>
            <span className="font-extrabold text-emerald-400">₹{payload[0].value}</span>
          </p>
          {payload[1] && (
            <p className="flex justify-between gap-5">
              <span className="text-gray-300">{language === 'hi' ? 'अर्जित पॉइंट्स:' : 'Points Earned:'}</span>
              <span className="font-extrabold text-[#D4AF37]">+{payload[1].value} Pts</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const ActivityTooltip = ({ active, payload, label, language }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-amber-950/95 border border-amber-500/30 p-2.5 rounded-xl shadow-xl text-white text-xs font-sans space-y-0.5 text-left">
        <p className="font-bold text-amber-300 font-mono">{label}</p>
        <p className="flex justify-between gap-4">
          <span className="text-gray-300">{language === 'hi' ? 'ऑर्डर की संख्या:' : 'Orders Placed:'}</span>
          <span className="font-extrabold text-[#D4AF37]">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const getLast6MonthsData = (orders: Order[], lang: 'en' | 'hi'): MonthlyData[] => {
  const monthsData: MonthlyData[] = [];
  const now = new Date();
  
  const hiMonths = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const monthName = lang === 'hi' ? hiMonths[monthIndex] : enMonths[monthIndex];
    const shortYear = year.toString().slice(-2);
    
    monthsData.push({
      month: `${monthName} '${shortYear}`,
      spend: 0,
      points: 0
    });
  }
  
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  
  validOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    monthsData.forEach((slot, index) => {
      const slotIndexOffset = 5 - index;
      const slotDate = new Date(now.getFullYear(), now.getMonth() - slotIndexOffset, 1);
      
      if (orderDate.getMonth() === slotDate.getMonth() && orderDate.getFullYear() === slotDate.getFullYear()) {
        monthsData[index].spend += order.totalAmount;
        monthsData[index].points += Math.floor(order.totalAmount * 0.10);
      }
    });
  });
  
  return monthsData;
};

interface MonthlyVolumeData {
  month: string;
  count: number;
}

const getLast24MonthsData = (orders: Order[], lang: 'en' | 'hi'): MonthlyVolumeData[] => {
  const monthsData: MonthlyVolumeData[] = [];
  const now = new Date();
  
  const hiMonths = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const monthName = lang === 'hi' ? hiMonths[monthIndex] : enMonths[monthIndex];
    const shortYear = year.toString().slice(-2);
    
    monthsData.push({
      month: `${monthName} '${shortYear}`,
      count: 0
    });
  }
  
  const validOrders = orders.filter(o => o.status !== "Cancelled");
  
  validOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    monthsData.forEach((slot, index) => {
      const slotIndexOffset = 23 - index;
      const slotDate = new Date(now.getFullYear(), now.getMonth() - slotIndexOffset, 1);
      
      if (orderDate.getMonth() === slotDate.getMonth() && orderDate.getFullYear() === slotDate.getFullYear()) {
        monthsData[index].count += 1;
      }
    });
  });
  
  return monthsData;
};

const getEstimatedDeliveryDate = (createdAtStr: string, lang: 'en' | 'hi') => {
  const orderDate = new Date(createdAtStr);
  const estDate = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return estDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', options);
};

interface UserOrdersProps {
  user: DBUser | null;
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
  language: 'en' | 'hi';
  spentPoints?: number;
  redeemedCoupons?: {code: string; discount: number; date: string}[];
  onRedeemPoints?: (pts: number, discount: number, applyToCart?: boolean) => boolean;
  totalPointsAvailable?: number;
  totalPointsAccumulated?: number;
  onCancelOrder?: (orderId: number) => Promise<boolean>;
  onReorder?: (order: Order) => void;
}

export default function UserOrders({
  user,
  orders,
  loading,
  onRefresh,
  setActiveTab,
  language,
  spentPoints = 0,
  redeemedCoupons = [],
  onRedeemPoints,
  totalPointsAvailable = 0,
  totalPointsAccumulated = 0,
  onCancelOrder,
  onReorder
}: UserOrdersProps) {
  
  const [isRedeemModalOpen, setIsRedeemModalOpen] = React.useState(false);

  // Delivery Feedback States
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false);
  const [selectedFeedbackOrderId, setSelectedFeedbackOrderId] = React.useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = React.useState<number>(5);
  const [feedbackText, setFeedbackText] = React.useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState(false);

  const handleSubmitFeedback = async () => {
    if (!selectedFeedbackOrderId) return;
    setIsSubmittingFeedback(true);
    try {
      const orderRef = doc(firestoreDb, 'orders', String(selectedFeedbackOrderId));
      await updateDoc(orderRef, {
        feedback: {
          rating: feedbackRating,
          comment: feedbackText,
          createdAt: new Date().toISOString()
        }
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setIsFeedbackModalOpen(false);
        setFeedbackSuccess(false);
        setFeedbackText('');
        setFeedbackRating(5);
        setSelectedFeedbackOrderId(null);
        onRefresh();
      }, 1800);
    } catch (e) {
      console.error("Error saving feedback:", e);
      alert(language === 'hi' ? 'प्रतिक्रिया सहेजने में त्रुटि हुई।' : 'Error saving feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Automatically trigger courier experience modal for delivered/completed orders without existing feedback
  React.useEffect(() => {
    if (orders && orders.length > 0 && !isFeedbackModalOpen) {
      const pendingFeedbackOrder = orders.find(order => {
        const isDelivered = order.status === 'Completed' || order.status === 'Delivered';
        const hasFeedback = !!(order as any).feedback;
        const wasPrompted = localStorage.getItem(`prompted_delivery_experience_feedback_${order.id}`) === 'true';
        return isDelivered && !hasFeedback && !wasPrompted;
      });

      if (pendingFeedbackOrder) {
        // Record prompting so we don't open on every mount if they cancel/close
        localStorage.setItem(`prompted_delivery_experience_feedback_${pendingFeedbackOrder.id}`, 'true');
        setSelectedFeedbackOrderId(pendingFeedbackOrder.id);
        setFeedbackRating(5);
        setFeedbackText('');
        setIsFeedbackModalOpen(true);
      }
    }
  }, [orders, isFeedbackModalOpen]);

  const [now, setNow] = React.useState(new Date());
  const [confirmCancelId, setConfirmCancelId] = React.useState<number | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Processing' | 'Delivered' | 'Cancelled'>('All');
  const [orderSearchQuery, setOrderSearchQuery] = React.useState('');
  const [copiedOrderId, setCopiedOrderId] = React.useState<number | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = React.useState<Record<number, boolean>>({});

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleExportToCSV = () => {
    const headers = [
      "Order ID",
      "Date",
      "Status",
      "Total Amount (INR)",
      "Items Count",
      "Items Detail",
      "Customer Name",
      "Phone",
      "Shipping Address",
      "City",
      "State",
      "Zip Code",
      "Payment Method",
      "Payment ID",
      "Tracking Number"
    ];

    const csvRows = [headers.join(',')];

    orders.forEach(order => {
      const itemsDetailArr = order.items?.map(item => `${item.productName} (Qty: ${item.quantity}, Price: ₹${item.price})`) || [];
      const itemsDetailStr = itemsDetailArr.join('; ');
      const itemsCount = order.items?.reduce((all, it) => all + it.quantity, 0) || 0;

      const escapeCSV = (str: string | null | undefined) => {
        if (str === null || str === undefined) return '';
        const val = String(str);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      const row = [
        order.id,
        new Date(order.createdAt).toLocaleDateString(),
        order.status,
        order.totalAmount,
        itemsCount,
        escapeCSV(itemsDetailStr),
        escapeCSV(order.fullName),
        escapeCSV(order.phone),
        escapeCSV(order.address),
        escapeCSV(order.city),
        escapeCSV(order.state),
        escapeCSV(order.zipCode),
        escapeCSV(order.paymentMethod),
        escapeCSV(order.paymentId),
        escapeCSV(order.trackingNumber)
      ];

      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Makhana_Order_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyOrderDetails = (order: Order) => {
    const itemsText = order.items?.map(item => `• ${item.productName} (Qty: ${item.quantity} - ₹${item.price})`).join('\n') || '';
    const details = `Order ID: ${order.id}\nStatus: ${order.status}\nDate: ${new Date(order.createdAt).toLocaleDateString()}\nTotal Amount: ₹${order.totalAmount}\nItems:\n${itemsText}`;
    
    navigator.clipboard.writeText(details);
    setCopiedOrderId(order.id);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  };

  const filteredOrders = orders.filter(order => {
    // 1. Status Filter
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Processing') {
        matchesStatus = order.status === 'Paid' || order.status === 'Pending' || order.status === 'Shipped';
      } else if (statusFilter === 'Delivered') {
        matchesStatus = order.status === 'Completed';
      } else if (statusFilter === 'Cancelled') {
        matchesStatus = order.status === 'Cancelled';
      }
    }

    if (!matchesStatus) return false;

    // 2. Search Query Filter (Product Names or Order ID Keyword)
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesOrderId = String(order.id).toLowerCase().includes(q);
      const matchesProductNames = order.items?.some(item => 
        item.productName.toLowerCase().includes(q)
      ) || false;
      return matchesOrderId || matchesProductNames;
    }

    return true;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Paid': return 2;
      case 'Shipped': return 3;
      case 'Completed': return 4;
      default: return 1;
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalPoints = totalPointsAccumulated || Math.floor(totalSpent * 0.10);
  const activeAvailablePoints = totalPointsAvailable || Math.max(0, totalPoints - spentPoints);
  
  const chartData = getLast6MonthsData(orders, language);
  const last24MonthsData = React.useMemo(() => getLast24MonthsData(orders, language), [orders, language]);

  const loyaltyPointsOverTime = React.useMemo(() => {
    // Sort all non-cancelled orders by date ascending
    const sortedOrders = [...orders]
      .filter(o => o.status !== 'Cancelled')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let runningTotal = 0;
    const history = sortedOrders.map((order) => {
      const orderDate = new Date(order.createdAt);
      const pointsEarned = Math.floor(order.totalAmount * 0.10);
      runningTotal += pointsEarned;
      return {
        date: orderDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        pointsEarned: pointsEarned,
        cumulativePoints: runningTotal,
        orderLabel: `Order #${order.id}`,
        amount: order.totalAmount
      };
    });

    if (history.length === 0) {
      return [
        { date: language === 'hi' ? 'प्रारंभ' : 'Start', pointsEarned: 0, cumulativePoints: 0, orderLabel: 'None', amount: 0 }
      ];
    }
    return history;
  }, [orders, language]);

  const mostRecentOrderDate = orders.length > 0
    ? new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime())))
    : new Date();
  const expirationDate = new Date(mostRecentOrderDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Standard Bronze, Silver, Gold labels
  const getTierLabel = (tierKey: 'bronze' | 'silver' | 'gold') => {
    if (tierKey === 'bronze') {
      return language === 'hi' ? 'कांस्य स्वादक (Bronze Savorer)' : 'Bronze Savorer';
    } else if (tierKey === 'silver') {
      return language === 'hi' ? 'सिल्वर गुरु (Silver Savorer)' : 'Silver Savorer';
    } else {
      return language === 'hi' ? 'गोल्डन महाराजा (Gold Maharaja) 👑' : 'Gold Maharaja 👑';
    }
  };

  // Rewards level config
  let currentTier = getTierLabel('bronze');
  let nextTierName = getTierLabel('silver');
  let targetPoints = 150;
  let progressPct = Math.min((totalPoints / 150) * 100, 100);
  let pointsNeeded = Math.max(0, 150 - totalPoints);

  if (totalPoints >= 150 && totalPoints < 500) {
    currentTier = getTierLabel('silver');
    nextTierName = getTierLabel('gold');
    targetPoints = 500;
    progressPct = Math.min(((totalPoints - 150) / (500 - 150)) * 100, 100);
    pointsNeeded = Math.max(0, 500 - totalPoints);
  } else if (totalPoints >= 500) {
    currentTier = getTierLabel('gold');
    nextTierName = '';
    targetPoints = 1000;
    progressPct = 100;
    pointsNeeded = 0;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="user-orders-portal">
      {/* Account Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 text-2xl flex items-center justify-center font-bold font-serif ring-4 ring-amber-50">
            {user?.fullName ? user.fullName[0].toUpperCase() : <User size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-amber-950 capitalize">{user?.fullName || 'Verified Buyer'}</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{user?.email}</p>
            <div className="flex gap-2.5 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
              <span className="bg-amber-50 px-2 py-0.5 rounded">Buyer Profile</span>
              {user?.role === 'admin' && (
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded">Store Administrator</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Joined Platform</span>
          <p className="text-sm font-sans font-semibold text-amber-950 mt-0.5">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
          </p>
        </div>
      </div>

      {/* 24-MONTH ORDER VOLUME ACTIVITY BAR CHART */}
      <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm mb-8 text-left animate-fade-in" id="purchasing-activity-profile-chart">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div className="space-y-1 text-left">
            <h4 className="font-serif font-black text-amber-950 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={16} className="text-amber-800" />
              <span>{language === 'hi' ? '२४-महीने का ख़रीदारी गतिविधि ट्रैक' : '24-Month Purchase Activity Tracking'}</span>
            </h4>
            <p className="text-[11px] text-gray-500 leading-normal">
              {language === 'hi'
                ? 'पिछले २४ महीनों में आपके द्वारा प्रत्येक महीने किए गए कुल ऑर्डर स्तर का विश्लेषण'
                : 'Month-by-month historical breakdown of your total orders placed over the last 24 months'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
            <span className="w-2 h-2 bg-amber-600 rounded-sm inline-block"></span>
            <span>{language === 'hi' ? 'मासिक ऑर्डर' : 'Monthly Orders'}</span>
          </div>
        </div>

        <div className="w-full h-[180px] font-mono text-[9px] text-gray-400">
          {last24MonthsData.reduce((acc, curr) => acc + curr.count, 0) === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1.5 border border-dashed border-amber-100 rounded-xl bg-amber-50/5">
              <ShoppingBag size={20} className="text-amber-200 animate-pulse" />
              <p className="font-sans font-semibold text-[10px]">
                {language === 'hi' ? 'पिछले २४ महीनों में कोई ऑर्डर दर्ज नहीं किया गया है।' : 'No makhana orders recorded in the last 24 months.'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={last24MonthsData}
                margin={{ top: 5, right: 5, bottom: 0, left: -25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F9F6F0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  tickLine={false} 
                  axisLine={false}
                  dy={8}
                  interval={2} // Clean intervals to prevent labels from overlapping on small screens
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-5}
                />
                <Tooltip content={<ActivityTooltip language={language} />} />
                <Bar 
                  dataKey="count" 
                  fill="#CA8A04" 
                  radius={[3, 3, 0, 0]} 
                  maxBarSize={16} 
                  fillOpacity={0.85}
                  animationDuration={1200}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-amber-100/55 flex flex-col sm:flex-row justify-between gap-3 text-[10px] text-gray-550 font-semibold text-left">
          <div className="flex items-center gap-1">
            <span>{language === 'hi' ? '२-साल की कुल सक्रिय ऑर्डर वॉल्यूम:' : 'Total 24-Month Combined Order Volume:'}</span>
            <strong className="text-amber-950 font-bold font-mono">
              {last24MonthsData.reduce((acc, curr) => acc + curr.count, 0)} {language === 'hi' ? 'ऑर्डर' : 'Orders'}
            </strong>
          </div>
          <p className="text-gray-400 italic font-normal">
            {language === 'hi' ? '✓ ऑर्डर कैंसिलेशन को शामिल नहीं किया गया है' : '✓ Excludes cancelled orders'}
          </p>
        </div>
      </div>

      {/* DEDICATED LOYALTY STATUS LEVEL WIDGET */}
      <div 
        className="bg-[#FCF9F2] border border-amber-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 text-left animate-fade-in" 
        id="loyalty-tier-dedicated-widget"
      >
        {/* Tier Icon Badge is Bronze, Silver, Gold with distinctive luxury themes */}
        <div className="flex items-center gap-4 shrink-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border ${
            totalPoints >= 500 
              ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-yellow-500 text-amber-950' 
              : totalPoints >= 150 
                ? 'bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-400 border-neutral-300 text-neutral-800' 
                : 'bg-gradient-to-br from-orange-200 via-orange-300 to-amber-700 border-orange-400 text-amber-955'
          }`}>
            <Award size={28} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
              {language === 'hi' ? 'आपका लॉयल्टी स्तर' : 'Your Loyalty Program Level'}
            </span>
            <h3 className="text-md sm:text-lg font-black font-serif text-amber-950">
              {currentTier}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {language === 'hi' ? `संचित कुल पॉइंट्स: ${totalPoints}` : `Cumulative Accumulated: ${totalPoints} Points`}
            </p>
          </div>
        </div>

        {/* Dynamic Tier Progress Bar */}
        <div className="flex-1 md:max-w-md space-y-2">
          <div className="flex justify-between items-end text-xs">
            <span className="text-[11px] font-semibold text-gray-600 font-sans">
              {nextTierName 
                ? (language === 'hi' ? `अगला स्तर: ${nextTierName}` : `Next Milestone: ${nextTierName}`)
                : (language === 'hi' ? 'अधिकतम स्तर प्राप्त! 🎉' : 'Highest Tier Achieved! 🎉')}
            </span>
            {nextTierName && (
              <span className="text-amber-800 font-bold font-mono text-xs">
                {language === 'hi' ? `${pointsNeeded} पॉइंट्स की आवश्यकता` : `${pointsNeeded} Pts Needed`}
              </span>
            )}
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-amber-100/50 h-3 rounded-full overflow-hidden border border-amber-250/50">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                totalPoints >= 500 
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500' 
                  : totalPoints >= 150 
                    ? 'bg-gradient-to-r from-neutral-400 to-neutral-600' 
                    : 'bg-gradient-to-r from-[#C27D38] to-[#8F4715]'
              }`} 
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[10px] text-gray-500 italic">
            {nextTierName 
              ? (language === 'hi' 
                ? `अगले शानदार स्तर पर अपग्रेड करने के लिए ${pointsNeeded} पॉइंट्स और अर्जित करें!` 
                : `Earn ${pointsNeeded} more points of healthy snacking purchases to unlock next-level status privileges!`)
              : (language === 'hi' 
                ? 'बधाई हो! आप हमारे कुलीन गोल्ड महाराजा श्रेणी में मखाना स्वर्ण विजेता हैं!' 
                : 'Congratulations! You hold the absolute highest Elite tier status on our platform!')}
          </p>
        </div>
      </div>

      {/* LOYALTY CHALLENGES & ACHIEVABLE MILESTONES SECTION */}
      {(() => {
        const activeOrdersCount = orders.filter(o => o.status !== 'Cancelled').length;
        const challengesList = [
          {
            id: 'bronze-rookie',
            titleEn: 'Pond-to-Plate Rookie',
            titleHi: 'पॉन्ड-टू-प्लेट रुकी 🌿',
            descEn: 'Place your very first verified order to start earning points.',
            descHi: 'पॉइंट्स अर्जित करने के लिए अपना पहला सत्यापित ऑर्डर पूरा करें।',
            target: 1,
            current: activeOrdersCount,
            progress: Math.min((activeOrdersCount / 1) * 100, 100),
            rewardEn: 'Bronze Savorer Badge',
            rewardHi: 'कांस्य स्वादक बैज',
            badgeClass: 'bg-gradient-to-br from-[#CA7345] via-[#A75429] to-[#753413] border-amber-600'
          },
          {
            id: 'silver-connoisseur',
            titleEn: 'Makhana Connoisseur',
            titleHi: 'मखाना पारखी 🥈',
            descEn: 'Order 3 times to unlock Silver tier status and special bonus multiplier.',
            descHi: 'सिल्वर टियर और विशेष बोनस हासिल करने के लिए 3 बार आर्डर करें।',
            target: 3,
            current: activeOrdersCount,
            progress: Math.min((activeOrdersCount / 3) * 100, 100),
            rewardEn: 'Silver Status + 150 Pts',
            rewardHi: 'सिल्वर स्टेटस + 150 पॉइंट्स',
            badgeClass: 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-slate-300'
          },
          {
            id: 'gold-monarch',
            titleEn: 'Mithila Monarch',
            titleHi: 'मिथिला सम्राट 👑',
            descEn: 'Complete 5 verified orders to enter our elite Gold Maharaja status tier.',
            descHi: 'हमारे विशिष्ट गोल्ड महाराजा स्टेटस स्तर में प्रवेश करने के लिए 5 ऑर्डर पूरे करें।',
            target: 5,
            current: activeOrdersCount,
            progress: Math.min((activeOrdersCount / 5) * 100, 100),
            rewardEn: 'Elite Crown Badge + 300 Pts',
            rewardHi: 'एलीट क्राउन बैज + 300 पॉइंट्स',
            badgeClass: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-yellow-500'
          }
        ];

        return (
          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm mb-8 space-y-6" id="loyalty-challenges-panel">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-50 pb-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-black uppercase tracking-wider font-sans">
                    {language === 'hi' ? 'चुनौती' : 'Challenges'}
                  </span>
                  <h3 className="text-lg font-serif font-black text-amber-950">
                    {language === 'hi' ? 'लॉयल्टी माइलस्टोन्स चुनौतियां' : 'Snacking Loyalty Challenges'}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {language === 'hi' 
                    ? 'अपने मखाना ऑर्डर लक्ष्यों को पूरा करें और विशेष पुरस्कार स्तर एवं अतिरिक्त लॉयल्टी पॉइंट्स अनलॉक करें!' 
                    : 'Complete targeted order milestones to level up your status, gain prestige multipliers, and unlock big reward point bonuses!'}
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full shrink-0 border border-amber-200/50">
                📊 {language === 'hi' ? `सक्रिय आर्डर्स: ${activeOrdersCount}` : `Active Orders: ${activeOrdersCount}`}
              </span>
            </div>

            {/* Challenge Bento Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {challengesList.map((challenge) => {
                const isCompleted = challenge.current >= challenge.target;
                return (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between bg-gradient-to-b transition-all duration-300 border-amber-100/60 ${
                      isCompleted ? 'from-amber-50/25 to-white/50 border-amber-200' : 'from-transparent to-transparent'
                    }`}
                    id={`challenge-card-${challenge.id}`}
                  >
                    {/* Visual badge icon container */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 select-none text-left">
                        <span className={`inline-block text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded border italic ${
                          isCompleted 
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-150' 
                            : 'text-[#B48F27] bg-[#FAF8F5] border-amber-100'
                        }`}>
                          {isCompleted ? (language === 'hi' ? '✓ पूर्ण' : '✓ Completed') : (language === 'hi' ? 'प्रगति पर' : 'In Progress')}
                        </span>
                        <h4 className="font-serif font-black text-sm text-amber-950 leading-snug">
                          {language === 'hi' ? challenge.titleHi : challenge.titleEn}
                        </h4>
                      </div>

                      {/* DESIGN BADGE ELEMENT representing the tier milestone */}
                      <div className="relative shrink-0 select-none">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 ${challenge.badgeClass} relative z-10 overflow-hidden`}>
                          {/* Inner flare glow effect */}
                          <div className="absolute inset-x-0 top-0 h-[50%] bg-white/20 rounded-full blur-[1px]"></div>
                          {/* Dynamic badge emblem representation */}
                          {challenge.id === 'bronze-rookie' && (
                            <Sparkles size={18} className={`text-orange-100 ${isCompleted ? 'animate-bounce' : 'opacity-80'}`} />
                          )}
                          {challenge.id === 'silver-connoisseur' && (
                            <Package size={18} className={`text-slate-100 ${isCompleted ? 'animate-bounce' : 'opacity-80'}`} />
                          )}
                          {challenge.id === 'gold-monarch' && (
                            <Award size={20} className={`text-yellow-105 ${isCompleted ? 'animate-pulse' : 'opacity-80'}`} />
                          )}
                        </div>
                        {/* Status Check Marker indicator if completed */}
                        {isCompleted && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-[7.5px] text-white font-black">✓</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subtitle / Description */}
                    <p className="text-left text-[11px] text-gray-500 mt-2.5 leading-relaxed min-h-[44px]">
                      {language === 'hi' ? challenge.descHi : challenge.descEn}
                    </p>

                    {/* Progress bar container */}
                    <div className="mt-4 space-y-1.5 text-left">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-mono font-medium">
                          {language === 'hi' ? 'प्रगति:' : 'Progress:'} {challenge.current}/{challenge.target}
                        </span>
                        <span className="font-mono font-black text-amber-900">
                          {Math.round(challenge.progress)}%
                        </span>
                      </div>

                      <div className="w-full h-2 bg-neutral-150/40 rounded-full overflow-hidden border border-neutral-200/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            isCompleted
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                              : 'bg-gradient-to-r from-amber-500 to-amber-700'
                          }`}
                        />
                      </div>

                      {/* Ultimate tier prize note */}
                      <div className="pt-2 border-t border-dashed border-amber-100/50 flex items-center justify-between text-[10px] text-gray-600 font-sans mt-2 font-medium">
                        <span>🎁 {language === 'hi' ? 'इनाम:' : 'Reward:'}</span>
                        <span className="text-amber-800 font-bold font-mono">
                          {language === 'hi' ? challenge.rewardHi : challenge.rewardEn}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Loyalty Reward Panel */}
      <div className="bg-gradient-to-br from-amber-950 via-[#1A1105] to-[#120B02] rounded-2xl p-6 border border-amber-500/20 shadow-xl mb-8 text-amber-50" id="makhana-loyalty-panel">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/10 rounded-lg text-[#D4AF37] border border-amber-500/20">
                <Award size={20} className="animate-pulse" />
              </span>
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] tracking-tight">
                {getUiTranslation(language, 'makhanaClub')}
              </h3>
            </div>
            <p className="text-xs text-amber-200/70 max-w-md leading-relaxed">
              {getUiTranslation(language, 'earnedPtsDesc')}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 text-[10px] uppercase font-bold text-[#D4AF37]">
                <span>{language === 'hi' ? 'कुल ख़रीदारी:' : 'Lifetime Spent:'} ₹{totalSpent}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 text-[10px] uppercase font-bold text-amber-200/90 relative group select-none">
                <span>{language === 'hi' ? 'समाप्ति:' : 'Expires:'} {expirationDate.toLocaleDateString()}</span>
                <span className="cursor-help text-[#D4AF37]">
                  <Info size={11} className="inline-block" />
                </span>
                {/* Tooltip explanation */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#140E06] text-amber-100 text-[10px] p-3 rounded-xl border border-amber-500/30 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 leading-normal normal-case font-normal">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 rotate-45 w-2 h-2 bg-[#140E06] border-r border-b border-amber-500/30"></div>
                  <p className="font-semibold text-[#D4AF37] mb-1 flex items-center gap-1">
                    <Info size={10} className="text-[#D4AF37]" />
                    <span>{language === 'hi' ? 'लॉयल्टी पॉइंट समाप्ति नीति' : 'Loyalty Points Expiration Policy'}</span>
                  </p>
                  <p className="text-amber-200/85">{language === 'hi' ? 'मखाना गोल्ड पॉइंट सबसे हालिया खरीदारी की तारीख से 365 दिनों (1 वर्ष) तक मान्य रहते हैं। कूपन में परिवर्तित होने के बाद वे स्थायी बचत बन जाते हैं!' : 'Makhana Gold Points remain active for 365 days (1 year) from your most recent purchase date. Once you convert them to coupons, they never expire!'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl text-center min-w-[170px] w-full md:w-auto relative overflow-hidden group">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-amber-500/5 group-hover:scale-110 transition-transform duration-500">
              <Gift size={90} />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-extrabold block">
              {getUiTranslation(language, 'loyaltyBalance')}
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <Sparkles className="text-amber-400 fill-amber-400" size={16} />
              <span className="text-3xl font-black font-mono text-white tracking-tight">{activeAvailablePoints}</span>
            </div>
            <span className="text-[9px] text-amber-300/70 block mt-0.5">
              ({language === 'hi' ? 'कुल अर्जित:' : 'Total Earned:'} {totalPoints} Pts)
            </span>
            <span className="text-[10px] font-semibold text-amber-400/95 block mt-2 uppercase tracking-widest bg-amber-950/45 px-2 py-0.5 rounded border border-amber-500/20 mb-2">
              🎯 {currentTier}
            </span>
            <button
              onClick={() => setIsRedeemModalOpen(true)}
              className="w-full mt-2 py-1.5 px-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 active:scale-95 text-[#0C0D0E] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              <Gift size={11} className="animate-bounce" />
              <span>{language === 'hi' ? 'कूपन रिडीम करें' : 'Redeem Rewards'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tier Progress Bar */}
        {nextTierName && (
          <div className="mt-6 pt-4 border-t border-amber-500/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-200/60 font-medium">
                {language === 'hi' ? 'अगला स्तर प्रगति' : 'Progress to next milestone'}
              </span>
              <span className="text-[#D4AF37] font-bold font-mono">
                {totalPoints} / {targetPoints} {getUiTranslation(language, 'points')}
              </span>
            </div>
            <div className="w-full bg-[#1A1208] h-2 rounded-full overflow-hidden border border-amber-500/10">
              <div 
                className="bg-gradient-to-r from-amber-500 to-[#D4AF37] h-full rounded-full transition-all duration-700" 
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-200/50 italic">
              {language === 'hi' ? 'कमाना जारी रखें' : 'Earn'} <strong className="text-white font-mono">{targetPoints - totalPoints}</strong> {language === 'hi' ? 'पॉइंट्स कमाएं और' : 'more points to become a'} <strong className="text-[#D4AF37]">{nextTierName}</strong>!
            </p>
          </div>
        )}
      </div>

      {/* 6-Month Spending & Points Cumulative Trend Analysis */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm mb-8 text-left" id="loyalty-analytics-chart">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-amber-950 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={16} className="text-amber-650" />
                <span>{language === 'hi' ? '६-महीने का ख़र्च एवं बचत विश्लेषण' : '6-Month Spend & Savings Analytics'}</span>
              </h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                {language === 'hi'
                  ? 'पिछले ६ महीनों में आपके ऑर्डर मूल्यों और अर्जित मखाना गोल्ड पॉइंट्स का विश्लेषण'
                  : 'Track your raw order transaction history and cumulative loyalty value accumulation'}
              </p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block"></span>
                <span>{language === 'hi' ? 'ख़र्च (₹)' : 'Spending (₹)'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full inline-block"></span>
                <span>{language === 'hi' ? 'अर्जित पॉइंट्स' : 'Points Earned'}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[240px] font-mono text-[9px] text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  tickLine={false} 
                  axisLine={false}
                  dy={8}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#10B981"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#F59E0B"
                  tickLine={false}
                  axisLine={false}
                  dx={10}
                />
                <Tooltip content={<CustomTooltip language={language} />} />
                <Bar 
                  yAxisId="left" 
                  dataKey="spend" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={45} 
                  fillOpacity={0.85}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#F59E0B" 
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#F59E0B', strokeWidth: 2, fill: '#FFF' }}
                  activeDot={{ r: 6 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 pt-4 border-t border-amber-100 flex flex-col sm:flex-row justify-between gap-3 text-[11px] text-gray-500">
            <div className="flex items-center gap-1">
              <span>{language === 'hi' ? 'कुल ६-महीनों का कुल योग:' : 'Total 6-Month Period Value:'}</span>
              <strong className="text-amber-950 font-bold">
                ₹{chartData.reduce((acc, curr) => acc + curr.spend, 0)}
              </strong>
            </div>
            <div className="flex items-center gap-1">
              <span>{language === 'hi' ? 'कुल अर्जित मखाना गोल्ड पॉइंट्स:' : 'Total Makhana Gold Points Accumulated:'}</span>
              <strong className="text-amber-950 font-bold">
                {chartData.reduce((acc, curr) => acc + curr.points, 0)} Pts
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cumulative Loyalty Points Over Time Line Chart */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm mb-8 text-left animate-fade-in" id="loyalty-point-accumulation-chart">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-amber-950 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} className="text-[#D4AF37]" />
                <span>{language === 'hi' ? 'लॉयल्टी पॉइंट संचय इतिहास' : 'Loyalty Points Growth History'}</span>
              </h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                {language === 'hi'
                  ? 'अपनी प्रत्येक खरीदारी के साथ अपने मखाना गोल्ड पॉइंट्स की कुल संचयी वृद्धि को ट्रैक करें'
                  : 'Track your chronological cumulative gold points growth across all of your orders'}
              </p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-0.5 bg-[#D4AF37] border-t-2 border-[#D4AF37] inline-block"></span>
                <span>{language === 'hi' ? 'संचयी पॉइंट्स' : 'Cumulative Balance'}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[240px] font-mono text-[9px] text-[#A16207]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={loyaltyPointsOverTime}
                margin={{ top: 15, right: 15, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#FDF8F2" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  tickLine={false} 
                  axisLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="#B48F27"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} Pts`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-amber-950/95 border border-amber-500/30 p-3 rounded-xl shadow-xl text-white text-xs font-sans space-y-1">
                          <p className="font-bold text-amber-300 font-mono">{data.orderLabel}</p>
                          <p className="text-[10px] text-amber-200/60 font-mono mb-1">{data.date}</p>
                          <div className="border-t border-amber-500/10 pt-1.5 space-y-1">
                            <p className="flex justify-between gap-5">
                              <span className="text-gray-300">{language === 'hi' ? 'ऑर्डर मूल्य:' : 'Order Total:'}</span>
                              <span className="font-extrabold text-white">₹{data.amount}</span>
                            </p>
                            <p className="flex justify-between gap-5">
                              <span className="text-gray-300">{language === 'hi' ? 'अर्जित पॉइंट्स:' : 'Points Savor:'}</span>
                              <span className="font-bold text-emerald-400">+{data.pointsEarned} Pts</span>
                            </p>
                            <p className="flex justify-between gap-4 border-t border-amber-500/15 pt-1 text-amber-300 font-bold">
                              <span>{language === 'hi' ? 'संचयी बैलेंस:' : 'Gold Balance:'}</span>
                              <span className="font-extrabold text-amber-200 font-mono">{data.cumulativePoints} Pts</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativePoints" 
                  stroke="#D4AF37"
                  strokeWidth={3}
                  dot={{ r: 5, stroke: '#D4AF37', strokeWidth: 2, fill: '#FFF' }}
                  activeDot={{ r: 8, stroke: '#B48F27', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 pt-4 border-t border-amber-100 flex justify-between items-center text-[10px] text-gray-500">
            <span>{language === 'hi' ? '🎯 सदस्यता मील के पत्थर की ओर प्रगति जारी रखें!' : '🎯 Keep tracking your milestones towards the next elite tier!'}</span>
            <span className="font-bold text-amber-800">{language === 'hi' ? 'अर्जित कुल पॉइंट्स:' : 'Lifetime Points Owned:'} {totalPoints} Pts</span>
          </div>
        </div>
      )}

      {/* Active loyalty converted coupons block */}
      {redeemedCoupons.length > 0 && (
        <div className="bg-[#FCF9F2] border border-amber-200/65 rounded-2xl p-5 mb-8 shadow-xs text-left" id="loyalty-active-coupons-section">
          <h4 className="font-serif font-bold text-amber-950 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600 fill-amber-200 animate-pulse" />
            <span>{language === 'hi' ? 'आपके सक्रिय लॉयल्टी डिस्काउंट कूपन' : 'Your Active Loyalty Coupons'}</span>
          </h4>
          <p className="text-[11px] text-gray-500 mb-4">{language === 'hi' ? 'चेकआउट के समय "लागू करें" कूपन इनपुट में इनमें से किसी भी कोड को दर्ज करें:' : 'Copy and paste any of these codes down into the cart coupon entry form during checkout to save big:'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {redeemedCoupons.map((coupon, idx) => (
              <div key={idx} className="bg-white border border-amber-150 rounded-xl p-3.5 flex justify-between items-center shadow-xs hover:border-amber-400 transition-colors">
                <div className="space-y-1">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-gray-400">{language === 'hi' ? 'कूपन कोड' : 'Coupon Code'}</span>
                  <span className="font-mono font-bold text-amber-900 text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50 select-all">{coupon.code}</span>
                  <span className="block text-[9px] text-gray-400 italic">{language === 'hi' ? 'बनाया गया:' : 'Generated on'} {coupon.date}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="block font-sans font-black text-[#5e8125] text-sm">₹{coupon.discount} OFF</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      alert(language === 'hi' ? `कूपन कोड ${coupon.code} कॉपी किया गया!` : `Coupon code ${coupon.code} copied to clipboard!`);
                    }}
                    className="mt-1 text-[10px] font-bold text-amber-700 hover:text-amber-950 underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    {language === 'hi' ? 'कॉपी करें' : 'Copy Code'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REDEEM REWARDS MODAL WINDOW */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs" id="loyalty-redeem-modal" onClick={() => setIsRedeemModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm sm:max-w-md w-full border border-amber-200 shadow-2xl relative space-y-4 text-left animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-serif font-black text-amber-950 text-base sm:text-lg flex items-center gap-2">
                  <Gift className="text-amber-600" size={20} />
                  <span>{language === 'hi' ? 'मखाना गोल्ड पुरस्कार केंद्र' : 'Makhana Gold Reward Center'}</span>
                </h3>
                <p className="text-xs text-gray-450 font-medium">{language === 'hi' ? 'अपने अर्जित पॉइंट्स को डिस्काउंट कूपन में बदलें' : 'Convert earned points into cash savings coupons'}</p>
              </div>
              <button 
                onClick={() => setIsRedeemModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 font-bold text-sm bg-neutral-100 p-1.5 rounded-full cursor-pointer hover:bg-neutral-200"
              >
                ✕
              </button>
            </div>

            {/* Loyalty rules and explanations */}
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100 text-xs space-y-2 text-left">
              <h4 className="font-serif font-bold text-amber-950 uppercase tracking-wide text-[10px] flex items-center gap-1 text-amber-850">
                <Sparkles size={11} className="fill-amber-500 text-amber-500" />
                <span>{language === 'hi' ? 'क्लब के लाभ और नियम:' : 'Program Benefits & Rules:'}</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-600 leading-normal text-[11px]">
                <li>{language === 'hi' ? 'हर खरीद पर राशि का 10% वापिस पॉइंट्स के रूप में कमाएं (₹100 = 10 पॉइंट्स)।' : 'Earn 10% of purchase bills back as loyalty gold points (e.g. ₹100 spend = 10 Points).'}</li>
                <li>{language === 'hi' ? 'अधिक पॉइंट्स हासिल करके मखाना स्तर अनलॉक करें: सिल्वर, गोल्ड और महाराज।' : 'Unlock higher milestone club tiers: Silver Savorer, Golden Guru, and Mithila Maharaja.'}</li>
                <li>{language === 'hi' ? 'आप कभी भी हमारे चेकआउट ड्रावर में इन कूपनों को कॉपी करके छूट पा सकते हैं।' : 'Redeemed coupons are immediately added to your profile where you can copy-paste them at checkout.'}</li>
              </ul>
            </div>

            {/* Current balance */}
            <div className="border border-amber-150 p-4 rounded-2xl flex items-center justify-between bg-amber-50/20">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">
                  {language === 'hi' ? 'आपका रिडीम करने योग्य बैलेंस:' : 'Your Spendable Balance:'}
                </span>
                <span className="text-2xl font-mono font-black text-amber-950 flex items-center gap-1">
                  <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                  <span>{activeAvailablePoints} Pts</span>
                </span>
              </div>
              <span className="bg-yellow-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide border border-yellow-200">
                🎯 {currentTier}
              </span>
            </div>

            {/* Redemption choices */}
            <div className="space-y-2 text-left">
              <h4 className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                {language === 'hi' ? 'रिडीम करने के उत्कृष्ट विकल्प:' : 'Select Conversion Option:'}
              </h4>
              
              {[
                { points: 100, discount: 100 },
                { points: 250, discount: 250 },
                { points: 500, discount: 500 }
              ].map((reward) => {
                const canRedeem = activeAvailablePoints >= reward.points;
                return (
                  <div 
                    key={reward.points} 
                    className={`border rounded-xl p-3.5 flex justify-between items-center transition-all ${
                      canRedeem 
                        ? 'border-amber-200 bg-amber-50/5 hover:border-amber-400 hover:bg-amber-50/15' 
                        : 'border-neutral-200 bg-neutral-50/40 opacity-55'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-amber-950 text-xs sm:text-sm font-serif">₹{reward.discount} {language === 'hi' ? 'छूट कूपन' : 'Discount Coupon'}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{language === 'hi' ? `${reward.points} मखाना गोल्ड पॉइंट्स का उपयोग` : `Converts ${reward.points} Makhana Gold Points`}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        disabled={!canRedeem}
                        onClick={() => {
                          if (onRedeemPoints) {
                            const ok = onRedeemPoints(reward.points, reward.discount, false);
                            if (ok) {
                              setIsRedeemModalOpen(false);
                            }
                          }
                        }}
                        className={`py-1.5 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          canRedeem 
                            ? 'bg-neutral-150 text-amber-900 hover:bg-neutral-250 border border-amber-200/50 font-extrabold active:scale-95' 
                            : 'bg-neutral-250 text-neutral-400 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        {language === 'hi' ? 'केवल बनाएं' : 'Redeem Only'}
                      </button>
                      <button
                        type="button"
                        disabled={!canRedeem}
                        onClick={() => {
                          if (onRedeemPoints) {
                            const ok = onRedeemPoints(reward.points, reward.discount, true);
                            if (ok) {
                              setIsRedeemModalOpen(false);
                            }
                          }
                        }}
                        className={`py-1.5 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          canRedeem 
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm font-extrabold active:scale-95' 
                            : 'bg-neutral-250 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        {language === 'hi' ? 'रिडीम और लागू करें' : 'Redeem & Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY EXPERIENCE FEEDBACK MODAL WINDOW */}
      {isFeedbackModalOpen && selectedFeedbackOrderId && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs" 
          id="delivery-feedback-modal" 
          onClick={() => {
            if (!isSubmittingFeedback) {
              setIsFeedbackModalOpen(false);
              setSelectedFeedbackOrderId(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm sm:max-w-md w-full border border-amber-200 shadow-2xl relative space-y-4 text-left animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-serif font-black text-amber-950 text-base sm:text-lg flex items-center gap-2">
                  <Truck className="text-amber-600" size={20} />
                  <span>{language === 'hi' ? 'कूरियर वितरण अनुभव रेटिंग' : 'Courier Delivery Experience'}</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium font-sans">
                  {language === 'hi' ? `ऑर्डर #${selectedFeedbackOrderId} के डिलीवरी पार्टनर और कूरियर को रेटिंग दें` : `Rate the shipping courier & delivery partner for Order #${selectedFeedbackOrderId}`}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsFeedbackModalOpen(false);
                  setSelectedFeedbackOrderId(null);
                }}
                disabled={isSubmittingFeedback}
                className="text-gray-400 hover:text-gray-650 font-bold text-sm bg-neutral-100 p-1.5 rounded-full cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="py-8 text-center space-y-3 animate-scale-up">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-bold text-2xl">
                  ✓
                </div>
                <h4 className="font-serif font-bold text-amber-950 text-base">
                  {language === 'hi' ? 'शिपिंग प्रतिक्रिया के लिए धन्यवाद!' : 'Logistics Feedback Saved!'}
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  {language === 'hi' 
                    ? 'आपकी रेटिंग से हमारे कूरियर पार्टनर की डिलीवरी गुणवर्त्ता और गति में सुधार करने में सहायता मिलेगी।' 
                    : 'Your courier rating has been successfully logged. This helps us ensure our shipping partners maintain top-tier service standards.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Interactive Star Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-amber-950 uppercase tracking-wider font-sans">
                    {language === 'hi' ? 'कूरियर और डिलीवरी एजेंट रेटिंग:' : 'Rate our shipping partner & courier driver:'}
                  </label>
                  <div className="flex gap-2.5 justify-center bg-amber-50/35 p-3 rounded-2xl border border-amber-100/50">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <motion.button
                        key={starVal}
                        type="button"
                        onClick={() => setFeedbackRating(starVal)}
                        whileHover={{ scale: 1.35, rotate: 6 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        className="cursor-pointer focus:outline-none p-1 transition-transform"
                        id={`delivery-star-btn-${starVal}`}
                        title={`${starVal} Stars`}
                      >
                        <Star
                          size={28}
                          className={`transition-colors duration-150 ${
                            starVal <= feedbackRating
                              ? "text-amber-500 fill-amber-400 drop-shadow-xs"
                              : "text-amber-250 hover:text-amber-400"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-amber-800 italic">
                      {feedbackRating === 5 && (language === 'hi' ? 'बिल्कुल सही और तेज़ डिलीवरी! ✨' : 'Flawless & super fast delivery! ✨')}
                      {feedbackRating === 4 && (language === 'hi' ? 'बहुत अच्छी सर्विस। 👍' : 'Great service overall. 👍')}
                      {feedbackRating === 3 && (language === 'hi' ? 'संतोषजनक लेकिन सुधार संभव है।' : 'Satisfactory but room for improvement.')}
                      {feedbackRating === 2 && (language === 'hi' ? 'धीमी या खराब डिलीवरी अनुभव।' : 'Slow delivery or fragile packaging.')}
                      {feedbackRating === 1 && (language === 'hi' ? 'बेहद असंतोषजनक सेवा।' : 'Highly disappointing logistics service.')}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                    {language === 'hi' ? 'विशिष्ट टिप्पणियां (वैकल्पिक):' : 'Specific comments (Optional):'}
                  </label>
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={language === 'hi' ? 'वितरण गति, पैकेजिंग, या कूरियर के व्यवहार के बारे में लिखें...' : 'Tell us about shipping speed, box condition, delivery agent attitude...'}
                    className="w-full text-xs text-amber-950 bg-white border border-amber-200/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none font-sans"
                  />
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400">{feedbackText.length}/250 {language === 'hi' ? 'अक्षर' : 'characters'}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  disabled={isSubmittingFeedback}
                  onClick={handleSubmitFeedback}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer font-sans shadow-md hover:shadow-lg hover:translate-y-[-1px] select-none active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{language === 'hi' ? 'सबमिट किया जा रहा है...' : 'Submitting feedback...'}</span>
                    </>
                  ) : (
                    <span>{language === 'hi' ? 'प्रतिक्रिया जमा करें' : 'Submit Feedback'}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-bold font-serif text-amber-950 flex items-center gap-2">
          <ShoppingBag className="text-amber-600" size={18} />
          <span>{language === 'hi' ? 'मेरे ऑर्डर का इतिहास' : 'My Order History'}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {orders.length > 0 && (
            <button
              onClick={handleExportToCSV}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-300 text-xs font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer select-none"
              title={language === 'hi' ? 'ऑर्डर सूची CSV के रूप में डाउनलोड करें' : 'Export order list as CSV'}
              id="export-orders-csv-btn"
            >
              <Download size={13} className="text-amber-700 font-extrabold" />
              <span>{language === 'hi' ? 'CSV निर्यात करें' : 'Export to CSV'}</span>
            </button>
          )}
          <button 
            onClick={onRefresh}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-[#FCFBF7] hover:bg-amber-100/50 border border-amber-100/60 px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer select-none"
          >
            {language === 'hi' ? 'शिपमेंट स्थिति की जांच' : 'Check Shipment Status'}
          </button>
        </div>
      </div>

      {/* Filter and Search UI */}
      {orders.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center justify-between" id="order-search-and-filters">
          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2" id="order-status-filters">
            {[
              { key: 'All', labelEn: 'All', labelHi: 'सभी (All)' },
              { key: 'Processing', labelEn: 'Processing', labelHi: 'प्रसंस्कृत (Processing)' },
              { key: 'Delivered', labelEn: 'Delivered', labelHi: 'वितरित (Delivered)' },
              { key: 'Cancelled', labelEn: 'Cancelled', labelHi: 'रद्द (Cancelled)' }
            ].map((opt) => {
              const isSelected = statusFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStatusFilter(opt.key as any)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'bg-amber-950 border-amber-950 text-white shadow-sm font-bold'
                      : 'bg-white border-amber-100 text-amber-950 hover:bg-amber-50/50 hover:border-amber-200'
                  }`}
                >
                  {language === 'hi' ? opt.labelHi : opt.labelEn}
                </button>
              );
            })}
          </div>

          {/* Search keyword input */}
          <div className="relative flex-grow md:max-w-xs" id="order-search-bar-container">
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'ऑर्डर आईडी या उत्पाद खोजें...' : 'Search Order ID or productName...'}
              className="w-full bg-white border border-amber-200/85 focus:border-amber-500 rounded-xl py-2 pl-9 pr-8 text-xs text-amber-950 placeholder-amber-900/40 focus:outline-none transition-all shadow-2xs"
              id="order-search-input"
            />
            <svg
              className="absolute left-3 top-2.5 text-amber-900/40 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {orderSearchQuery && (
              <button
                type="button"
                onClick={() => setOrderSearchQuery('')}
                className="absolute right-3 top-2 text-amber-900/30 hover:text-amber-900/60 font-semibold text-xs bg-neutral-100/80 hover:bg-neutral-200/80 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors"
                title={language === 'hi' ? 'खोज साफ़ करें' : 'Clear search'}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[250px] bg-white rounded-2xl border border-amber-50">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-amber-900/60 text-xs font-semibold uppercase tracking-wider">Syncing package status...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-amber-100 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h4 className="text-amber-950 font-serif font-bold text-base">You haven't ordered anything yet</h4>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">Bihar premium raw & slow-roasted spiced makhanas are waiting for you directly from the ponds of Mithila!</p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Explore Crisp Snacks</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-amber-100 text-center shadow-sm space-y-4" id="empty-filtered-orders">
          <div className="w-16 h-16 bg-amber-50/50 rounded-full flex items-center justify-center text-amber-600 mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h4 className="text-amber-955 font-serif font-bold text-base">
              {language === 'hi' ? 'कोई ऑर्डर नहीं मिला' : 'No matching orders'}
            </h4>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
              {orderSearchQuery.trim()
                ? (language === 'hi'
                  ? `आपकी खोज "${orderSearchQuery}" से मेल खाने वाला कोई ऑर्डर नहीं मिला।`
                  : `There are no orders matching your search "${orderSearchQuery}" in your history.`)
                : (language === 'hi' 
                  ? `इस श्रेणी में कोई ऑर्डर उपलब्ध नहीं है।` 
                  : `There are no orders with status "${statusFilter}" in your account.`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {orderSearchQuery && (
              <button
                type="button"
                onClick={() => setOrderSearchQuery('')}
                className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer"
              >
                <span>{language === 'hi' ? 'खोज साफ़ करें' : 'Clear Search'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setOrderSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{language === 'hi' ? 'सभी ऑर्डर देखें' : 'Show All Orders'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const stepNum = getStatusStep(order.status);
            const isExpanded = !!expandedOrderIds[order.id];
            const itemsCount = order.items?.reduce((all, it) => all + it.quantity, 0) || 0;
            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                id={`user-order-card-${order.id}`}
              >
                {/* Order Summary / Clickable Header */}
                <div 
                  onClick={() => toggleOrderExpand(order.id)}
                  className="p-5 sm:p-6 cursor-pointer select-none hover:bg-amber-50/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono text-amber-800">ORDER #{order.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : order.status === 'Shipped'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-250 font-semibold'
                          : order.status === 'Paid'
                          ? 'bg-blue-50 text-blue-700 border-blue-250 font-semibold'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-250 font-semibold'
                          : 'bg-amber-50 text-amber-750 border-amber-250'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-emerald-500'
                            : order.status === 'Shipped'
                            ? 'bg-indigo-500 animate-pulse'
                            : order.status === 'Paid'
                            ? 'bg-blue-500'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`} />
                        <span>
                          {order.status === 'Completed'
                            ? (language === 'hi' ? 'वितरित (Completed)' : 'Delivered')
                            : order.status === 'Shipped'
                            ? (language === 'hi' ? 'भेजा गया (Shipped)' : 'Shipped')
                            : order.status === 'Paid'
                            ? (language === 'hi' ? 'प्रसंस्कृत (Processing)' : 'Processing')
                            : order.status === 'Cancelled'
                            ? (language === 'hi' ? 'रद्द (Cancelled)' : 'Cancelled')
                            : (language === 'hi' ? 'लंबित (Pending)' : 'Pending')}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{language === 'hi' ? 'दिनांक:' : 'Placed on'} {new Date(order.createdAt).toLocaleDateString()}</span>
                      </p>

                      <p className="text-[11px] text-gray-500 flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100 font-bold select-none">
                        <ShoppingBag size={12} className="text-amber-700" />
                        <span>
                          {language === 'hi' 
                            ? `कुल वस्तुएं: ${itemsCount}` 
                            : `Total Items: ${itemsCount}`}
                        </span>
                      </p>

                      <div 
                        className="flex flex-wrap items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleCopyOrderDetails(order)}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-blue-200 transition-colors cursor-pointer select-none whitespace-nowrap"
                          title={language === 'hi' ? 'ऑर्डर विवरण कॉपी करें' : 'Copy order details to clipboard'}
                          id={`copy-order-${order.id}`}
                        >
                          {copiedOrderId === order.id ? (
                            <>
                              <CheckCircle size={11} className="text-blue-600" />
                              <span>{language === 'hi' ? 'कॉपी हो गया!' : 'Details Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} className="text-blue-600" />
                              <span>{language === 'hi' ? 'विवरण कॉपी करें' : 'Copy Details'}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => printOrderInvoice(order, language)}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-amber-200 transition-colors cursor-pointer select-none whitespace-nowrap"
                        >
                          <Printer size={11} />
                          <span>{language === 'hi' ? 'इनवॉइस प्रिंट करें' : 'Print Invoice'}</span>
                        </button>
                        <button
                          onClick={() => onReorder && onReorder(order)}
                          className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer select-none whitespace-nowrap"
                          title={language === 'hi' ? 'इस ऑर्डर को दोबारा खरीदें' : 'Buy the items in this order again'}
                        >
                          <RotateCcw size={11} className="text-emerald-600" />
                          <span>{language === 'hi' ? 'पुनः ऑर्डर करें' : 'Reorder'}</span>
                        </button>

                        {(order as any).feedback ? (
                          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-amber-200/50">
                            <span className="text-amber-500 font-bold text-xs">★ {(order as any).feedback.rating || 5}</span>
                            <span className="font-semibold text-amber-900/80">({language === 'hi' ? 'प्रतिक्रिया सबमिट की गई' : 'Feedback Submitted'})</span>
                          </div>
                        ) : (
                          order.status === 'Completed' && (
                            <button
                              onClick={() => {
                                setSelectedFeedbackOrderId(order.id);
                                setFeedbackRating(5);
                                setFeedbackText('');
                                setIsFeedbackModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer select-none whitespace-nowrap shadow-xs hover:shadow-sm"
                              id={`leave-feedback-btn-${order.id}`}
                            >
                              <MessageSquare size={11} className="text-white" />
                              <span>{language === 'hi' ? 'प्रतिक्रिया दें' : 'Leave Feedback'}</span>
                            </button>
                          )
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Shipped' && order.status !== 'Completed' && (
                          (() => {
                            const orderObjTime = new Date(order.createdAt).getTime();
                            const diffMs = now.getTime() - orderObjTime;
                            const twentyFourHoursMs = 24 * 60 * 60 * 1000;
                            const isCancellable = diffMs < twentyFourHoursMs;
                            
                            if (!isCancellable) return null;

                            const timeLeftMs = twentyFourHoursMs - diffMs;
                            const hLLeft = Math.floor(timeLeftMs / (3600000));
                            const mLLeft = Math.floor((timeLeftMs % 3600000) / 60000);
                            const timeLeftStr = `${hLLeft}h ${mLLeft}m left`;

                            const isConfirming = confirmCancelId === order.id;

                            if (isConfirming) {
                              return (
                                <div className="inline-flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200 shadow-sm animate-fade-in">
                                  <span className="text-[10px] font-bold text-rose-800 px-1.5 font-sans">
                                    {language === 'hi' ? 'रद्द करें?' : 'Are you sure?'}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      if (onCancelOrder) {
                                        await onCancelOrder(order.id);
                                      }
                                      setConfirmCancelId(null);
                                    }}
                                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold py-0.5 px-2 rounded transition-colors cursor-pointer select-none"
                                  >
                                    {language === 'hi' ? 'हां, रद्द करें' : 'Yes, Cancel'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmCancelId(null)}
                                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[10px] font-extrabold py-0.5 px-2 rounded transition-colors cursor-pointer select-none"
                                  >
                                    {language === 'hi' ? 'नहीं' : 'No'}
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <button
                                onClick={() => {
                                  setConfirmCancelId(order.id);
                                }}
                                className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-rose-200 transition-colors cursor-pointer select-none animate-pulse hover:animate-none whitespace-nowrap"
                                title={language === 'hi' ? `रद्द करने के लिए समय शेष: ${timeLeftStr}` : `Time left to cancel: ${timeLeftStr}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-0.5 animate-ping"></span>
                                <span>{language === 'hi' ? 'ऑर्डर रद्द करें' : 'Cancel Order'}</span>
                                <span className="text-[9px] opacity-75 font-mono">({timeLeftStr})</span>
                              </button>
                            );
                          })()
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-sm select-none">
                        <Sparkles size={11} className="fill-amber-500 text-amber-500 animate-pulse" />
                        <span>+{Math.floor(order.totalAmount * 0.10)} {getUiTranslation(language, 'points')} ({language === 'hi' ? 'अर्जित' : 'Earned'})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-left md:text-right font-sans shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Total Bill Value</span>
                      <h4 className="text-base font-bold text-amber-950 font-sans">₹{order.totalAmount}</h4>
                      <span className="text-[10px] text-amber-750 font-black block mt-0.5 sm:inline-block hover:underline">
                        {isExpanded ? (language === 'hi' ? 'विवरण छुपाएं ▲' : 'Hide Details ▲') : (language === 'hi' ? 'विवरण देखें ▼' : 'View Details ▼')}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-50/50 hover:bg-amber-100 border border-amber-100/50 flex items-center justify-center text-amber-800 transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Expanded Details View */}
                {isExpanded && (
                  <div className="border-t border-amber-100/60 bg-[#FCFAF6]/35 p-5 sm:p-6 space-y-6 animate-fade-in text-left">
                    {/* Item Breakdown */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 flex items-center gap-1.5">
                        <Package size={12} /> {language === 'hi' ? 'ऑर्डर की वस्तुएं' : 'Order Items Breakdown'}
                      </span>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 justify-between bg-white p-3 rounded-xl border border-amber-100/40 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center font-bold text-xs text-amber-800 shrink-0">
                                {item.productName[0]}
                              </div>
                              <div>
                                <h5 className="font-semibold text-amber-950 text-xs">{item.productName}</h5>
                                <span className="text-[10px] text-gray-400">Qty: {item.quantity} × ₹{item.price}</span>
                              </div>
                            </div>
                            <span className="font-bold text-amber-900 text-xs font-mono">₹{item.quantity * item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address & Payment Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping Address */}
                      <div className="bg-white p-4 rounded-xl border border-amber-100/40 text-xs shadow-2xs">
                        <h5 className="font-serif font-bold text-amber-950 text-xs mb-3 uppercase tracking-wide flex items-center gap-1.5">
                          <Truck size={13} className="text-amber-700" />
                          <span>{language === 'hi' ? 'डिलिवरी पता' : 'Shipping Address'}</span>
                        </h5>
                        <div className="space-y-1 text-gray-600 font-sans leading-relaxed">
                          <p className="font-bold text-amber-950 text-xs capitalize">{order.fullName}</p>
                          <p className="text-xs">{order.address}</p>
                          <p className="capitalize text-xs">{order.city}, {order.state} - <span className="font-mono font-bold text-amber-950">{order.zipCode}</span></p>
                          <div className="text-[10px] text-gray-500 font-mono pt-2 space-y-0.5 border-t border-dashed border-amber-100/60 mt-2">
                            <p>{language === 'hi' ? 'फोन:' : 'Phone:'} <span className="font-bold text-amber-950">{order.phone}</span></p>
                            <p>{language === 'hi' ? 'ईमेल:' : 'Email:'} <span className="font-bold text-amber-950">{order.email}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Details */}
                      <div className="bg-white p-4 rounded-xl border border-amber-100/40 text-xs shadow-2xs flex flex-col justify-between gap-3">
                        <div className="space-y-3">
                          <h5 className="font-serif font-bold text-amber-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                            <User size={13} className="text-amber-700" />
                            <span>{language === 'hi' ? 'भुगतान विवरण' : 'Payment Details'}</span>
                          </h5>
                          <div className="space-y-2 text-gray-600 font-sans">
                            <div className="flex justify-between items-center text-xs">
                              <span>{language === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                              <span className="font-semibold text-amber-950 font-mono">
                                {order.paymentMethod === 'COD' 
                                  ? (language === 'hi' ? 'कैश ऑन डिलीवरी (COD)' : 'Cash On Delivery (COD)')
                                  : (language === 'hi' ? 'डिजिटल पेमेंट (Prepaid)' : 'Digital Payment (Razorpay)')}
                              </span>
                            </div>
                            {order.paymentId && (
                              <div className="flex justify-between items-center text-[10px]">
                                <span>{language === 'hi' ? 'ट्रांजैक्शन आईडी:' : 'Transaction ID:'}</span>
                                <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded select-all">
                                  {order.paymentId}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center border-t border-amber-100 pt-2 font-bold text-amber-900 text-xs">
                              <span>{language === 'hi' ? 'कुल भुगतान:' : 'Grand Total Paid:'}</span>
                              <span className="font-mono text-sm text-amber-950 font-black">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-amber-800/70 italic leading-relaxed pt-2 border-t border-dashed border-amber-100">
                          {language === 'hi' 
                            ? '* ग्राहक सेवा पूछताछ के लिए ORDER ID कॉपी करें या इनवॉइस प्रिंट करें।' 
                            : '* Please use the Copy Details or Print Invoice buttons above for any logistics support enquiries.'}
                        </div>
                      </div>
                    </div>

                    {/* Live Logistics Tracker */}
                    {order.status === 'Cancelled' ? (
                      <div className="p-5 bg-rose-50/75 border border-rose-100 rounded-xl text-center space-y-1">
                        <span className="text-sm">🚫</span>
                        <h4 className="text-xs font-bold text-rose-800">{language === 'hi' ? 'यह ऑर्डर रद्द हो गया है' : 'This Order was Cancelled'}</h4>
                        <p className="text-[10px] text-rose-600/90 leading-normal">{language === 'hi' ? 'यह ऑर्डर निरस्त कर दिया गया है और आगे संसाधित नहीं किया जाएगा।' : 'This order has been cancelled on request and will not be packaged or shipped.'}</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FCFBF7] rounded-xl border border-amber-100/30">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 flex items-center gap-1.5 mb-3.5 select-none">
                          <Truck size={12} /> Live Logistics Tracker
                        </span>
                        
                        {/* Step circles progress bars */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-gray-400 relative">
                          
                          {/* Progress bar fill layer */}
                          <div className="absolute top-3.5 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-0">
                            <div 
                              className="h-full bg-amber-600 transition-all duration-500" 
                              style={{ width: `${((stepNum - 1) / 3) * 100}%` }}
                            ></div>
                          </div>

                          {[
                            { step: 1, label: language === 'hi' ? 'लंबित' : 'Pending' },
                            { step: 2, label: language === 'hi' ? 'स्वीकृत' : 'Approved' },
                            { step: 3, label: language === 'hi' ? 'भेजा गया' : 'Shipped' },
                            { step: 4, label: language === 'hi' ? 'वितरित' : 'Completed' }
                          ].map((st) => {
                            const isActive = stepNum >= st.step;
                            return (
                              <div key={st.step} className="flex flex-col items-center relative z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                                  isActive 
                                    ? 'bg-amber-600 border-amber-600 text-white shadow-sm' 
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                  {isActive ? <CheckCircle size={14} strokeWidth={2.5} /> : st.step}
                                </div>
                                <span className={`mt-1.5 uppercase tracking-wide text-[9px] ${isActive ? 'text-amber-800 font-extrabold' : ''}`}>
                                  {st.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-amber-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] text-gray-500">
                          {order.status !== 'Completed' ? (
                            <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50 font-sans shadow-2xs">
                              <Calendar size={12} className="text-amber-600 shrink-0" />
                              <span>
                                {language === 'hi' ? 'अनुमानित डिलीवरी:' : 'Est. Delivery:'}{' '}
                                <span className="font-bold text-amber-950 font-mono">{getEstimatedDeliveryDate(order.createdAt, language)}</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/40 font-sans shadow-2xs">
                              <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                              <span className="font-bold">
                                {language === 'hi' ? 'सुरक्षित वितरित किया गया' : 'Successfully Delivered'}
                              </span>
                            </div>
                          )}
                          {order.trackingNumber && (
                            <div className="font-mono text-gray-450 text-[9px] flex items-center gap-1.5 self-end sm:self-auto">
                              <span>{language === 'hi' ? 'ट्रैकिंग:' : 'Tracking:'}</span>
                              <span className="bg-amber-100 text-amber-850 font-black px-2 py-0.5 rounded tracking-wider">{order.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
