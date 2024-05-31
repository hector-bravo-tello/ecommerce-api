const express = require('express');
const { passport, setTokens } = require('../controllers/oauthController');

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['openid', 'profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    setTokens(res, req.user.id);
    res.redirect('/');
  });

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    setTokens(res, req.user.id);
    res.redirect('/');
  });

module.exports = router;
