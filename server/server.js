var express = require('express');
var request = require('request');
var path = require('path');
var passport = require('passport');
var util = require('util');
var StravaStrategy = require('passport-strava').Strategy;
var bodyParser  = require('body-parser');
var  http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var migrateUsers = require('../database/user_database.js');
var migrateActivities = require('../database/activities_database.js');

var app = express();
var server = http.createServer(app);

var STRAVA_CLIENT_ID = '8506';
var STRAVA_CLIENT_SECRET = 'e811e15087ce614ae212c85876706235a7bc1d41';
var ACCESS_TOKEN;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {

  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // console.log(obj);
  done(null, obj);
});


// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.
passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // console.log(profile);
    ACCESS_TOKEN = accessToken;
    // console.log(ACCESS_TOKEN);
    // asynchronous verification, for effect...
    process.nextTick(function () {
      migrateUsers.syncUserModel(profile._json);
      // console.log(profile._json);
      // To keep the example simple, the user's Strava profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Strava account with a user record in your database,
      // and return that user instead.
      return done(null, profile._json);
    });
  }
));

// configure Express
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(cookieParser());
  app.use(bodyParser.urlencoded());
  app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, './../build')));

//get request to homescreen
app.get('/', function(req, res){
  console.log('hello');
//   // console.log(req.user);
//   if(!req.user) return res.redirect('/login');
//   else {
//     request({url:` https://www.strava.com/api/v3/athlete/activities?per_page=200&access_token=${ACCESS_TOKEN}`}, function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//         var activitiesRes = JSON.parse(body);
//         activitiesRes.forEach(obj => migrateActivities.syncFunction(obj));
//         migrateActivities.updateAverage(activitiesRes[0]);
//         res.render('account', { user: req.user });
//       }
//     });
//   }
});

app.get('/account', ensureAuthenticated, function(req, res){

  // res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  // console.log(req.user)
  res.render('login', { user: req.user });
});

// GET /auth/strava
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Strava authentication will involve
//   redirecting the user to strava.com.  After authorization, Strava
//   will redirect the user back to this application at /auth/strava/callback
app.get('/auth/strava',
  passport.authenticate('strava', { scope: ['public'] }),
  function(req, res){
    // The request will be redirected to Strava for authentication, so this
    // function will not be called.
  });

// GET /auth/strava/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/strava/callback',
  passport.authenticate('strava', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
