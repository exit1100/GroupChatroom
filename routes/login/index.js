const express = require('express');
const router = express.Router();
const controller = require('./login.controller');

/* GET home page. */
router.get('/', controller.login);
router.get('/non_account_login', controller.non_account_login);

module.exports = router;