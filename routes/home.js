const { Router } = require('express');
const Product = require('../models/products');
const router = Router();

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    // Предположим, что у вас есть объект user, который передается в шаблон
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';

    res.render('index', {
      title: 'главная страница',
      isHome: true,
      products,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin // Передаем информацию о статусе администратора
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/contact', async (req, res) => {
  try {
    const products = await Product.find();
    // Предположим, что у вас есть объект user, который передается в шаблон
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';

    res.render('contact', {
      title: 'contact',
      isHome: true,
      products,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin // Передаем информацию о статусе администратора
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/admpanel', isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    // Предположим, что у вас есть объект user, который передается в шаблон
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';

    res.render('admpanel', {
      title: 'admpanel',
      isHome: true,
      products,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin // Передаем информацию о статусе администратора
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/about', async (req, res) => {
  try {
    const products = await Product.find();
    // Предположим, что у вас есть объект user, который передается в шаблон
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';

    res.render('about', {
      title: 'about us',
      isHome: true,
      products,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin // Передаем информацию о статусе администратора
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
