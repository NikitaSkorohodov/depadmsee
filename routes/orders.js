const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Card = require('../models/card'); // Предполагается, что у вас есть модель корзины
const Product = require('../models/products');
const User = require('../models/user'); // Предполагается, что у вас есть модель пользователя

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
}

// POST /order/checkout - оформление заказа с выбором точки доставки
router.post('/checkout', async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).send('Неавторизованный пользователь');
    }

    const userId = req.user._id;
    const deliveryPoint = req.body.deliveryPoint; // Получаем выбранную точку доставки из тела запроса

    if (!deliveryPoint) {
      return res.status(400).send('Пожалуйста, выберите точку доставки');
    }

    const card = await Card.fetchByUser(userId);
    if (!card || card.products.length === 0) {
      return res.status(400).send('В корзине нет product');
    }

    const totalPrice = card.products.reduce((acc, product) => acc + product.price, 0);

    const newOrder = new Order({
      user: userId,
      products: card.products,
      totalPrice: totalPrice,
      deliveryPoint: deliveryPoint
    });

    await newOrder.save();

    // Очищаем корзину пользователя после оформления заказа
    await Card.findOneAndDelete({ user: userId });

    res.redirect('/orders'); // Перенаправляем на страницу заказов или другую желаемую страницу
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

// GET /orders - отображение списка заказов пользователя
router.get('/', async (req, res) => {
  const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).send('Unauthorized');
    }

    const orders = await Order.find({ user: req.user._id }).populate('user');

    const formattedOrders = await Promise.all(orders.map(async (order) => {
      // Загружаем все курсы, но безопасно
      const products = await Promise.all(order.products.map(async productId => {
        const product = await Product.findById(productId);
        if (!product) {
          console.warn(`products с ID ${productId} не найден. Возможно, он был удалён.`);
          return null;
        }
        return { _id: product._id, title: product.title, price: product.price, sale: product.sale };
      }));

      // Удаляем курсы, которые не были найдены (null)
      const validProducts = products.filter(product => product !== null);

      const formattedDate = order.date instanceof Date
        ? order.date.toDateString()
        : 'Дата отсутствует';

      return {
        _id: order._id,
        user: order.user,
        products: validProducts,
        totalPrice: order.totalPrice,
        date: formattedDate,
        deliveryPoint: order.deliveryPoint,
        __v: order.__v
      };
    }));

    res.render('orders', {
      title: 'Ваши заказы',
      orders: formattedOrders,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin 
    });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

// GET /all-orders - отображение списка всех заказов для всех пользователей
router.get('/all-orders', isAdmin, async (req, res) => {
  try {
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
    const orders = await Order.find().populate('user'); // Получение всех заказов с информацией о пользователях

    const formattedOrders = await Promise.all(orders.map(async (order) => {
      const products = await Promise.allSettled(order.products.map(async (productId) => {
        const product = await Product.findById(productId);
        if (!product) {
          console.error(`product с ID ${productId} не найден.`);
          return null;
        }
        return { _id: product._id, title: product.title, price: product.price };
      }));

      const validProducts = products
        .filter(result => result.status === "fulfilled" && result.value !== null)
        .map(result => result.value);

      const formattedDate = order.date && order.date instanceof Date
        ? order.date.toDateString()
        : "Дата отсутствует";

      return {
        _id: order._id,
        user: order.user || { username: "Неизвестный пользователь" },
        products: validProducts,
        totalPrice: order.totalPrice,
        date: formattedDate,
        deliveryPoint: order.deliveryPoint,
        __v: order.__v
      };
    }));

    res.render('all-orders', {
      title: 'Все заказы',
      orders: formattedOrders,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin 
    });
  } catch (error) {
    console.error('Ошибка получения всех заказов:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});
// DELETE /orders/delete/:id - удаление заказа
router.post('/delete/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/orders');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;