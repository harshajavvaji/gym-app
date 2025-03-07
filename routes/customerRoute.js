const express = require('express')
const { register, login, deleteCustomer } = require('../controllers/customerController');
const router = express.Router();

router.post('/addCustomer', register);
router.post('/login', login)
router.delete('/delete/:id', deleteCustomer)

module.exports = router;