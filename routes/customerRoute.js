const express = require('express')
const { verifyToken, verifyAdmin, verifyCustomer, verifyPermission } = require("../middleware/checkCustomer")
const { register, getCustomer, getCustomers, login, deleteCustomer, updateCustomer } = require('../controllers/customerController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login)
router.get('/:id', verifyToken, getCustomer)
router.get('/', verifyAdmin, getCustomers)
router.delete('/:id', verifyCustomer, deleteCustomer)
router.put('/:id', verifyPermission, updateCustomer)

module.exports = router;