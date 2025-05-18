const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const Product = require('../models/products');

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

// Применение middleware ко всем маршрутам в этом роутере
router.use(isAuthenticated);

// GET /favorites - отображение списка понравившихся курсов
router.get('/', async (req, res) => {
  
  try {
    const favorite = await Favorite.fetchByUser(req.user._id);
    res.render('favorites', {
      title: 'Ваши понравившиеся курсы',
      products: favorite ? favorite.products : []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /favorites/add - добавить курс в понравившиеся
router.post('/add', async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).send('Product ID is required');
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      await Favorite.add(req.user._id, product);
      res.redirect('/favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

// POST /favorites/remove - удалить курс из понравившихся
router.post('/remove', async (req, res) => {
  try {
    const { productId } = req.body;
    await Favorite.remove(req.user._id, productId);
    res.redirect('/favorites');
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

