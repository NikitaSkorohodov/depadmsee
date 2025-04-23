const { Router } = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = Router();

// Middleware для проверки роли администратора
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
}

// Register Route
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.redirect('/auth/login');
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.redirect('/auth/register');
  }
});

// Admin Route for Creating Admins
router.get('/create-admin', isAdmin, (req, res) => {
  const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
  res.render('create-admin', { // Ensure you have a corresponding 'ed' template
    title: 'create-admin',
    
    user, // Передаем информацию о пользователе в шаблон
    isAdmin
  })});

router.post('/create-admin', isAdmin, async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/auth/create-admin');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ username, password: hashedPassword, role: 'admin' });
    await newAdmin.save();

    res.redirect('/');
  } catch (error) {
    console.error('Ошибка создания администратора:', error);
    res.redirect('/auth/create-admin');
  }
});

// Login Route
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));

// Logout Route
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
