const { Router } = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = Router();

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
}

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username, email });
    if (existingUser) {
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration err:', error);
    res.redirect('/auth/register');
  }
});

router.get('/create-admin', isAdmin, (req, res) => {
  const user = req.user; 

    
    const isAdmin = user && user.role === 'admin';
  res.render('create-admin', { 
    title: 'create-admin',
    
    user, 
    isAdmin
  })});

router.post('/create-admin', isAdmin, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username, email });
    if (existingUser) {
      return res.redirect('/auth/create-admin');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ username, email, password: hashedPassword, role: 'admin' });
    await newAdmin.save();

    res.redirect('/');
  } catch (error) {
    console.error('Ошибка создания администратора:', error);
    res.redirect('/auth/create-admin');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
