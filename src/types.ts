export interface User {
  id: number;
  uid: string;
  email: string;
  fullName: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number | null;
  name: string;
  rating: number;
  comment: string;
  roleOrCity: string | null;
  createdAt: string;
  photo?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  rating: number;
  mrp: number;
  price: number;
  stock: number;
  createdAt: string;
  reviews?: Review[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
  productId?: number;
}

export interface Order {
  id: number;
  userId: number | null;
  totalAmount: number;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  status: string; // 'Pending' | 'Paid' | 'Shipped' | 'Completed' | 'Cancelled'
  paymentMethod: string; // 'COD' | 'Razorpay'
  paymentId: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
