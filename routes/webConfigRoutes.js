const express = require('express');
const router = express.Router();

const webConfigController = require('../controllers/webConfig');

// wifi config
router.get('/wifi');
router.post('/wifi/connect');

// authorizing key & login
router.post('/authorize', webConfigController.authorize);

router.get('/is-required-login');
router.post('/save-instagram-login-info');
router.get('/is-required-security-code');
router.post('/submit-security-code');
router.get('/get-new-code');

// license
router.get('/license');
router.post('/submit-license');
router.get('/is-license-activated');

// device info
router.get('device-info');

module.exports = router;