import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { queryOne } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';

/**
 * Generate a JWT token for an admin user.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify a JWT token and return the payload.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Express middleware: require admin authentication.
 * Expects header: Authorization: Bearer <token>
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Authenticate admin credentials against the admin_users table.
 * Returns user object or null.
 */
export async function authenticateAdmin(email, password) {
  const user = await queryOne(
    'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
    [email]
  );
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, email: user.email };
}

/**
 * Hash a password for storage.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
