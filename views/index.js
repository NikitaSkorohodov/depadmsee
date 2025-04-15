const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
// npm install @handlebars/allow-prototype-access
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

mongoose.set('strictQuery', false); // или true, в зависимости от ваших предпочтений

const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/products');
const { Script } = require('vm');

const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    // Define the `eq` helper for checking equality in templates
    eq: function (a, b) {
      return a === b;
    }
  }
});

app.engine('hbs', hbs.engine);

app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/products', coursesRoutes);
app.use('/card', cardRoutes);

// Маршрут для смены макета
app.get('/change-layout', (req, res) => {
  // Устанавливаем новый макет
  app.set('layout', 'main2');
  // Перенаправляем на главную страницу или любую другую страницу
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const url = 'mongodb+srv://nikitaskoroho14:@root.yil9zns.mongodb.net/shop';
    await mongoose.connect(url, {
      useNewUrlParser: true,
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

start();
