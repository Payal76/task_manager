const express = require('express');
const passport = require('passport');
const { signup, currentUser, logout, getAllUsers } = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', passport.authenticate('local'), (req, res) => res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } }));
router.post('/logout', ensureAuthenticated, logout);
router.get('/me', ensureAuthenticated, currentUser);
router.get('/users/all', ensureAuthenticated, getAllUsers);

module.exports = router;
