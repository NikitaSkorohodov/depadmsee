const { Router } = require('express');
const Product = require('../models/products'); // предполагается, что ваша модель называется Product
const router = Router();

// GET /courses - отображение списка курсов
router.get('/', async (req, res) => {
  try {
    const courses = await Product.find();
    res.render('products', {
      title: 'Курсы',
      isCourses: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Search route
router.get('/ed', async (req, res) => {
  try {
    const courses = await Product.find();
    res.render('products', {
      title: 'Курсы',
      isCourses: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Search route
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const category = req.query.category;
    const gpu = req.query.gpu;
    const cpu = req.query.cpu;
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    // Fetch distinct GPU values for filter options
    const gpus = await Course.distinct('gpu'); 

    // Check if searchTerm is valid
    let query = {};

    // If there is a search term, build the regex search
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Add other filters if they are provided
    if (category) query.category = category;
    if (gpu) query.gpu = gpu;
    if (cpu) query.cpu = cpu;
    if (priceMin) query.price = { $gte: priceMin };
    if (priceMax) query.price = { ...query.price, $lte: priceMax };

    const courses = await Course.find(query);
    res.render('search', {
      title: 'Результаты поиска',
      isCourses: true,
      courses,
      gpus // Pass GPU list to the template
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});


// GET /courses/:id/edit - страница редактирования курса
router.get('/:id/edit', async (req, res) => {
  try {
    if (!req.query.allow) {
      return res.redirect('/');
    }
    const course = await Product.findById(req.params.id);
    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    });
  } catch (error) {
    console.error('Error fetching course for edit:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /courses/edit - обновление курса
router.post('/edit', async (req, res) => {
  try {
    const { id } = req.body;
    delete req.body.id;
    await Product.findByIdAndUpdate(id, req.body);
    res.redirect('/products');
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /courses/:id - отображение информации о курсе
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render('products', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course,
      user: req.user // передаем текущего пользователя в шаблон
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).send('Internal Server Error');
  }
});


// POST /courses/:id/comments - добавление комментария к курсу
router.post('/:id/comments', async (req, res) => {
  try {
    const { user, text } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send('Course not found');
    }

    const newComment = { user, text, date: new Date() };
    course.comments.push(newComment);
    await course.save();

    res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
