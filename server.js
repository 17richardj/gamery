var express = require('express');
var rateLimit = require('express-rate-limit');
const helmet = require('helmet');
var mongoSanitize = require('express-mongo-sanitize');
var xss = require('xss-clean');
var ejs = require('ejs');
var path = require('path');
var app = express();
app.use(helmet.noCache())
// Data Sanitization against XSS

//limit amount of requests one user can make
const limit = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000, // 1 Hour
    message: 'Too many requests' // message to send
});
app.use('/', limit); // Setting limiter on specific route

app.use(express.json({ limit: '10kb' })); // Body limit is 10

//sanitize mongo requests
app.use(mongoSanitize());
app.use(xss());

var bodyParser = require('body-parser');
const passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const winston = require('winston');

//bcrypt - hashing
var bcrypt = require('bcrypt');

const saltRounds = 10;

require("dotenv").config();

//connect to mongo db
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

//set session details
app.use(session({
  secret: ['ST9iSuSp7/Mikx5LcslWTzsyJIs=','HJzn/3ExRH51F1jnF3L/BjBPS6o=','YRzkxDviYAi12HnNct7fMpUn4RE='],
    name: "secretname",
  resave: true,
  cookie: {
      httpOnly: true,
      //secure: true,
      sameSite: true,
      maxAge: 600000 // max age limit of sessions
  },
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db,
    ttl: (1 * 60 * 60)
  })
}));

// passport middleware setup ( it is mandatory to put it after session middleware setup)
app.use(passport.initialize());
app.use(passport.session());

//set views path with all app views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/views'));

//establish all routes
var index = require('./routes/index');
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


// listen on port 3000 or any other specified port
const PORT = process.env.PORT || 3000;
app.listen( PORT , function () {
  console.log('Express app listening on port: ' + PORT);
});

//export db connection
module.exports = db;
