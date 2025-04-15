const { Router } = require('express');
const Course = require('../models/products');
const router = Router();

router.get('/', (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    });
});

router.post('/', async (req, res) => {
    const course = new Course({
        title: req.body.title,
        price: req.body.price, 
        img: req.body.img,
        description: req.body.description, // Добавляем описание курса
        gpu: req.body.gpu,
        cpu: req.body.cpu,
        rum: req.body.rum,
        ssd: req.body.ssd,
        category: req.body.category // Добавляем категорию курса
    });
    try { 
        await course.save();
        res.redirect('/products')
    } catch (e){
        console.log(e)
    }
});


module.exports = router;

