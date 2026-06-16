// English & Hindi Translations Dictionary for Aditya Nutra Farm
// This allows fluent switching without requiring separate database schemes or broken fields.

export const PRODUCT_TRANSLATIONS: Record<string, { name: string; description: string }> = {
  "classic roasted": {
    name: "क्लासिक भुना हुआ मखाना",
    description: "सच्चे बिहार के कमल उत्पादकों से सीधे मंगवाया गया। शुद्ध शाकाहारी, रसायन मुक्त सुपर स्नैक्स।"
  },
  "classic slow-roasted phool": {
    name: "क्लासिक भुना हुआ मखाना",
    description: "सच्चे बिहार के कमल उत्पादकों से सीधे मंगवाया गया। शुद्ध शाकाहारी, रसायन मुक्त सुपर स्नैक्स।"
  },
  "himalayan pink salt": {
    name: "हिमालयन पिंक साल्ट मखाना",
    description: "असली हिमालयन गुलाबी सेंधा नमक के साथ हल्का भुना हुआ प्रीमियम बड़े आकार का मखाना।"
  },
  "hari mirchi": {
    name: "तीखा हरी मिर्च और मसाला मखाना",
    description: "जैविक तीखी हरी मिर्च, जीरा और पारंपरिक उत्तर भारतीय मसालों से भरपूर स्वादिष्ट मखाना।"
  },
  "sweet jaggery": {
    name: "मीठा गुड़ और सौंफ मखाना",
    description: "शुद्ध गन्ने के गुड़ और मीठी सौंफ के साथ पूरी तरह से लिपटे हुए स्वादिष्ट भुने हुए मखाने।"
  },
  "salted almonds": {
    name: "नमकीन कैलिफ़ोर्निया बादाम",
    description: "प्राकृतिक नमक के स्पर्श के साथ कुरकुरे भुने हुए उत्कृष्ट प्रीमियम बड़े आकार के कैलिफोर्निया बादाम।"
  },
  "organic whole cashews": {
    name: "ऑर्गेनिक काजू",
    description: "जैविक बागानों से प्राप्त सतत रूप से उगाए गए, हाथ से चुने गए मक्खन जैसे सूखे भुने काजू।"
  },
  "tangy tomato": {
    name: "चटपटा टमाटर मखाना",
    description: "हल्के और मुंह में पानी लाने वाले भारतीय मसालों के साथ रसीले धूप में सुखाए गए टमाटर का मिश्रण।"
  },
  "mint pudina": {
    name: "पुदीना मखाना",
    description: "कुरकुरे घी में भुने हुए मखाने पर ताजी गर्मियों की पुदीना पत्तियों की खुशबू।"
  },
  "white cheddar": {
    name: "वाइट चेद्दार और हर्ब्स मखाना",
    description: "सूखे इतालवी जैविक ऑरेगैनो और तुलसी के हर्ब्स के साथ मिश्रित स्वादिष्ट सफ़ेद चेडर चीज़।"
  }
};

// General UI Labels translation map
export const UI_TRANSLATIONS = {
  en: {
    storeVariantCatalog: "Store Variant Catalog",
    savorHealthyDelights: "Savor Healthy Delights",
    sourcedFromBihar: "Sourced directly from native Bihar lotus growers. Pure vegetarian, chemical-free super snacks.",
    home: "Home",
    shop: "Shop Products",
    ourProducts: "Our Products",
    ourStory: "Our Story",
    faqs: "FAQs",
    contactUs: "Contact Us",
    trackOrder: "Track Order",
    searchPlaceholder: "Search premium snacks...",
    signIn: "Sign In",
    logout: "Logout",
    all: "All Superfoods",
    raw: "Raw Makhana",
    roasted: "Classic Roasted",
    flavored: "Flavored Foxnuts",
    cashews: "Organic Cashews",
    almonds: "California Almonds",
    raw_makhana: "Raw Makhana",
    flavoured_makhana: "Flavoured Makhana",
    health_nutrition: "Health & Nutrition",
    dry_fruit_mixes: "Dry Fruit Mixes",
    gift_packs: "Gift Packs",
    combo_packs: "Combo Packs",
    premium_collection: "Premium Collection",
    mrp: "MRP",
    price: "Our Price",
    addToBag: "Add to Bag",
    adding: "Adding...",
    buyNow: "Quick Buy",
    reviews: "Reviews",
    writeReview: "Write a Product Review",
    rating: "Rating",
    comment: "Comment",
    submitReview: "Submit Review",
    submitting: "Submitting...",
    noProducts: "No products found matching filters.",
    clearFilters: "Clear search filters & view all items",
    trackPromo: "Have an order ID? Track your shipment instantly.",
    enterOrderId: "Enter your 5-digit Order ID or Tracking Code...",
    trackButton: "Track Delivery Status",
    trackingIdPlaceholder: "e.g., 5, 12, or ANT-285934",
    orderStatus: "Order Status",
    makhanaBenefitsHeading: "Mithila's Superfood of Wellness",
    makhanaBenefitsSub: "Celebrated for centuries, phool makhana is a goldmine de-oxygenating health shield.",
    motherearth: "Handharvested with respect for Mother Earth.",
    verifiedBuyer: "Verified Buyer",
    activeAdminConsole: "Active Administrative Console",
    salesPerformanceReports: "Sales & Performance Reports",
    sortBy: "Sort By",
    sortDefault: "Farm Fresh Sorting",
    sortLowHigh: "Price: Low to High",
    sortHighLow: "Price: High to Low",
    sortRating: "Top Rated Varieties",
    queryingStores: "Querying active farm stores...",
    wishlist: "Wishlist",
    savedItems: "Saved Items",
    compare: "Compare",
    compareTitle: "Product Comparison Table",
    comparisonLimit: "You can compare up to 3 products.",
    addToCompare: "Compare",
    removeFromCompare: "Remove",
    printInvoice: "Print Invoice",
    invoiceHeading: "Official Tax Invoice",
    invoiceGst: "Aditya Nutra Farms Private Limited. GSTIN: 10AABCA1234F1Z3",
    invoiceSuccess: "Order Invoice Generated Successfully",
    total: "Total",
    status: "Status",
    paymentMethod: "Payment Method",
    date: "Date",
    orderIdText: "Order ID",
    nutrition: "Nutritional Facts",
    energy: "Energy (per 100g)",
    protein: "Protein (per 100g)",
    calcium: "Calcium (per 100g)",
    fat: "Fat",
    ratingWord: "Rating",
    mrpWord: "MRP",
    priceWord: "Price",
    removeFromWishlist: "Remove",
    moveToCart: "Move to Bag",
    wishlistEmpty: "Your Wishlist is empty. Browse the shop to save your favorite organic snacks!",
    newsletterTitle: "Subscribe to Our Newsletter",
    newsletterSub: "Get farm-fresh updates, organic recipe cards, and exclusive discount coupons directly in your inbox.",
    enterEmail: "Enter your email address...",
    subscribe: "Subscribe",
    thankYouNews: "Thank you for subscribing to Aditya Nutra Farms newsletter!",
    alreadySubbed: "This email address is already subscribed to our list!",
    loyaltyBalance: "Loyalty Points Balance",
    makhanaClub: "Makhana Gold Loyalty Club",
    ptsEarned: "Points Earned",
    earnedPtsDesc: "Earn 10 points for every ₹100 spent on Aditya Nutra Farms!",
    silverSavorer: "Silver Savorer",
    goldenGuru: "Golden Guru",
    mithilaMaharaja: "Mithila Maharaja",
    nextTier: "to next reward level",
    earnedOnOrder: "Points earned on this order:",
    points: "Points"
  },
  hi: {
    storeVariantCatalog: "स्टोर उत्पाद सूची",
    savorHealthyDelights: "स्वस्थ और स्वादिष्ट मखाने का आनंद लें",
    sourcedFromBihar: "बिहार के प्राकृतिक कमल उत्पादकों से सीधे मंगाया गया। शुद्ध शाकाहारी, रसायन मुक्त सुपर स्नैक्स।",
    home: "मुख्य पृष्ठ",
    shop: "उत्पाद ख़रीदें",
    ourProducts: "हमारे उत्पाद",
    ourStory: "हमारी कहानी",
    faqs: "पूछे जाने वाले प्रश्न",
    contactUs: "संपर्क करें",
    trackOrder: "ऑर्डर ट्रैक करें",
    searchPlaceholder: "प्रीमियम स्नैक्स खोजें...",
    signIn: "लॉग इन करें",
    logout: "लॉग आउट",
    all: "सभी सुपरफूड्स",
    raw: "प्रीमियम कच्चा मखाना",
    roasted: "क्लासिक भुना हुआ",
    flavored: "मसालेदार मखाना",
    cashews: "ऑर्गेनिक काजू",
    almonds: "कैलिफ़ोर्निया बादाम",
    raw_makhana: "Raw Makhana / कच्चा मखाना",
    flavoured_makhana: "Flavoured Makhana / स्वादिष्ट मखाना",
    health_nutrition: "Health & Nutrition / स्वास्थ्य-पोषण",
    dry_fruit_mixes: "Dry Fruit Mixes / मेवे मिश्रण",
    gift_packs: "Gift Packs / उपहार पैक",
    combo_packs: "Combo Packs / कॉम्बो पैक",
    premium_collection: "Premium Collection / प्रीमियम संग्रह",
    mrp: "अधिकतम खुदरा मूल्य",
    price: "हमारी कीमत",
    addToBag: "झोले में डालें",
    adding: "डाल रहे हैं...",
    buyNow: "तुरंत खरीदें",
    reviews: "समीक्षाएं",
    writeReview: "उत्पाद की समीक्षा लिखें",
    rating: "रेटिंग",
    comment: "अपनी राय लिखें",
    submitReview: "समीक्षा सबमिट करें",
    submitting: "सबमिट हो रहा है...",
    noProducts: "फ़िल्टर से मेल खाता कोई उत्पाद नहीं मिला।",
    clearFilters: "फ़िल्टर हटाएं और सभी उत्पाद देखें",
    trackPromo: "क्या आपके पास ऑर्डर आईडी है? तुरंत शिपमेंट ट्रैक करें।",
    enterOrderId: "अपनी 5-अंकीय ऑर्डर आईडी या ट्रैकिंग कोड दर्ज करें...",
    trackButton: "डिलीवरी स्थिति जांचें",
    trackingIdPlaceholder: "जैसे, 5, 12, या ANT-285934",
    orderStatus: "ऑर्डर की स्थिति",
    makhanaBenefitsHeading: "मिथिला का स्वास्थ्यवर्धक सुपरफूड",
    makhanaBenefitsSub: "सदियों से प्रशंसित, फूल मखाना स्वास्थ्य और ऊर्जा का एक अद्भुत खजाना है।",
    motherearth: "धरती मां के प्रति सम्मान के साथ हाथ से काटा गया।",
    verifiedBuyer: "सत्यापित खरीदार",
    activeAdminConsole: "सक्रिय प्रशासनिक कंसोल",
    salesPerformanceReports: "बिक्री और प्रदर्शन रिपोर्ट",
    sortBy: "क्रमबद्ध करें",
    sortDefault: "पसंदीदा उत्पाद",
    sortLowHigh: "मूल्य: कम से अधिक",
    sortHighLow: "मूल्य: अधिक से कम",
    sortRating: "शीर्ष रेटेड उत्पाद",
    queryingStores: "सक्रिय कृषि भंडार की खोज की जा रही है...",
    wishlist: "इच्छा-सूची",
    savedItems: "सहेजे गए उत्पाद",
    compare: "तुलना करें",
    compareTitle: "उत्पाद तुलना तालिका",
    comparisonLimit: "आप अधिकतम 3 उत्पादों की तुलना कर सकते हैं।",
    addToCompare: "तुलना करें",
    removeFromCompare: "हटाएं",
    printInvoice: "इनवॉइस प्रिंट करें",
    invoiceHeading: "आधिकारिक टैक्स इनवॉइस",
    invoiceGst: "आदित्य न्युट्रा फार्म्स प्राइवेट लिमिटेड। जीएसटी संख्या: 10AABCA1234F1Z3",
    invoiceSuccess: "ऑर्डर इनवॉइस सफलतापूर्वक तैयार किया गया",
    total: "कुल योग",
    status: "स्थिति",
    paymentMethod: "भुगतान विधि",
    date: "दिनांक",
    orderIdText: "ऑर्डर आईडी",
    nutrition: "पोषण तथ्य",
    energy: "ऊर्जा (प्रति 100 ग्राम)",
    protein: "प्रोटीन (प्रति 100 ग्राम)",
    calcium: "कैल्शियम (प्रति 100 ग्राम)",
    fat: "वसा",
    ratingWord: "रेटिंग",
    mrpWord: "अधिकतम खुदरा मूल्य",
    priceWord: "मूल्य",
    removeFromWishlist: "हटाएं",
    moveToCart: "झोले में भेजें",
    wishlistEmpty: "आपकी इच्छा-सूची खाली है। अपने पसंदीदा ऑर्गेनिक स्नैक्स को सहेजने के लिए दुकान देखें!",
    newsletterTitle: "हमारे न्यूज़लेटर की सदस्यता लें",
    newsletterSub: "सीधे अपने इनबॉक्स में ताजा कृषि अपडेट, जैविक नुस्खा कार्ड और विशेष छूट कूपन प्राप्त करें।",
    enterEmail: "अपना ईमेल पता दर्ज करें...",
    subscribe: "सदस्यता लें",
    thankYouNews: "आदित्य न्युट्रा फार्म्स न्यूज़लेटर की सदस्यता लेने के लिए धन्यवाद!",
    alreadySubbed: "यह ईमेल पता पहले से ही हमारी सूची में मौजूद है!",
    loyaltyBalance: "लॉयल्टी पॉइंट्स बैलेंस",
    makhanaClub: "मखाना गोल्ड लॉयल्टी क्लब",
    ptsEarned: "अर्जित पॉइंट्स",
    earnedPtsDesc: "आदित्य न्युट्रा फार्म्स पर खर्च किए गए प्रत्येक ₹100 पर 10 पॉइंट्स कमाएं!",
    silverSavorer: "सिल्वर सेवादार",
    goldenGuru: "गोल्डन गुरु",
    mithilaMaharaja: "मिथिला महाराजा",
    nextTier: "अगले इनाम स्तर के लिए",
    earnedOnOrder: "इस ऑर्डर पर अर्जित पॉइंट्स:",
    points: "पॉइंट्स"
  }
};

/**
 * Translates a product's name and description based on selected language.
 * Falls back to original language text if not found.
 */
export function getProductLocalization(
  lang: 'en' | 'hi',
  originalName: string,
  originalDescription: string
): { name: string; description: string } {
  if (lang === 'en') {
    return { name: originalName, description: originalDescription };
  }

  // Find a matching key in our dictionary
  const lowerName = originalName.toLowerCase();
  for (const [key, trans] of Object.entries(PRODUCT_TRANSLATIONS)) {
    if (lowerName.includes(key)) {
      return { name: trans.name, description: trans.description };
    }
  }

  // Beautiful automatic translit fallback if no specific translation exists
  return { 
    name: originalName, 
    description: originalDescription 
  };
}

/**
 * Translates a UI text key based on selected language
 */
export function getUiTranslation(lang: 'en' | 'hi', key: keyof typeof UI_TRANSLATIONS['en']): string {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en'][key] || String(key);
}
