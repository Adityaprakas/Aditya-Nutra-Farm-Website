import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').default('user').notNull(), // 'user' or 'admin'
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'raw', 'roasted', 'flavored', 'cashews', 'almonds'
  image: text('image').notNull(), // Image path/URL
  rating: real('rating').default(4.5).notNull(),
  mrp: real('mrp').notNull(), // Max Retail Price in Rupees
  price: real('price').notNull(), // Discount/Selling Price in Rupees
  stock: integer('stock').default(100).notNull(), // Inventory quantity
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  totalAmount: real('total_amount').notNull(),
  fullName: text('full_name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').default('Bihar').notNull(),
  zipCode: text('zip_code').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  status: text('status').default('Pending').notNull(), // 'Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled'
  paymentMethod: text('payment_method').default('COD').notNull(), // 'COD' or 'Razorpay'
  paymentId: text('payment_id'), // Razorpay ID if paid
  trackingNumber: text('tracking_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Order Items Table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(), // Price at which it was bought
});

// 5. Reviews/Testimonials Table (Can be linked to products or general)
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  roleOrCity: text('role_or_city'), // E.g., 'Patna, Bihar' or 'verified buyer'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  photo: text('photo'), // Attached photo URL or base64 data
});

// 6. Newsletters Schema for signup registration
export const newsletters = pgTable('newsletters', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));
