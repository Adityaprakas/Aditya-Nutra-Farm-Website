import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { products, orders, orderItems, users, reviews, newsletters } from "./src/db/schema.ts";
import { eq, like, or, and, desc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, logError, AuthRequest } from "./src/middleware/auth.ts";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json());

  // Auto-seed empty database
  try {
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      console.log("[SEED] No products found in PostgreSQL database. Seeding products...");
      const seedItems = [
        {
          name: "Premium Raw Jumbo Makhana",
          description: "Sourced directly from native Mithila Bihar lotus growers. Pure vegetarian, chemical-free raw super snacks.",
          category: "raw-makhana",
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop",
          rating: 4.8,
          mrp: 399,
          price: 299,
          stock: 150
        },
        {
          name: "Classic Slow-Roasted Phool Makhana",
          description: "Super crunchy, slowly roasted under traditional methods. Free of synthetic chemicals, pure gluten-free healthy goodness.",
          category: "flavoured-makhana",
          image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&auto=format&fit=crop",
          rating: 4.7,
          mrp: 199,
          price: 149,
          stock: 120
        },
        {
          name: "Himalayan Pink Salt Phool Makhana",
          description: "Infused with pristine mineral-rich Himalayan pink salt. Deliciously roasted using pure organic cow ghee.",
          category: "flavoured-makhana",
          image: "https://images.unsplash.com/photo-1627932308532-a6868df6d410?w=600&auto=format&fit=crop",
          rating: 4.9,
          mrp: 249,
          price: 179,
          stock: 90
        },
        {
          name: "Spicy Green Chilli & Masala Makhana",
          description: "A delightful mix of organic spicy green chilies, cumin, and traditional North Indian gourmet spices.",
          category: "flavoured-makhana",
          image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f570?w=600&auto=format&fit=crop",
          rating: 4.6,
          mrp: 259,
          price: 189,
          stock: 85
        },
        {
          name: "Sweet Jaggery & Saunf Makhana",
          description: "Delectable popped makhana coated in rich traditional sugarcane jaggery and sweet fennel seeds.",
          category: "premium-collection",
          image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop",
          rating: 4.8,
          mrp: 280,
          price: 199,
          stock: 95
        },
        {
          name: "California Almonds",
          description: "Crunchy, lightly salted premium large California almonds roasted to perfection.",
          category: "health-nutrition",
          image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=600&auto=format&fit=crop",
          rating: 4.9,
          mrp: 499,
          price: 399,
          stock: 75
        },
        {
          name: "Himalayan Roasted Cashews",
          description: "Mouth-watering whole cashews carefully hand-sorted and dry-roasted for rich buttery taste.",
          category: "health-nutrition",
          image: "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop",
          rating: 4.8,
          mrp: 549,
          price: 449,
          stock: 60
        },
        {
          name: "Tangy Tomato Crispy Foxnuts",
          description: "Sun-dried field tomatoes blended with light Indian condiments for a sweet and tangy explosion.",
          category: "flavoured-makhana",
          image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&auto=format&fit=crop",
          rating: 4.7,
          mrp: 220,
          price: 169,
          stock: 110
        },
        {
          name: "Cheese Herbs Makhana",
          description: "A wholesome fusion of premium white cheddar cheese with selected Italian organic oregano and basil herbs.",
          category: "premium-collection",
          image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&auto=format&fit=crop",
          rating: 4.8,
          mrp: 275,
          price: 199,
          stock: 100
        },
        {
          name: "Makhana Gold Gift Box",
          description: "Unmatched exquisite festival wooden gift casket stuffed containing standard roasted pepper, salted and classic varieties.",
          category: "gift-packs",
          image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop",
          rating: 5.0,
          mrp: 1200,
          price: 899,
          stock: 50
        }
      ];

      for (const item of seedItems) {
        await db.insert(products).values(item);
      }
      console.log("[SEED] Successfully seeded products into database.");
    }
  } catch (err: any) {
    console.warn("[SEED] Skipping auto-seed:", err.message || err);
  }

  // 0. AUTHENTICATED API - Get My Profile Sync
  app.get("/api/users/me", requireAuth, (req: AuthRequest, res) => {
    try {
      res.json(req.user);
    } catch (err) {
      logError("GET /api/users/me", err);
      res.status(500).json({ error: "Failed to load user profile" });
    }
  });

  // 1. PUBLIC API - Products List & Search/Filter
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;

      let conditions: any[] = [];

      if (category && category !== "all") {
        conditions.push(eq(products.category, category as string));
      }

      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.description, `%${search}%`)
          )
        );
      }

      let queryResults;
      if (conditions.length > 0) {
        queryResults = await db
          .select()
          .from(products)
          .where(and(...conditions))
          .orderBy(desc(products.id));
      } else {
        queryResults = await db
          .select()
          .from(products)
          .orderBy(desc(products.id));
      }

      res.json(queryResults);
    } catch (err) {
      logError("GET /api/products", err);
      res.status(500).json({ error: "Failed to retrieve products. Please try again." });
    }
  });

  // 2. PUBLIC API - Single Product Details
  app.get("/api/products/:id", async (req, res) => {
    try {
      const prodId = parseInt(req.params.id);
      if (isNaN(prodId)) {
        return res.status(400).json({ error: "Invalid product identifier" });
      }

      const prod = await db.query.products.findFirst({
        where: eq(products.id, prodId),
      });

      if (!prod) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Read related reviews
      const prodReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, prodId))
        .orderBy(desc(reviews.createdAt));

      res.json({ ...prod, reviews: prodReviews });
    } catch (err) {
      logError("GET /api/products/:id", err);
      res.status(500).json({ error: "Failed to fetch product details" });
    }
  });

  // 3. PUBLIC API - Testimonials / Standalone Reviews
  app.get("/api/testimonials", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(reviews)
        .orderBy(desc(reviews.createdAt));
      res.json(result);
    } catch (err) {
      logError("GET /api/testimonials", err);
      res.status(500).json({ error: "Failed to load testimonials" });
    }
  });

  // 4. AUTHENTICATED API - Add product review
  app.post("/api/products/:id/reviews", requireAuth, async (req: AuthRequest, res) => {
    try {
      const prodId = parseInt(req.params.id);
      const { rating, comment, photo } = req.body;

      if (isNaN(prodId) || !rating || !comment) {
        return res.status(400).json({ error: "Rating and comment are required." });
      }

      const parsedRating = parseInt(rating);
      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
      }

      const profile = req.user!;
      
      const newReview = await db
        .insert(reviews)
        .values({
          productId: prodId,
          name: profile.fullName || "Verified Buyer",
          rating: parsedRating,
          comment,
          roleOrCity: "Verified Buyer",
          photo: photo || null,
        } as any)
        .returning();

      // Dynamically recalculate product average rating
      const allProdReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.productId, prodId));

      if (allProdReviews.length > 0) {
        const totalRating = allProdReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((totalRating / allProdReviews.length).toFixed(1));
        await db
          .update(products)
          .set({ rating: avgRating } as any)
          .where(eq(products.id, prodId));
      }

      res.status(201).json(newReview[0]);
    } catch (err) {
      logError("POST /api/products/:id/reviews", err);
      res.status(500).json({ error: "Failed to post review. Please try again." });
    }
  });

  // 5. AUTHENTICATED API - Checkout Create Order
  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { 
        items, // array of { productId, quantity }
        fullName, 
        address, 
        city, 
        state, 
        zipCode, 
        phone, 
        paymentMethod,
        discount
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Your shopping bag is empty." });
      }

      if (!fullName || !address || !city || !zipCode || !phone) {
        return res.status(400).json({ error: "All billing and shipping fields are required." });
      }

      const profile = req.user!;
      
      // Calculate totals and verify stocks in a transaction-like way
      let calculatedTotal = 0;
      const orderItemsToInsert: { productId: number; quantity: number; price: number }[] = [];

      for (const item of items) {
        const foundProd = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });

        if (!foundProd) {
          return res.status(404).json({ error: `Product with ID ${item.productId} was not found.` });
        }

        if (foundProd.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Inadequate stock for ${foundProd.name}. Available stock: ${foundProd.stock}` 
          });
        }

        const itemTotal = foundProd.price * item.quantity;
        calculatedTotal += itemTotal;

        orderItemsToInsert.push({
          productId: foundProd.id,
          quantity: item.quantity,
          price: foundProd.price,
        });
      }

      let finalTotal = calculatedTotal;
      if (discount && !isNaN(parseFloat(discount))) {
        finalTotal = Math.max(0, calculatedTotal - parseFloat(discount));
      }

      // Mock interactive checkout gateways
      let generatedPaymentId = null;
      let orderStatus = "Pending";

      if (paymentMethod === "Razorpay") {
        // Mock Razorpay Order / Payment response ID
        generatedPaymentId = `pay_razor_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        orderStatus = "Paid"; // Marked paid on successful payment
      }

      // Insert Order
      const newOrderResult = await db
        .insert(orders)
        .values({
          userId: profile.id,
          totalAmount: finalTotal,
          fullName,
          address,
          city,
          state: state || "Bihar",
          zipCode,
          phone,
          email: profile.email,
          status: orderStatus,
          paymentMethod,
          paymentId: generatedPaymentId,
          trackingNumber: `ANT-${Math.floor(100000 + Math.random() * 900000)}`, // Auto generate tracking
        } as any)
        .returning();

      const createdOrder = newOrderResult[0];

      // Insert Order Items and decrement stock
      for (const orderItem of orderItemsToInsert) {
        await db.insert(orderItems).values({
          orderId: createdOrder.id,
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          price: orderItem.price,
        });

        // Decrement inventory stock
        await db
          .update(products)
          .set({ 
            stock: sql`stock - ${orderItem.quantity}` 
          } as any)
          .where(eq(products.id, orderItem.productId));
      }

      console.log(`[ORDER] Created successfully: Order #${createdOrder.id} for ${profile.email}`);
      res.status(201).json(createdOrder);
    } catch (err) {
      logError("POST /api/orders", err);
      res.status(500).json({ error: "An error occurred during checkout processing." });
    }
  });

  // 6. AUTHENTICATED API - Get My Orders
  app.get("/api/orders/my", requireAuth, async (req: AuthRequest, res) => {
    try {
      const profile = req.user!;
      
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, profile.id))
        .orderBy(desc(orders.id));

      // Append items details in memory to avoid huge nested relational queries in raw SQL
      const fullOrdersList = [];
      for (const order of userOrders) {
        const itemsList = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            productName: products.name,
            productImage: products.image,
            productId: orderItems.productId,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        fullOrdersList.push({
          ...order,
          items: itemsList,
        });
      }

      res.json(fullOrdersList);
    } catch (err) {
      logError("GET /api/orders/my", err);
      res.status(500).json({ error: "Failed to retrieve order history" });
    }
  });

  // 6.5 AUTHENTICATED API - Cancel Order within 24 hours
  app.post("/api/orders/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
    try {
      const profile = req.user!;
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid Order reference" });
      }

      // Locate the order and check that it belongs to this customer
      const orderRecord = await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.userId, profile.id)),
      });

      if (!orderRecord) {
        return res.status(404).json({ error: "Order details not found" });
      }

      // Check if 24 hours have elapsed
      const orderCreatedDate = new Date(orderRecord.createdAt);
      const differenceMs = Date.now() - orderCreatedDate.getTime();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      if (differenceMs > twentyFourHoursMs) {
        return res.status(400).json({ error: "Orders can only be cancelled within 24 hours of creation." });
      }

      // Check current status
      if (orderRecord.status === "Cancelled") {
        return res.status(400).json({ error: "This order is already cancelled." });
      }

      if (orderRecord.status === "Shipped" || orderRecord.status === "Completed") {
        return res.status(400).json({ error: "Shipped or Completed orders cannot be cancelled." });
      }

      // Perform cancellation
      const updatedList = await db
        .update(orders)
        .set({
          status: "Cancelled",
        } as any)
        .where(eq(orders.id, orderId))
        .returning();

      console.log(`[ORDER] Cancelled successfully: Order #${orderId} by user ${profile.email}`);
      res.json({ message: "Order cancelled successfully.", order: updatedList[0] });
    } catch (err) {
      logError("POST /api/orders/:id/cancel", err);
      res.status(500).json({ error: "Failed to process cancellation request." });
    }
  });

  // 7. PUBLIC API - Track Specific Order
  app.get("/api/orders/track/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid Order Reference ID" });
      }

      const orderData = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!orderData) {
        return res.status(404).json({ error: "No order record found with this ID" });
      }

      const itemsList = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
          productImage: products.image,
          productId: orderItems.productId,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, orderId));

      res.json({
        ...orderData,
        items: itemsList
      });
    } catch (err) {
      logError("GET /api/orders/track/:id", err);
      res.status(500).json({ error: "Failed to locate tracking details" });
    }
  });

  // ============================================
  // ADMIN DASHBOARD SECTION (RBAC PROTECTED)
  // ============================================

  // Admin Check context
  app.get("/api/admin/check", requireAuth, requireAdmin, (req: AuthRequest, res) => {
    res.json({ isAdmin: true, user: req.user });
  });

  // 1. ADMIN: Add Product
  app.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, description, category, image, mrp, price, stock } = req.body;

      if (!name || !description || !category || !image || isNaN(parseFloat(mrp)) || isNaN(parseFloat(price))) {
        return res.status(400).json({ error: "Missing or invalid product detail fields." });
      }

      const result = await db
        .insert(products)
        .values({
          name,
          description,
          category,
          image,
          rating: 4.5,
          mrp: parseFloat(mrp),
          price: parseFloat(price),
          stock: isNaN(parseInt(stock)) ? 100 : parseInt(stock),
        } as any)
        .returning();

      console.log(`[ADMIN] Added new product: ${name}`);
      res.status(201).json(result[0]);
    } catch (err) {
      logError("POST /api/admin/products", err);
      res.status(500).json({ error: "Database error adding product." });
    }
  });

  // 2. ADMIN: Edit Product
  app.put("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const prodId = parseInt(req.params.id);
      if (isNaN(prodId)) {
        return res.status(400).json({ error: "Invalid product identifier" });
      }

      const { name, description, category, image, mrp, price, stock } = req.body;

      const updated = await db
        .update(products)
        .set({
          name,
          description,
          category,
          image,
          mrp: mrp ? parseFloat(mrp) : undefined,
          price: price ? parseFloat(price) : undefined,
          stock: stock ? parseInt(stock) : undefined,
        } as any)
        .where(eq(products.id, prodId))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Product not found to update" });
      }

      console.log(`[ADMIN] Updated product ID: ${prodId}`);
      res.json(updated[0]);
    } catch (err) {
      logError("PUT /api/admin/products/:id", err);
      res.status(500).json({ error: "Failed to update product details." });
    }
  });

  // 3. ADMIN: Delete Product
  app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const prodId = parseInt(req.params.id);
      if (isNaN(prodId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const deleted = await db
        .delete(products)
        .where(eq(products.id, prodId))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Product not found to delete" });
      }

      console.log(`[ADMIN] Deleted product ID: ${prodId}`);
      res.json({ success: true, message: `Product "${deleted[0].name}" was deleted successfully.` });
    } catch (err) {
      logError("DELETE /api/admin/products/:id", err);
      res.status(500).json({ error: "Failed to delete product database record." });
    }
  });

  // 4. ADMIN: Get All Orders
  app.get("/api/admin/orders", requireAuth, requireAdmin, async (req, res) => {
    try {
      const allOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.id));

      const ordersWithItems = [];
      for (const order of allOrders) {
        const itemsList = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            productName: products.name,
            productImage: products.image,
            productId: orderItems.productId,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        ordersWithItems.push({
          ...order,
          items: itemsList,
        });
      }

      res.json(ordersWithItems);
    } catch (err) {
      logError("GET /api/admin/orders", err);
      res.status(500).json({ error: "Failed to load orders history" });
    }
  });

  // 5. ADMIN: Manage/Update Order Status
  app.put("/api/admin/orders/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid Order reference" });
      }

      const { status, trackingNumber } = req.body;

      const updated = await db
        .update(orders)
        .set({
          status,
          trackingNumber,
        } as any)
        .where(eq(orders.id, orderId))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Order details was not found to update" });
      }

      console.log(`[ADMIN] Updated Order ID: ${orderId} status to: ${status}`);
      res.json(updated[0]);
    } catch (err) {
      logError("PUT /api/admin/orders/:id", err);
      res.status(500).json({ error: "Failed to update order status." });
    }
  });

  // ADMIN: Delete/Cancel Order Record
  app.delete("/api/admin/orders/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid Order reference ID" });
      }

      // Pre-emptively delete corresponding order items to maintain FK integrity
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId));

      const deleted = await db
        .delete(orders)
        .where(eq(orders.id, orderId))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Order record not found" });
      }

      console.log(`[ADMIN] Deleted Order ID: ${orderId}`);
      res.json({ success: true, message: "Order and related items deleted successfully." });
    } catch (err) {
      logError("DELETE /api/admin/orders/:id", err);
      res.status(500).json({ error: "Failed to delete order record." });
    }
  });

  // 6. ADMIN: List Customers
  app.get("/api/admin/customers", requireAuth, requireAdmin, async (req, res) => {
    try {
      const customers = await db
        .select()
        .from(users)
        .orderBy(desc(users.id));
      res.json(customers);
    } catch (err) {
      logError("GET /api/admin/customers", err);
      res.status(500).json({ error: "Failed to load customer directory." });
    }
  });

  // 7. ADMIN: Sales and Performance reports
  app.get("/api/admin/reports", requireAuth, requireAdmin, async (req, res) => {
    try {
      // 1. Total aggregate sales
      const totalRevenueRes = await db
        .select({ total: sql<number>`SUM(total_amount)` })
        .from(orders)
        .where(or(eq(orders.status, "Paid"), eq(orders.status, "Completed")));
      const totalRevenue = totalRevenueRes[0]?.total || 0;

      // 2. Count of total orders
      const totalOrdersCountRes = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders);
      const totalOrders = totalOrdersCountRes[0]?.count || 0;

      // 3. Customer accounts count
      const customerCountRes = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users);
      const guestUsers = customerCountRes[0]?.count || 0;

      // 4. Counts by category
      const productCountsByCategory = await db
        .select({
          category: products.category,
          count: sql<number>`COUNT(*)`
        })
        .from(products)
        .groupBy(products.category);

      // 5. Total Products Types
      const totalProductsCountRes = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products);
      const productVarieties = totalProductsCountRes[0]?.count || 0;

      res.json({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        registeredUsers: guestUsers,
        productVarieties,
        categoryBreakdown: productCountsByCategory
      });
    } catch (err) {
      logError("GET /api/admin/reports", err);
      res.status(500).json({ error: "Failed to aggregate sales telemetry report." });
    }
  });

  // 8. PUBLIC API - Newsletter Signup
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }

      const emailTrimmed = email.trim().toLowerCase();

      // Check if already exists
      const existing = await db.query.newsletters.findFirst({
        where: eq(newsletters.email, emailTrimmed),
      });

      if (existing) {
        return res.status(409).json({ error: "This email address is already subscribed to our list!" });
      }

      const inserted = await db
        .insert(newsletters)
        .values({
          email: emailTrimmed,
        } as any)
        .returning();

      return res.status(201).json({ success: true, subscriber: inserted[0] });
    } catch (err) {
      logError("POST /api/newsletter", err);
      res.status(500).json({ error: "Failed to subscribe. Please try again." });
    }
  });

  // 9. PUBLIC API - AI Chatbot assistant with Gemini
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      // Fetch active catalog from PostgreSQL database details
      const dbProducts = await db.select().from(products).orderBy(desc(products.id));
      
      const productLines = dbProducts.map(p => 
        `ID: ${p.id} | Name: ${p.name} | Description: ${p.description} | Price: ₹${p.price} | MRP: ₹${p.mrp} | Category: ${p.category}`
      ).join("\n");

      const systemInstruction = `You are 'Adi', the warm, helpful, and polite AI Sourcing & Taste Assistant for 'Aditya Nutra Farm', located in Bihar, India.

Your absolute number-one directive is to help customers answer questions about our brand and suggest matching Phool Makhana (Lotus Seeds) and health-gourmet snacking options from our current catalog.

Our Active Catalog:
${productLines}

CRITICAL RULES FOR RESPONSE:
1. Speak naturally, elegantly, and in the language of the user's message (Hindi, English, or Hinglish - e.g. 'namaste, main Adi hoon').
2. When answering, if a customer describes their taste preference (e.g. they want something spicy, sweet, plain, ghee-roasted, low salt, or high-end gift packs), suggest one or more specific products that fit perfectly.
3. FOR EVERY product ID you recommend, you MUST append \`[RECOMMEND: id]\` (replacing "id" with the digital ID number, e.g., \`[RECOMMEND: 3]\`) within your text response. This will dynamically generate beautiful, clickable buttons for the customer to open and view that specific product directly.
4. If you mention 'Classic Phool Makhana', append \`[RECOMMEND: 2]\` next to it. If you recommend 'Cheese Herbs Makhana', append \`[RECOMMEND: 9]\` or whichever of the real product IDs matches the catalog above.
5. Keep answers highly friendly, humble, readable, and concise. Avoid technical container port or infrastructure jargon. Keep it natural!`;

      // Convert messages to Gemini API content format
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }]
      }));

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY secret is not declared in the App environment secrets. Please navigate to Settings > Secrets." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const rawQuery = (messages[messages.length - 1]?.content || "").toLowerCase();
      const isHindi = /[\u0900-\u097F]/.test(rawQuery) || rawQuery.includes("namaste") || rawQuery.includes("aadi") || rawQuery.includes("hoon") || rawQuery.includes("hai") || rawQuery.includes("bata");

      // Quick rules-based local heuristic resolver
      const resolveLocalHeuristicMatch = (q: string, isHi: boolean, onlyDirectMatches: boolean = false): string | null => {
        const queryClean = q.trim();
        
        // Skip direct matches for very short messages to let Gemini handle friendly greetings
        if (onlyDirectMatches && (queryClean.length < 3 || ["hi", "hello", "hola", "hey", "namaste", "hey adi", "hello adi"].includes(queryClean))) {
          return null;
        }

        if (isHi) {
          if (queryClean.includes("delivery") || queryClean.includes("ship") || queryClean.includes("time") || queryClean.includes("deliv") || queryClean.includes("भेजने") || queryClean.includes("डिलिवरी") || queryClean.includes("ऑर्डर") || queryClean.includes("कब") || queryClean.includes("पहुंचेगा")) {
            return "🚚 **डिलिवरी की जानकारी:**\n- हम पूरे भारत में 3 से 5 दिनों के भीतर डिलीवरी सुनिश्चित करते हैं।\n- बिहार और नजदीकी राज्यों में डिलीवरी केवल 2-3 दिनों में हो जाती है!\n- ₹499 से अधिक के सभी ऑर्डर्स पर **मुफ़्त डिलीवरी (Free Shipping)** उपलब्ध है।";
          }
          if (queryClean.includes("health") || queryClean.includes("benefit") || queryClean.includes("diet") || queryClean.includes("nutrition") || queryClean.includes("फायदे") || queryClean.includes("सेहत") || queryClean.includes("प्रोटीन") || queryClean.includes("वजन") || queryClean.includes("कैलोरी") || queryClean.includes("फायदा")) {
            return "🌱 **मखाना के सेहतमंद फायदे:**\n- **हैवी प्रोटीन & फाइबर:** यह आपकी मांसपेशियों को मजबूत और पाचन को दुरुस्त रखता है।\n- **लो ग्लाइसेमिक इंडेक्स:** शुगर (Diabetes) के मरीजों के लिए सर्वोत्तम स्नैक।\n- **एंटी-ऑक्सीडेंट:** हृदय और बढ़ती उम्र की सेहत के लिए उत्तम।\n- हमारे **प्रीमियम कच्चा जंबो मखाना** [RECOMMEND: 1] या बिना तेल का **क्लासिक रोस्टेड मखाना** [RECOMMEND: 2] खाएं।";
          }
          if (queryClean.includes("cod") || queryClean.includes("cash") || queryClean.includes("pay") || queryClean.includes("money") || queryClean.includes("कैश") || queryClean.includes("भुगतान") || queryClean.includes("पैसा") || queryClean.includes("ऑनलाइन")) {
            return "💳 **भुगतान विकल्प (Payment Methods):**\n- हम **Cash on Delivery (COD)** और सुरक्षित ऑनलाइन भुगतान (UPI, कार्ड, नेटबैंकिंग) दोनों स्वीकार करते हैं।\n- आप चेकआउट पेज पर जाकर अपना पसंदीदा विकल्प चुन सकते हैं!";
          }
          if (queryClean.includes("about") || queryClean.includes("farm") || queryClean.includes("where") || queryClean.includes("location") || queryClean.includes("bihar") || queryClean.includes("बिहार") || queryClean.includes("कहाँ") || queryClean.includes("पता") || queryClean.includes("contact") || queryClean.includes("फ़ोन") || queryClean.includes("सम्पर्क") || queryClean.includes("नंबर") || queryClean.includes("किसान")) {
            return "🌾 **आदित्य न्युट्रा फार्म के बारे में:**\n- हमारे खेत और प्रोसेसिंग यूनिट मुख्य रूप से मिथिला, बिहार में स्थित हैं, जो बेहतरीन मखाने की मातृभूमि है।\n- हम सीधे स्थानीय किसानों से बिना किसी केमिकल के शुद्ध मखाना प्रोक्योर करते हैं।\n- हमसे संपर्क करने के लिए आप व्हाट्सएप हेल्पलाइन (व्हाट्सएप बटन पर क्लिक करके) का उपयोग कर सकते हैं!";
          }
          if (queryClean.includes("return") || queryClean.includes("refund") || queryClean.includes("cancel") || queryClean.includes("वापस") || queryClean.includes("रद्द") || queryClean.includes("रिफंड")) {
            return "🔄 **रिटर्न और रिफंड नीति:**\n- हम ग्राहकों की संतुष्टि के लिए प्रतिबद्ध हैं। यदि उत्पाद क्षतिग्रस्त या गुणवत्ता से समझौता किया हुआ मिलता है, तो हम **7 दिनों की आसान रिटर्न/रिफंड** नीति प्रदान करते हैं।\n- आप अपने ऑर्डर सेक्शन से या हमारे व्हाट्सएप नंबर पर संपर्क करके मदद पा सकते हैं!";
          }
          if (queryClean.includes("buy") || queryClean.includes("order") || queryClean.includes("checkout") || queryClean.includes("कैसे खरीदें") || queryClean.includes("खरीदना") || queryClean.includes("ऑर्डर कैसे")) {
            return "🛍️ **ऑर्डर कैसे करें:**\n1. हमारी वेबसाइट पर किसी भी मखाने पर क्लिक करें।\n2. 'Cart में जोड़ें' (Add to Bag) दबाएं।\n3. ऊपर दाईं ओर बैग पर क्लिक करके 'Checkout' पर जाएं और अपना पता दर्ज करें। बेहद आसान!";
          }
          if (queryClean.includes("spicy") || queryClean.includes("mirch") || queryClean.includes("masala") || queryClean.includes("तीखा") || queryClean.includes("मसाला") || queryClean.includes("चटपटा") || queryClean.includes("स्पाइसी")) {
            return "हमारे पास बहुत ही स्वादिष्ट **तीखा हरी मिर्च और मसाला मखाना** है! यह कुरकुरा और मसालेदार स्वाद का बेहतरीन मिश्रण है।\n\nआप इस उत्पाद को यहां देख सकते हैं: [RECOMMEND: 4]";
          }
          if (queryClean.includes("sweet") || queryClean.includes("gud") || queryClean.includes("jaggery") || queryClean.includes("मीठा") || queryClean.includes("गुड़") || queryClean.includes("गुड")) {
            return "जी हाँ! हमारी विशेषता है **मीठा गुड़ और सौंफ मखाना** जो पारंपरिक गुड़ की मिठास और सौंफ की खुशबू के साथ भुना गया है।\n\nखरीदने या विवरण देखने के लिए नीचे क्लिक करें: [RECOMMEND: 5]";
          }
          if (queryClean.includes("raw") || queryClean.includes("sada") || queryClean.includes("plain") || queryClean.includes("सादा") || queryClean.includes("बिना") || queryClean.includes("बिहार") || queryClean.includes("कच्चा")) {
            return "हम सीधा बिहार के तालाबों से मखाना किसानों द्वारा उगाया गया **प्रीमियम कच्चा जंबो मखाना** उपलब्ध कराते हैं। यह 100% प्राकृतिक और बिना पॉलिश का है।\n\nविवरण यहाँ देखें: [RECOMMEND: 1]";
          }
          if (queryClean.includes("salt") || queryClean.includes("salted") || queryClean.includes("नमक") || queryClean.includes("नमकीन") || queryClean.includes("ghee") || queryClean.includes("घी") || queryClean.includes("पिंक")) {
            return "हमारा **हिमालयन पिंक साल्ट मखाना** शुद्ध गाय के घी में धीरे-धीरे भुना हुआ है और खनिज-समृद्ध गुलाबी नमक से युक्त है। स्वस्थ स्नैकिंग के लिए उत्तम!\n\nयहाँ देखें: [RECOMMEND: 3]";
          }
          if (queryClean.includes("cheese") || queryClean.includes("herbs") || queryClean.includes("चीज़") || queryClean.includes("चीस")) {
            return "हमारे पास बच्चों और युवाओं का पसंदीदा **चीज़ हर्ब्स मखाना** है, जिसमें प्रीमियम चेद्दार चीज़ और प्राकृतिक इटैलियन हर्ब्स का स्वाद है।\n\nयहाँ क्लिक करें: [RECOMMEND: 9]";
          }
          if (queryClean.includes("gift") || queryClean.includes("box") || queryClean.includes("combo") || queryClean.includes("गिफ्ट") || queryClean.includes("बॉक्स") || queryClean.includes("कोम्बो")) {
            return "विशेष अवसरों और उत्सवों के लिए हमारा **मखाना गोल्ड गिफ्ट बॉक्स** सबसे बेहतरीन विकल्प है! इसमें सभी पसंदीदा भुने हुए स्वादों का प्रीमियम कॉम्बो है।\n\nयहाँ विवरण देखें: [RECOMMEND: 10]";
          }
          if (queryClean.includes("almond") || queryClean.includes("badam") || queryClean.includes("बादाम") || queryClean.includes("cashew") || queryClean.includes("kaju") || queryClean.includes("काजू") || queryClean.includes("dry")) {
            return "हमारी हेल्थ रेंज में आप **कैलिफ़ोर्निया बादाम** [RECOMMEND: 6] या भुने हुए **ऑर्गेनिक काजू** [RECOMMEND: 7] देख सकते हैं। ये दोनों सेहतमंद और कुरकुरे हैं!";
          }
          if (onlyDirectMatches) return null;
          return "नमस्ते! मैं 'आदि' हूँ, आपका मखाना एक्सपर्ट। बिहार से सीधे आपके लिए हेल्दी मखाना! हमारे कुछ मुख्य पसंदीदा उत्पाद नीचे दिए गए हैं:\n\n1. **प्रीमियम कच्चा जंबो मखाना** (Mithila Spec) - [RECOMMEND: 1]\n2. **क्लासिक भुना हुआ सादा मखाना** - [RECOMMEND: 2]\n3. **तीखा हरी मिर्च और मसाला मखाना** - [RECOMMEND: 4]\n\nअधिक जानकारी के लिए कृपया कोई भी प्रश्न पूछें या ऊपर दिए गए उत्पादों पर क्लिक करें!";
        } else {
          if (queryClean.includes("delivery") || queryClean.includes("ship") || queryClean.includes("time") || queryClean.includes("deliv") || queryClean.includes("track") || queryClean.includes("courier")) {
            return "🚚 **Shipping & Delivery Information:**\n- We dispatch orders directly from Bihar within 24 hours.\n- Under normal conditions, transit takes **3 to 5 business days** across India.\n- **Free shipping** is applied automatically to all orders above ₹499!";
          }
          if (queryClean.includes("health") || queryClean.includes("benefit") || queryClean.includes("diet") || queryClean.includes("nutrition") || queryClean.includes("glical") || queryClean.includes("protein") || queryClean.includes("weight") || queryClean.includes("calorie") || queryClean.includes("advantage")) {
            return "🌱 **Health & Nutritional Value of Makhana:**\n- **Super Protein & Fibre Rich:** Strengthens muscle development and acts as a satisfying, non-fattening snack.\n- **Low Glycemic Index:** Certified choice for diabetics to maintain steady insulin levels.\n- Try our zero-oil **Classic Slow-Roasted Phool Makhana** [RECOMMEND: 2] or **Premium Raw Jumbo Makhana** [RECOMMEND: 1].";
          }
          if (queryClean.includes("cod") || queryClean.includes("cash") || queryClean.includes("pay") || queryClean.includes("money") || queryClean.includes("payment") || queryClean.includes("upi") || queryClean.includes("online")) {
            return "💳 **Secure Payment Methods:**\n- We support multiple secure payment gateways (Cards, Net Banking, UPI) as well as **Cash on Delivery (COD)**.\n- Choose your comfortable checkout system directly in the Cart drawer!";
          }
          if (queryClean.includes("about") || queryClean.includes("farm") || queryClean.includes("where") || queryClean.includes("location") || queryClean.includes("bihar") || queryClean.includes("origin") || queryClean.includes("contact") || queryClean.includes("phone")) {
            return "🌾 **Origin & Mission of Aditya Nutra Farm:**\n- We are located in Mithila, Bihar, the heartland of lotus seed cultivation.\n- Our mission is direct-to-consumer delivery to support local crop farmers in Bihar while maintaining elite organic purity standards.\n- Have customized bulk queries? Contact our helpline via WhatsApp!";
          }
          if (queryClean.includes("return") || queryClean.includes("refund") || queryClean.includes("cancel") || queryClean.includes("guarantee")) {
            return "🔄 **Easy Returns & Cancellations:**\n- We strive for culinary perfection. If there's any defect or damage, we offer an easy **7-day return and instant cashback refund guarantee**.\n- Reach out to us from the Order history or send a quick WhatsApp note!";
          }
          if (queryClean.includes("buy") || queryClean.includes("order") || queryClean.includes("checkout") || queryClean.includes("purchase")) {
            return "🛍️ **How to Buy Online:**\n1. Pick your preferred items on active display.\n2. Click 'Add to Bag'.\n3. Click the Shopping Bag icon in the top right header, and hit Checkout to securely complete your order!";
          }
          if (queryClean.includes("spicy") || queryClean.includes("mirch") || queryClean.includes("masala") || queryClean.includes("chilli")) {
            return "We have our absolute customer hit: **Spicy Green Chilli & Masala Makhana**! It offers a perfect tangy & hot premium North Indian flavor.\n\nTake a look here: [RECOMMEND: 4]";
          }
          if (queryClean.includes("sweet") || queryClean.includes("gud") || queryClean.includes("jaggery")) {
            return "Yes, we proudly serve **Sweet Jaggery & Saunf Makhana**. It is coated in wholesome sugarcane jaggery and sweet aromatic fennel seeds.\n\nCheck details here: [RECOMMEND: 5]";
          }
          if (queryClean.includes("raw") || queryClean.includes("sada") || queryClean.includes("plain") || queryClean.includes("bihar") || queryClean.includes("pool")) {
            return "We offer 100% pesticide-free, size-graded **Premium Raw Jumbo Makhana** sourced directly from native farmers in Mithila, Bihar.\n\nLearn more here: [RECOMMEND: 1]";
          }
          if (queryClean.includes("salt") || queryClean.includes("salted") || queryClean.includes("ghee") || queryClean.includes("pink")) {
            return "You will love our **Himalayan Pink Salt Phool Makhana**, slow-roasted in pure domestic Organic Cow Ghee and seasoned with rich mineral pink salt.\n\nCheck it out here: [RECOMMEND: 3]";
          }
          if (queryClean.includes("cheese") || queryClean.includes("herbs") || queryClean.includes("cheddar")) {
            return "Try our highly rated **Cheese Herbs Makhana**, blended with premium white cheddar and exquisite Italian oregano and basil.\n\nClick to view: [RECOMMEND: 9]";
          }
          if (queryClean.includes("gift") || queryClean.includes("box") || queryClean.includes("combo")) {
            return "Our premium hand-crafted festival **Makhana Gold Gift Box** is ideal for corporate and household gifting, containing a classic range of roasted flavors.\n\nView here: [RECOMMEND: 10]";
          }
          if (queryClean.includes("almond") || queryClean.includes("badam") || queryClean.includes("cashew") || queryClean.includes("kaju") || queryClean.includes("dry")) {
            return "Check out our dynamic dry fruit snacks: **California Almonds** [RECOMMEND: 6] or our **Himalayan Roasted Cashews** [RECOMMEND: 7]!";
          }
          if (onlyDirectMatches) return null;
          return "Hi, I am 'Adi', your AI Nutrition & Sourcing Expert. We supply pure, direct-from-Bihar healthy superfoods. Here are some of our trending suggestions:\n\n- **Premium Raw Jumbo Makhana** (Natural Sourcing) - [RECOMMEND: 1]\n- **Classic Slow-Roasted Phool Makhana** (No Oil Snack) - [RECOMMEND: 2]\n- **Spicy Green Chilli & Masala Makhana** (Indian Spiciness) - [RECOMMEND: 4]\n\nFeel free to ask about health benefits, shipping time, COD, returns, or click above items to explore!";
        }
      };

      // 1. Direct Keyword Short-Circuit: Response in <50ms for basic query keywords!
      const directMatch = resolveLocalHeuristicMatch(rawQuery, isHindi, true);
      if (directMatch) {
         console.log(`[CHAT] Bypassing remote AI and returning instant local match for "${rawQuery}"`);
         return res.json({ reply: directMatch });
      }

      // Promise Helper to execute with a configuration timeout (e.g. 4.2 seconds to satisfy "<5sec" while allowing Gemini to complete)
      const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error("TIMEOUT_BURST"));
          }, timeoutMs);
          
          promise
            .then((res) => {
              clearTimeout(timer);
              resolve(res);
            })
            .catch((err) => {
              clearTimeout(timer);
              reject(err);
            });
        });
      };

      let replyText = "";
      try {
        console.log(`[CHAT] Query: "${rawQuery}". Attempting remote gemini-3.5-flash with a generous 4.2-second limit.`);
        
        const apiPromise = ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          }
        });

        const response = await withTimeout(apiPromise, 4200);
        replyText = response.text || "";
      } catch (firstErr: any) {
        console.warn(`[CHAT] Remote Gemini-3.5-flash timed out or threw error: ${firstErr.message || firstErr}. Delivering immediate intelligent local heuristics response.`);
        // Immediately fallback to our local resolver response
        replyText = resolveLocalHeuristicMatch(rawQuery, isHindi, false) || "";
      }

      const replyTextFinal = replyText || resolveLocalHeuristicMatch(rawQuery, isHindi, false) || "I am here to help you choose the best Makhana! Please ask about flavors, prices, shipping, or COD.";
      res.json({ reply: replyTextFinal });

    } catch (err: any) {
      logError("POST /api/gemini/chat", err);
      res.json({ reply: "I am experiencing heavy traffic but our fresh gourmet batch is ready! Check above products directly or chat on WhatsApp! 🙏" });
    }
  });


  // ============================================
  // FRONTEND SERVER / VITE MIDDLEWARE
  // ============================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[SERVER] Dev-mode: Loaded Vite middleware.");
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[SERVER] Production-mode: Serving static build folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYSTEM] Aditya Nutra Farm backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
