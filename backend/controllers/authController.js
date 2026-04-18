import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or faculty.' });
    }

    // Check email uniqueness
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, passwordHash, role });

    return res.status(201).json({ message: 'Account created successfully.', user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Find user (include passwordHash for comparison)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'No account found. Please sign up.' });
    }

    // Role mismatch check
    if (user.role !== role) {
      return res.status(403).json({
        message: `This email is registered as ${user.role}. Please log in as ${user.role}.`,
      });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = signToken(user);

    // Set httpOnly cookie
    const cookieOpts = { ...COOKIE_OPTIONS };
    if (process.env.NODE_ENV === 'production') {
      cookieOpts.secure = true;
    }

    res.cookie('token', token, cookieOpts);

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  return res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * GET /api/auth/me  (protected)
 */
const getMe = (req, res) => {
  return res.status(200).json({ user: req.user });
};

/**
 * GET /api/auth/check-email?email=...
 */
const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email query param is required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return res.status(200).json({ exists: !!user });
  } catch (err) {
    next(err);
  }
};

export { signup, login, logout, getMe, checkEmail };
