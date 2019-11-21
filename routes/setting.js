const express = require('express');
const router = express.Router();

// slide settings
router.get('/preference');

// wifi config
router.get('/wifi');
router.post('/wifi/connect');

// authorizing key & login
// router.get('/is-authorized');
router.post('/authorize');
router.get('/is-required-login');
router.post('/save-instagram-login-info');
router.get('/is-required-security-code');
router.post('/submit-security-code');
router.get('/get-new-code');

// license
router.get('/license');
router.post('/submit-license');
router.get('/is-license-activated');

module.exports = router;