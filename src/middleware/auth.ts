import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    uid: string;
    email: string;
    fullName: string | null;
    role: string;
    avatarUrl: string | null;
  };
}

// Log errors with detailed info
export function logError(context: string, error: any) {
  console.error(`[ERROR] [${new Date().toISOString()}] in context "${context}":`, {
    message: error?.message || error,
    stack: error?.stack,
    cause: error?.cause,
  });
}

// JWT verification and database-user synchronization middleware
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'OAuth token does not contain email' });
    }

    // Sync database user via upsert
    let dbUser = await db.query.users.findFirst({
      where: eq(users.uid, uid),
    });

    if (!dbUser) {
      try {
        // Safe registration. The very first user will automatically be an 'admin' for simpler demo administration, others are 'user'
        const existingUsers = await db.select().from(users).limit(1);
        const asignRole = existingUsers.length === 0 ? 'admin' : 'user';

        const result = await db.insert(users)
          .values({
            uid,
            email,
            fullName: name || email.split('@')[0],
            role: asignRole,
            avatarUrl: picture || null,
          } as any)
          .returning();
        dbUser = result[0];
        console.log(`[AUTH] Successfully registered new user: ${email} with role ${asignRole}`);
      } catch (insertError) {
        logError('syncing user into DB on registration', insertError);
        // Fallback fetch in case of concurrency race condition
        dbUser = await db.query.users.findFirst({
          where: eq(users.uid, uid),
        });
        if (!dbUser) {
          throw new Error('Failed to retrieve or create user context.');
        }
      }
    }

    req.user = dbUser;
    next();
  } catch (error) {
    logError('verifyIdToken middleware', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token session' });
  }
};

// Role-based Access Control: require administrator privileges
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  if (req.user.role !== 'admin') {
    console.warn(`[WARN] [${new Date().toISOString()}] Unauthorized admin access attempt by user ${req.user.email} (role: ${req.user.role})`);
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};
