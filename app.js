var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var  request = require('request');
var flash = require('express-flash');
var passport = require('passport');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var session = require('express-session')
var MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore(
  { 
    uri: 'mongodb://localhost:27017/local',
    collection: 'mySessions'
  });
  store.on('error', function(error) {
      if(error){
        console.log(error, '[Error] : mongo session error ')
      }// Also get an error here

    });
/**
 * Controllers (route handlers).
 */

var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var homeController =  require('./controllers/home');

/**
 * API keys and Passport configuration.
*/
var passportConfig = require('./config/passport');

var User = require('./models/User');


/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect('mongodb://localhost/local');
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator()); // this line should be immediately after bodyParser
app.use(cookieParser());
app.use(session({
  saveUninitialized : false,
  secret: 'lost in maze',
  store : store 
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/*app.use(function(req, res, next) {
  // After successful login, redirect back to /api, /contact or /
  if (/(api)|(contact)|(^\/$)/i.test(req.path)) {
    req.session.returnTo = req.path;
  }
  next();
});*/

/**
 * Primary app routes.
 */




app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);


app.get('/home',homeController.getHomePage);

app.get('/shows/search',apiController.search)
app.get('/shows/search/:showId',apiController.getShow)
app.get('/shows/myshows',apiController.getUserShows)
app.post('/shows/subscribe',apiController.postSubscribe);
app.post('/shows/unsubscribe', apiController.postUnsubscribe);
app.get('/shows/:showId/season/:seasonId',apiController.getSeasons)
app.get('/episodes/recent',apiController.getRecent)
app.get('/episodes/calendar',apiController.getEpisodeList)

app.get('/', homeController.getHomePage);
// catch 404 and forward to error handler
app.use(function(err,req, res, next) {
  var err = new Error('Prashant is wrong');
  err.status = 404;
  next(err);
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
