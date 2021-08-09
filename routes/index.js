const express = require('express');
const router = express.Router();

const main = require('./main/index');
const user = require('./users/index');
const login = require('./login/index');

router.use('/main', main);
router.use('/user', user);
router.use('/', login);

module.exports = router;