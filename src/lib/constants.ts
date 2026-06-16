import { Product, Review } from "../types.ts";

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Premium Raw Jumbo Makhana",
    description: "Sourced directly from native Mithila Bihar lotus growers. Pure vegetarian, chemical-free raw super snacks.",
    category: "raw-makhana",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop",
    rating: 4.8,
    mrp: 399,
    price: 299,
    stock: 150,
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    id: 2,
    name: "Classic Slow-Roasted Phool Makhana",
    description: "Super crunchy, slowly roasted under traditional methods. Free of synthetic chemicals, pure gluten-free healthy goodness.",
    category: "flavoured-makhana",
    image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&auto=format&fit=crop",
    rating: 4.7,
    mrp: 199,
    price: 149,
    stock: 120,
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    id: 3,
    name: "Himalayan Pink Salt Phool Makhana",
    description: "Infused with pristine mineral-rich Himalayan pink salt. Deliciously roasted using pure organic cow ghee.",
    category: "flavoured-makhana",
    image: "https://images.unsplash.com/photo-1627932308532-a6868df6d410?w=600&auto=format&fit=crop",
    rating: 4.9,
    mrp: 249,
    price: 179,
    stock: 90,
    createdAt: new Date("2026-06-02").toISOString()
  },
  {
    id: 4,
    name: "Spicy Green Chilli & Masala Makhana",
    description: "A delightful mix of organic spicy green chilies, cumin, and traditional North Indian gourmet spices.",
    category: "flavoured-makhana",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f570?w=600&auto=format&fit=crop",
    rating: 4.6,
    mrp: 259,
    price: 189,
    stock: 85,
    createdAt: new Date("2026-06-02").toISOString()
  },
  {
    id: 5,
    name: "Sweet Jaggery & Saunf Makhana",
    description: "Delectable popped makhana coated in rich traditional sugarcane jaggery and sweet fennel seeds.",
    category: "premium-collection",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop",
    rating: 4.8,
    mrp: 280,
    price: 199,
    stock: 95,
    createdAt: new Date("2026-06-03").toISOString()
  },
  {
    id: 6,
    name: "California Almonds",
    description: "Crunchy, lightly salted premium large California almonds roasted to perfection.",
    category: "health-nutrition",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=600&auto=format&fit=crop",
    rating: 4.9,
    mrp: 499,
    price: 399,
    stock: 75,
    createdAt: new Date("2026-06-03").toISOString()
  },
  {
    id: 7,
    name: "Himalayan Roasted Cashews",
    description: "Mouth-watering whole cashews carefully hand-sorted and dry-roasted for rich buttery taste.",
    category: "health-nutrition",
    image: "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop",
    rating: 4.8,
    mrp: 549,
    price: 449,
    stock: 60,
    createdAt: new Date("2026-06-04").toISOString()
  },
  {
    id: 8,
    name: "Tangy Tomato Crispy Foxnuts",
    description: "Sun-dried field tomatoes blended with light Indian condiments for a sweet and tangy explosion.",
    category: "flavoured-makhana",
    image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&auto=format&fit=crop",
    rating: 4.7,
    mrp: 220,
    price: 169,
    stock: 110,
    createdAt: new Date("2026-06-04").toISOString()
  },
  {
    id: 9,
    name: "Cheese Herbs Makhana",
    description: "A wholesome fusion of premium white cheddar cheese with selected Italian organic oregano and basil herbs.",
    category: "premium-collection",
    image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&auto=format&fit=crop",
    rating: 4.8,
    mrp: 275,
    price: 199,
    stock: 100,
    createdAt: new Date("2026-06-05").toISOString()
  },
  {
    id: 10,
    name: "Makhana Gold Gift Box",
    description: "Unmatched exquisite festival wooden gift casket stuffed containing standard roasted pepper, salted and classic varieties.",
    category: "gift-packs",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop",
    rating: 5.0,
    mrp: 1200,
    price: 899,
    stock: 50,
    createdAt: new Date("2026-06-05").toISOString()
  }
];

export const FALLBACK_TESTIMONIALS: Review[] = [
  {
    id: 101,
    productId: null,
    name: "Sandhya Sharma",
    rating: 5,
    comment: "Aditya Nutra Farm makhana is so fresh and crunchy. The Himalayan Pink Salt flavour is my family's absolute favourite!",
    roleOrCity: "Patna",
    createdAt: new Date("2026-06-10").toISOString()
  },
  {
    id: 102,
    productId: null,
    name: "Vikram Kumar",
    rating: 5,
    comment: "Excellent packaging and high quality superfood directly sourced from Bihar farmers. Loved the Sweet Jaggery taste!",
    roleOrCity: "Muzaffarpur",
    createdAt: new Date("2026-06-11").toISOString()
  },
  {
    id: 103,
    productId: null,
    name: "Amit Raj",
    rating: 5,
    comment: "Very fast delivery, genuine jumbo sized seeds. Totally recommended for guilt-free healthy snacking!",
    roleOrCity: "Darbhanga",
    createdAt: new Date("2026-06-12").toISOString()
  }
];
