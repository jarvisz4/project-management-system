const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validations
    if (!name || !email || !password) return res.status(400).json({ msg: 'All fields required' });
    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ msg: 'Invalid email format' });
    if (password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'member' });
    res.status(201).json({ token: genToken(user._id), user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    res.json({ token: genToken(user._id), user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { signup, login, getMe };
