const bcrypt = require('bcrypt');
const User = require('../models/user');

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed });
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (error) {
    next(error);
  }
}

function currentUser(req, res) {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
}

function logout(req, res) {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
}

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({}, 'id name email').lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, currentUser, logout, getAllUsers };
