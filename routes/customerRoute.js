const express = require('express')
const { register, getCustomer, getCustomers, login, deleteCustomer, updateCustomer} = require('../controllers/customerController');
const router = express.Router();

router.post('/addCustomer', register);
router.post('/login', login)
router.get('/:id', getCustomer)
router.get('/',getCustomers)
router.delete('/:id',deleteCustomer)
router.put('/:id',updateCustomer)

module.exports = router;