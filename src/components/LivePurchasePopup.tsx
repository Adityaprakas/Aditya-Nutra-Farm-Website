import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle, Sparkles, Star } from 'lucide-react';

interface PurchaseItem {
  name: string;
  city: string;
  product: string;
  initialOffsetMinutes: number; // minutes ago when page loaded
  creationTimeMs: number; // computed absolute epoch
}

// 100 highly realistic Indian shoppers with their locations and product choices
const PURCHASE_BACKUPS = [
  { name: "Rahul", city: "Patna", product: "Premium Raw Jumbo Makhana" },
  { name: "Priya", city: "Delhi", product: "Cheese Herbs Makhana" },
  { name: "Aman", city: "Mumbai", product: "Peri Peri Crunchy Makhana" },
  { name: "Sneha", city: "Bangalore", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Vikram", city: "Pune", product: "Chatpata Mint Pudina Gourmet Foxnuts" },
  { name: "Neha", city: "Kolkata", product: "Chocolate Coated Sweet Makhana" },
  { name: "Ankit", city: "Gaya", product: "Caramelized Sweet Makhana" },
  { name: "Divya", city: "Ranchi", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Sanjay", city: "Darbhanga", product: "Premium Raw Jumbo Makhana" },
  { name: "Ritu", city: "Noida", product: "Roasted Salt & Pepper Makhana" },
  { name: "Rohan", city: "Muzaffarpur", product: "Tangy Tomato Crispy Foxnuts" },
  { name: "Anjali", city: "Hyderabad", product: "Himalayan Roasted Cashews" },
  { name: "Jyoti", city: "Purnea", product: "Diet Salt Free Phool Makhana" },
  { name: "Abhinav", city: "Bhagalpur", product: "California Almonds" },
  { name: "Shreya", city: "Gurgaon", product: "Cheese Herbs Makhana" },
  { name: "Amit", city: "Ahmedabad", product: "Peri Peri Crunchy Makhana" },
  { name: "Sameer", city: "Chennai", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Kajal", city: "Bihar Sharif", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Vijay", city: "Arrah", product: "Premium Raw Jumbo Makhana" },
  { name: "Kiran", city: "Samastipur", product: "Chatpata Mint Pudina Gourmet Foxnuts" },
  { name: "Nitin", city: "Gwalior", product: "Roasted Salt & Pepper Makhana" },
  { name: "Tanvi", city: "Bhopal", product: "Chocolate Coated Sweet Makhana" },
  { name: "Alok", city: "Indore", product: "California Almonds" },
  { name: "Pooja", city: "Lucknow", product: "Himalayan Roasted Cashews" },
  { name: "Siddharth", city: "Dehradun", product: "Cheese Herbs Makhana" },
  { name: "Megha", city: "Chandigarh", product: "Peri Peri Crunchy Makhana" },
  { name: "Gaurav", city: "Ghaziabad", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Pallavi", city: "Faridabad", product: "Premium Raw Jumbo Makhana" },
  { name: "Vivek", city: "Sasaram", product: "Tangy Tomato Crispy Foxnuts" },
  { name: "Richa", city: "Motihari", product: "Diet Salt Free Phool Makhana" },
  { name: "Varun", city: "Buxar", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Swati", city: "Hajipur", product: "Roasted Salt & Pepper Makhana" },
  { name: "Himanshu", city: "Begusarai", product: "Cheese Herbs Makhana" },
  { name: "Rashmi", city: "Katihar", product: "Caramelized Sweet Makhana" },
  { name: "Kunal", city: "Siwan", product: "Peri Peri Crunchy Makhana" },
  { name: "Preeti", city: "Gopalganj", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Nidhi", city: "Madhubani", product: "Premium Raw Jumbo Makhana" },
  { name: "Rajesh", city: "Jehanabad", product: "Chatpata Mint Pudina Gourmet Foxnuts" },
  { name: "Aarti", city: "Sitamarhi", product: "California Almonds" },
  { name: "Deepak", city: "Saharsa", product: "Himalayan Roasted Cashews" },
  { name: "Komal", city: "Khagaria", product: "Cheese Herbs Makhana" },
  { name: "Pankaj", city: "Jamui", product: "Peri Peri Crunchy Makhana" },
  { name: "Suman", city: "Nawada", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Ravi", city: "Aurangabad", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Meena", city: "Arwal", product: "Premium Raw Jumbo Makhana" },
  { name: "Sunil", city: "Banka", product: "Roasted Salt & Pepper Makhana" },
  { name: "Seema", city: "Lakhisarai", product: "Tangy Tomato Crispy Foxnuts" },
  { name: "Manoj", city: "Sheikhpura", product: "Diet Salt Free Phool Makhana" },
  { name: "Kavita", city: "Munger", product: "Caramelized Sweet Makhana" },
  { name: "Harish", city: "Nalanda", product: "Cheese Herbs Makhana" },
  { name: "Lalita", city: "Kishanganj", product: "Peri Peri Crunchy Makhana" },
  { name: "Dinesh", city: "Araria", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Asha", city: "Supaul", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Mahesh", city: "Madhepura", product: "Premium Raw Jumbo Makhana" },
  { name: "Rekha", city: "Kaimur", product: "California Almonds" },
  { name: "Umesh", city: "Sheohar", product: "Himalayan Roasted Cashews" },
  { name: "Tara", city: "West Champaran", product: "Cheese Herbs Makhana" },
  { name: "Dev", city: "East Champaran", product: "Peri Peri Crunchy Makhana" },
  { name: "Durga", city: "Vaishali", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Mohit", city: "Rohtas", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Sunita", city: "Jaipur", product: "Premium Raw Jumbo Makhana" },
  { name: "Krishna", city: "Nagpur", product: "Roasted Salt & Pepper Makhana" },
  { name: "Geeta", city: "Surat", product: "Tangy Tomato Crispy Foxnuts" },
  { name: "Uday", city: "Vadodara", product: "Diet Salt Free Phool Makhana" },
  { name: "Anand", city: "Kochi", product: "Caramelized Sweet Makhana" },
  { name: "Rekha", city: "Coimbatore", product: "Cheese Herbs Makhana" },
  { name: "Vinay", city: "Madurai", product: "Peri Peri Crunchy Makhana" },
  { name: "Sandhya", city: "Visakhapatnam", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Abhay", city: "Vijayawada", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Chitra", city: "Bhubaneshwar", product: "Premium Raw Jumbo Makhana" },
  { name: "Raj", city: "Rourkela", product: "Roasted Salt & Pepper Makhana" },
  { name: "Prerna", city: "Jamshedpur", product: "California Almonds" },
  { name: "Manish", city: "Dhanbad", product: "Himalayan Roasted Cashews" },
  { name: "Pooja", city: "Shimla", product: "Cheese Herbs Makhana" },
  { name: "Raman", city: "Amritsar", product: "Peri Peri Crunchy Makhana" },
  { name: "Harpreet", city: "Ludhiana", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Jatin", city: "Jalandhar", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Payal", city: "Agra", product: "Premium Raw Jumbo Makhana" },
  { name: "Shashi", city: "Varanasi", product: "Roasted Salt & Pepper Makhana" },
  { name: "Tarun", city: "Meerut", product: "Tangy Tomato Crispy Foxnuts" },
  { name: "Arjun", city: "Allahabad", product: "Diet Salt Free Phool Makhana" },
  { name: "Kanta", city: "Bareilly", product: "Caramelized Sweet Makhana" },
  { name: "Lokesh", city: "Aligarh", product: "Cheese Herbs Makhana" },
  { name: "Kiran", city: "Moradabad", product: "Peri Peri Crunchy Makhana" },
  { name: "Yash", city: "Mathura", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Suman", city: "Gaya", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Aparna", city: "Puri", product: "Premium Raw Jumbo Makhana" },
  { name: "Kunal", city: "Cuttack", product: "Roasted Salt & Pepper Makhana" },
  { name: "Meghna", city: "Jabalpur", product: "California Almonds" },
  { name: "Pradeep", city: "Ujjain", product: "Himalayan Roasted Cashews" },
  { name: "Nisha", city: "Raipur", product: "Cheese Herbs Makhana" },
  { name: "Aditya", city: "Bilaspur", product: "Peri Peri Crunchy Makhana" },
  { name: "Smita", city: "Ranchi", product: "Classic Slow-Roasted Phool Makhana" },
  { name: "Varun", city: "Guwahati", product: "Royal Kesar Dry Fruit Mix" },
  { name: "Dipali", city: "Tezpur", product: "Premium Raw Jumbo Makhana" },
  { name: "Siddhesh", city: "Goa", product: "Roasted Salt & Pepper Makhana" },
  { name: "Amrita", city: "Nashik", product: "Tangy Tomato Crispy Foxnuts" },
  { name: "Rohit", city: "Kolhapur", product: "Diet Salt Free Phool Makhana" },
  { name: "Aishwarya", city: "Aurangabad", product: "Caramelized Sweet Makhana" },
  { name: "Harsh", city: "Kota", product: "Cheese Herbs Makhana" }
];

export default function LivePurchasePopup({ language }: { language: 'en' | 'hi' }) {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [activeItem, setActiveItem] = useState<PurchaseItem | null>(null);
  const [visible, setVisible] = useState(false);

  // Initialize notifications with simulated random real creation epochs upon page load
  useEffect(() => {
    const initialized = PURCHASE_BACKUPS.map((item, idx) => {
      // Stagger initial time offsets (e.g. some purchased 1 min ago, some 15 mins, some 2 hours ago)
      const initialOffsetMinutes = Math.floor(Math.random() * 45) + 2; 
      const creationTimeMs = Date.now() - (initialOffsetMinutes * 60 * 1000);
      return {
        ...item,
        initialOffsetMinutes,
        creationTimeMs
      };
    });
    // Shuffle lists so every visitor sees a fresh random start
    const shuffled = [...initialized].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  // Control loop: pop up a new notification in gaps of 30 seconds
  useEffect(() => {
    if (items.length === 0) return;

    let currentIndex = 0;

    const triggerNotification = () => {
      const selected = items[currentIndex];
      setActiveItem(selected);
      setVisible(true);

      // Hide after 6 seconds
      const hideTimeout = setTimeout(() => {
        setVisible(false);
      }, 6000);

      // Cycle index
      currentIndex = (currentIndex + 1) % items.length;

      return hideTimeout;
    };

    // First trigger after 10 seconds
    const initialDelay = setTimeout(() => {
      triggerNotification();
    }, 10000);

    // Standard 30 second repeating loop
    const interval = setInterval(() => {
      triggerNotification();
    }, 30000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [items]);

  // Read current display time (continuous, realistically tracking the time gap correctly)
  const getDisplayTimeText = (item: PurchaseItem) => {
    const diffMs = Date.now() - item.creationTimeMs;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    
    if (diffMins <= 1) {
      return language === 'hi' ? "अभी-अभी" : "Just now";
    } else if (diffMins < 60) {
      return language === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins}m ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
    }
  };

  return (
    <AnimatePresence>
      {visible && activeItem && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="fixed bottom-4 left-4 z-50 max-w-sm w-[90vw] sm:w-[350px] bg-[#0E1013]/95 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl p-4 rounded-2xl flex items-start gap-3 select-none"
          id="live-purchase-notification-popup"
        >
          {/* Circular Icon bag */}
          <div className="flex items-center justify-center bg-[#D4AF37]/10 p-2.5 rounded-xl text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
            <ShoppingBag size={18} className="animate-pulse" />
          </div>

          {/* Texts info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] flex items-center gap-1">
                <Sparkles size={9} />
                {language === 'hi' ? "सत्यापित खरीद" : "Verified Order"}
              </span>
              <span className="text-[9px] font-mono text-gray-400 bg-white/5 py-0.5 px-2 rounded-full font-bold">
                {getDisplayTimeText(activeItem)}
              </span>
            </div>

            <p className="text-xs text-white/95 leading-relaxed font-sans font-medium">
              <span className="font-extrabold text-[#D4AF37]">
                {activeItem.name}
              </span>{" "}
              {language === 'hi' ? 'ने' : 'from'}{" "}
              <span className="font-bold text-gray-200">{activeItem.city}</span>{" "}
              {language === 'hi' ? 'खरीदा' : 'purchased'}{" "}
              <span className="font-extrabold text-[#D4AF37] underline decoration-dotted decoration-[#D4AF37]/40 underline-offset-2">
                {activeItem.product}
              </span>
            </p>

            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={8} fill="currentColor" stroke="none" />
                ))}
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded">
                ✓ {language === 'hi' ? "भेजा जा चुका है" : "Dispatched"}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
