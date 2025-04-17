const express = require('express');
const { verifyToken } = require('../middleware/checkCustomer');
const { addCustomerActivity, getCustomerActivityByMonth, getCustomerActivityById, udpateCustomerActivity, deleteCustomerActivity } = require('../controllers/customerLoggingController');
// const { verifyToken, verifyAdmin, verifyCustomer, verifyPermission } = require("../middleware/checkCustomer")
// const {confirmAdmin, register, getCustomer, getCustomers, login, loginAsAdmin, deleteCustomer, updateCustomer } = require('../controllers/customerController');
const router = express.Router();

router.get("/", (req, res)=>{
    return res.status(200).json({message: "Customer Logging API is working"})
})

router.post('/activity', verifyToken, addCustomerActivity);
router.get('/activities', verifyToken, getCustomerActivityByMonth) // for fetching according to a month should implement this with date as primary key in gsi
router.get('/:id', verifyToken, getCustomerActivityById)
router.put('/:id', verifyToken, udpateCustomerActivity)
router.delete('/:id', verifyToken, deleteCustomerActivity)

module.exports = router;