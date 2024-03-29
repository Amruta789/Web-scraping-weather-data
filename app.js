var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser= require('body-parser');
var logger = require('morgan');
require('dotenv').config();

// Routes for the website
var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var adminDashboardRouter= require('./routes/admindashboard');

// Connection to database
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));
app.use(session(
  {
    key: 'user_sid',
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie:{
      expires: 600000 
    }
  }
))
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  //store the root folder from where the app is launched.
  req.rootPath = __dirname;
  console.log("rootPath"+req.rootPath);
  res.locals.user = req.user;
  res.locals.session = req.session;
  next();
});

// mount the routes
app.use('/', indexRouter);
app.use('/dashboard/',dashboardRouter);
app.use('/admindashboard/',adminDashboardRouter);

// To clear cookies
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
