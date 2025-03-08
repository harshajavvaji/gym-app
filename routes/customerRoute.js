const express = require('express')
const { verifyToken, verifyAdmin } = require("../middleware/checkCustomer")
const { register, getCustomer, getCustomers, login, deleteCustomer, updateCustomer } = require('../controllers/customerController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login)
router.get('/:id', verifyToken, getCustomer)
router.get('/', verifyAdmin, getCustomers)
router.delete('/:id', verifyToken, deleteCustomer)
router.put('/:id', verifyToken, updateCustomer)

module.exports = router;