const express = require('express')
const { register } = require('../controllers/customerController');
const router = express.Router();

router.post('/addCustomer', register);


module.exports = router;