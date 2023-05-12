// Import required packages
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

// Import controllers and models
const errorController = require('./controllers/error');
const User = require('./models/user');

// Set up MongoDB URI and create new Express app
const MONGODB_URI = 'mongodb://localhost:27018/Shop';
const app = express();

// Set up MongoDB session store, CSRF protection, and view engine
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();
app.set('view engine', 'ejs');
app.set('views', 'views');

// Import and use routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(csrfProtection);
app.use(flash());

// Adding CSRF token to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Set up middleware to check for user authentication 
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err))
    });
});


// Use routes and error controller
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect('/500')
})

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(result => {
    console.log('connected')
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });