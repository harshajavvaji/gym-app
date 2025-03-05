const express = require('express')
const { register, login } = require('../controllers/customerController');
const router = express.Router();

router.post('/addCustomer', register);
router.post('/login', login)


module.exports = router;