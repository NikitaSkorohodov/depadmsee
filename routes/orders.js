const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Card = require('../models/card'); // Предполагается, что у вас есть модель корзины
const Course = require('../models/products');
const User = require('../models/user'); // Предполагается, что у вас есть модель пользователя

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
    if (!card || card.courses.length === 0) {
      return res.status(400).send('В корзине нет курсов');
    }

    const totalPrice = card.courses.reduce((acc, course) => acc + course.price, 0);

    const newOrder = new Order({
      user: userId,
      courses: card.courses,
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
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).send('Unauthorized');
    }

    const orders = await Order.find({ user: req.user._id }).populate('user');

    // Преобразуем каждый заказ, чтобы заменить идентификаторы курсов на их названия
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      const courses = await Promise.all(order.courses.map(async courseId => {
        const course = await Course.findById(courseId);
        return { _id: course._id, title: course.title, price: course.price };
      }));

      // Преобразуем дату в формат строки только с датой
      const formattedDate = order.date.toDateString();

      return {
        _id: order._id,
        user: order.user,
        courses,
        totalPrice: order.totalPrice,
        date: formattedDate, // Передаем отформатированную дату в шаблон
        deliveryPoint: order.deliveryPoint, // Передаем точку выдачи
        __v: order.__v
      };
    }));

    res.render('orders', {
      title: 'Ваши заказы',
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});


// GET /all-orders - отображение списка всех заказов для всех пользователей
router.get('/all-orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user'); // Получение всех заказов с информацией о пользователях

    const formattedOrders = await Promise.all(orders.map(async (order) => {
      const courses = await Promise.allSettled(order.courses.map(async (courseId) => {
        const course = await Course.findById(courseId);
        if (!course) {
          console.error(`Курс с ID ${courseId} не найден.`);
          return null;
        }
        return { _id: course._id, title: course.title, price: course.price };
      }));

      const validCourses = courses
        .filter(result => result.status === "fulfilled" && result.value !== null)
        .map(result => result.value);

      const formattedDate = order.date && order.date instanceof Date
        ? order.date.toDateString()
        : "Дата отсутствует";

      return {
        _id: order._id,
        user: order.user || { username: "Неизвестный пользователь" },
        courses: validCourses,
        totalPrice: order.totalPrice,
        date: formattedDate,
        deliveryPoint: order.deliveryPoint,
        __v: order.__v
      };
    }));

    res.render('all-orders', {
      title: 'Все заказы',
      orders: formattedOrders
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