const { Router } = require('express');
const Product = require('../models/products');
const router = Router();

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.redirect('/auth/login');
  }

router.get('/', isAdmin, (req, res) => {
    const user = req.user; 
    const isAdmin = user && user.role === 'admin';
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true,
        user, // Передаем информацию о пользователе в шаблон
      isAdmin 
    });
});

router.post('/', async (req, res) => {
    const product = new Product({
        title: req.body.title,
        price: req.body.price, 
        sale: req.body.sale, 
        img: req.body.img,
        description: req.body.description, 
        gpu: req.body.gpu,
        cpu: req.body.cpu,
        rum: req.body.rum,
        ssd: req.body.ssd,
        category: req.body.category
    });
    try { 
        await product.save();
        res.redirect('/products')
    } catch (e){
        console.log(e)
    }
});


module.exports = router;

