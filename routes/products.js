const { Router } = require('express');
const Course = require('../models/products'); // Убедитесь, что модель импортирована правильно
const router = Router();

// GET /courses - отображение списка курсов
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
    try {
      const searchTerm = req.query.q;
      const category = req.query.category;
      const gpu = req.query.gpu;
      const cpu = req.query.cpu;
      const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
      const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;
  
      // Fetch distinct values for filters
      const gpus = await Course.distinct('gpu');
      const categorys = await Course.distinct('category');
      const cpus = await Course.distinct('cpu');
  
      // Build the search query
      let query = {};
  
      if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
        query.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }
  
      if (category) query.category = category;
      if (gpu) query.gpu = gpu;
      if (cpu) query.cpu = cpu;
      if (priceMin) query.price = { $gte: priceMin };
      if (priceMax) query.price = { ...query.price, $lte: priceMax };
  
      const courses = await Course.find(query);
  
      res.render('products', { // Ensure you have a corresponding 'ed' template
        title: 'Результаты поиска',
        isCourses: true,
        courses,
        categorys,
        cpus,
        gpus,
        user, // Передаем информацию о пользователе в шаблон
        isAdmin
      });
    } catch (error) {
      console.error('Error searching courses:', error);
      res.status(500).send('Internal Server Error');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/ed', async (req, res) => {
  const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
  try {
    const searchTerm = req.query.q;
    const category = req.query.category;
    const gpu = req.query.gpu;
    const cpu = req.query.cpu;
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    // Fetch distinct values for filters
    const gpus = await Course.distinct('gpu');
    const categorys = await Course.distinct('category');
    const cpus = await Course.distinct('cpu');

    // Build the search query
    let query = {};

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (gpu) query.gpu = gpu;
    if (cpu) query.cpu = cpu;
    if (priceMin) query.price = { $gte: priceMin };
    if (priceMax) query.price = { ...query.price, $lte: priceMax };

    const courses = await Course.find(query);

    res.render('edit', { // Ensure you have a corresponding 'ed' template
      title: 'Результаты поиска',
      isCourses: true,
      courses,
      categorys,
      cpus,
      gpus,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});




// GET /courses/search - поиск курсов
// GET /courses/search - поиск продуктов с фильтрами
// GET /courses/search - поиск продуктов с фильтрами
router.get('/search', async (req, res) => {
  const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
  try {
    const searchTerm = req.query.q;
    const category = req.query.category;
    const gpu = req.query.gpu;
    const cpu = req.query.cpu;
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    // Fetch distinct GPU values for the filter
    const gpus = await Course.distinct('gpu');  // Fetch distinct GPU names from the database
    const categorys = await Course.distinct('category');
    const cpus = await Course.distinct('cpu');

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
      categorys,
      cpus,
      gpus, // Pass the distinct GPU list to the template
      user, // Передаем информацию о пользователе в шаблон
      isAdmin 
      
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
    const course = await Course.findById(req.params.id);
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
    await Course.findByIdAndUpdate(id, req.body);
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
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.render('course', {
      layout: 'empty',
      title: `product ${course.title}`,
      course,
      user: req.user 
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
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send('Course not found');
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).send('Course deleted successfully');
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;