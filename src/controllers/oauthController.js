const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../config/db');
const tokenUtil = require('../utils/tokenUtil');
require('dotenv').config();

// Google OAuth2.0 Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (token, tokenSecret, profile, done) => {
    process.nextTick(async () => {
        const providerId = 1; // Google
        const email = profile.emails[0].value;
        const fullName = profile.displayName;

        try {
            const result = await db.query('SELECT * FROM handle_oauth($1, $2, $3, $4)', 
                [profile.id, providerId, email, fullName]);

            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err);
        }
    });
  }
));

// Facebook OAuth2.0 Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails']
  },
  (token, tokenSecret, profile, done) => {
    process.nextTick(async () => {
        const providerId = 2; // Facebook
        const email = profile.emails[0].value;
        const fullName = profile.displayName;

        try {
            const result = await db.query('SELECT * FROM handle_oauth($1, $2, $3, $4)', 
                [profile.id, providerId, email, fullName]);

            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err);
        }
    });
  }
));

// Function to generate and set JWT tokens in cookies
const setTokens = (res, userId) => {
    tokenUtil.generateAccessTokenWithCookie(res, userId);
    tokenUtil.generateRefreshTokenWithCookie(res, userId);
};

module.exports = { passport, setTokens };
