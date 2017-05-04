'use strict'

// modules
const crypto = require('crypto')
const express = require('express')
const expressSession = require('express-session')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2')

const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');


// constants
const state = crypto.randomBytes(16).toString('hex')


// passport setup
passport.use(new OAuth2Strategy({
    authorizationURL: process.env.authorizationURL || 'http://localhost:3001/dialog/authorize', //
    tokenURL: process.env.tokenURL || 'http://localhost:3001/oauth/token', //
    clientID: process.env.clientID || 'abc123',
    clientSecret: process.env.clientSecret || 'ssh-secret',
    callbackURL: process.env.callbackURL || "http://localhost:3000"
        /*
            authorizationURL: 'https://staging-auth.wallstreetdocs.com/oauth/authorize', //'http://localhost:3001/dialog/authorize', //
            tokenURL: 'https://staging-auth.wallstreetdocs.com/oauth/token', // 'http://localhost:3001/oauth/token', //
            clientID: 'coding_test',
            clientSecret: 'bwZm5XC6HTlr3fcdzRnD',
            callbackURL: "http://localhost:3000"
            */

}, (accessToken, refreshToken, profile, response, cb) => {
    console.log('response', {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile,
        response: response
    })

    cb(null, profile)
}))


passport.serializeUser((user, done) => {
    console.log('user data serialized');
    done(null, user)
})

passport.deserializeUser((user, done) => {
    console.log('user data deserialized');
    done(null, user)
})

// web server
const app = new express()

// sesssion
app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}))

// inject passport
app.use(passport.initialize())
app.use(passport.session())


// view engine setup
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// callback route
app.get('/', passport.authenticate('oauth2', {
    failureRedirect: '/home'
}), (req, res) => {
    console.log('query', req.query) // => logs state and code fields as expected
    console.log('[using accessToken]', req.user.access_token);

    if (false) { next(); }
    var request = require('request'),
        options = {
            url: process.env.userinfoURL || 'http://localhost:3001/api/userinfo',
            headers: {
                'Authorization': 'Bearer ' + req.user.access_token
            }
        };

    function callback(error, response, body) {
        if (!error && response.statusCode === 200) {

            console.log('response from profile api', { body: JSON.parse(body) });

            var _body = JSON.parse(body);

            res.render('profile', _body);

        } else {
            res.render('error', { message: _body });
        }
    }

    request(options, callback);

})

// home route
app.get('/home', (req, res) => {
    console.log('query', req.query) // => logs state and code fields as expected
    console.log(req.session);
    res.render('home');
})

// start server
app.listen(3000)
console.log('oAuth2 consumer server listening to port 3000 ...')
