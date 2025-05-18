const { Router } = require('express');
const Product = require('../models/products'); // Убедитесь, что модель импортирована правильно
const router = Router();

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
}
// GET /products - отображение списка курсов
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
    try {
      const searchTerm = req.query.q;
      const category = req.query.category;
      const gpu = req.query.gpu;
      const cpu = req.query.cpu;
      const rum = req.query.rum;
      const ssd = req.query.ssd;
      const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
      const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;
  
      // Fetch distinct values for filters
      const gpus = await Product.distinct('gpu');
      const categorys = await Product.distinct('category');
      const cpus = await Product.distinct('cpu');
      const rums = await Product.distinct('rum');
      const ssds = await Product.distinct('ssd');
  
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
      if (rum) query.rum = rum;
      if (ssd) query.ssd = ssd;
      if (priceMin) query.price = { $gte: priceMin };
      if (priceMax) query.price = { ...query.price, $lte: priceMax };
  
      const products = await Product.find(query);
  
      res.render('products', { // Ensure you have a corresponding 'ed' template
        title: 'Результаты поиска',
        isProducts: true,
        products,
        categorys,
        ssds,
        cpus,
        gpus,
        rums,
        user, // Передаем информацию о пользователе в шаблон
        isAdmin
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).send('Internal Server Error');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/ed', isAdmin, async (req, res) => {
  const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
  try {
    const searchTerm = req.query.q;
    const category = req.query.category;
    const gpu = req.query.gpu;
    const cpu = req.query.cpu;
    const rum = req.query.rum;
    const ssd = req.query.ssd;
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    // Fetch distinct values for filters
    const gpus = await Product.distinct('gpu');
    const categorys = await Product.distinct('category');
    const cpus = await Product.distinct('cpu');
    const rums = await Product.distinct('rum');
      const ssds = await Product.distinct('ssd');

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
    if (rum) query.rum = rum;
      if (ssd) query.ssd = ssd;
    if (priceMin) query.price = { $gte: priceMin };
    if (priceMax) query.price = { ...query.price, $lte: priceMax };

    const products = await Product.find(query);

    res.render('edit', { // Ensure you have a corresponding 'ed' template
      title: 'Результаты поиска',
      isProducts: true,
      products,
      categorys,
      ssds,
        cpus,
        gpus,
        rums,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /products/search - поиск продуктов с фильтрами
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
    const gpus = await Product.distinct('gpu');  // Fetch distinct GPU names from the database
    const categorys = await Product.distinct('category');
    const cpus = await Product.distinct('cpu');

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

    const products = await Product.find(query);

    res.render('search', {
      title: 'Результаты поиска',
      isProducts: true,
      products,
      categorys,
      cpus,
      gpus, // Pass the distinct GPU list to the template
      user, // Передаем информацию о пользователе в шаблон
      isAdmin 
      
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
});



// GET /products/:id/edit - страница редактирования курса
router.get('/:id/edit', isAdmin, async (req, res) => {
  const user = req.user; // Предположим, что информация о пользователе доступна в запросе

    // Определяем, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
  try {
    if (!req.query.allow) {
      return res.redirect('/');
    }
    const product = await Product.findById(req.params.id);
    res.render('product-edit', {
      title: `Редактировать ${product.title}`,
      product,
      user, // Передаем информацию о пользователе в шаблон
      isAdmin 
    });
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /product/edit - обновление курса
router.post('/edit', async (req, res) => {
  try {
    const { id } = req.body;
    delete req.body.id;
    await Product.findByIdAndUpdate(id, req.body);
    res.redirect('/products');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /product/:id - отображение информации о курсе
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('product not found');
    }
    res.render('product', {
      layout: 'empty',
      title: `product ${product.title}`,
      product,
      user: req.user 
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /products/:id/comments - добавление комментария к курсу
router.post('/:id/comments', async (req, res) => {
  try {
    const { user, text } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('product not found');
    }

    const newComment = { user, text, date: new Date() };
    product.comments.push(newComment);
    await product.save();

    res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('product not found');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send('product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;