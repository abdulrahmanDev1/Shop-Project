// Import required packages
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require("tiny-csrf");
const flash = require('connect-flash');
const multer = require('multer');
const cookieParser = require("cookie-parser");


// Import controllers and models
const errorController = require('./controllers/error');
const User = require('./models/user');

// Set up MongoDB URI and create new Express app
//// mongoDb after the last update couldn't connect using localhost:27017 and had to change it to 127.0.0.1:27017
const MONGODB_URI = 'mongodb://127.0.0.1:27017/Shop';
const app = express();

// Set up MongoDB session store, CSRF protection, and view engine
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cp) => {
    cp(null, 'images')
  },
  filename: (req, file, cp) => {
    //removed the colons from the name because the windows doesn't allow a name to contain colons ":"
    const timestamp = new Date().toISOString().replace(/:/g, '');
    const newFileName = timestamp + '-' + file.originalname;
    cp(null, newFileName);
  }
});



const fileFilter = (req, file, cp) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cp(null, true)
  } else {
    cp(null, false)

  }
}


app.set('view engine', 'ejs');
app.set('views', 'views');

// Import and use routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser("cookie-parser-secret"));

app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csurf("123456789iamasecret987654321look", ["Post"]));
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
  // console.log(req.session.isLoggedIn + ` LOG`)
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: res.locals.isAuthenticated
  }
  );
});


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
