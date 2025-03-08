const express = require("express")
const { getAllCustomerSubscription, getCustomerSubscription, deleteCustomerSubscription, updateCustomerSubscription, getAllCustomerSubscriptionforCustomer, addCustomerSubscription } = require("../controllers/customerSubscriptionController")
const { deleteSubscription } = require("../controllers/subscriptionController")
const { verifyAdmin, verifyToken, verifyPermission } = require("../middleware/checkCustomer")

const router = express.Router()

router.post('/', verifyAdmin, addCustomerSubscription)
router.put('/:id', verifyAdmin, updateCustomerSubscription)
router.get('/:id', verifyToken, getCustomerSubscription)
router.get('/:custId', verifyPermission, getAllCustomerSubscriptionforCustomer) // This can be for customer/Admin
router.get('/', verifyAdmin, getAllCustomerSubscription)
router.delete('/:id', verifyAdmin, deleteSubscription)

module.exports = router

// customerA (multiple customerSubscriptions): {customerSubscriptinList:[{id:"", custId:A},{id:"", custId:A}] }
// customerA --> 2, customerB --> 3 (5 entries are in DB) 

// customer & Admin:
// GET (/:id) --> fetches a particular custSubId for his profile
// GET (/) --> fetches all the custSubIds for his profile

// Admin:
// GET (/:id) --> fetches a particular custSubId for his profile
// GET (/:custId) --> fetches all the custSubIds for a customer

// GET (/all) --> fetch all the custSubIds (for custA, custB)

// Conclusion:

// GET (/:id) --> fetches a particular custSubId (Admin/ Customer)
// GET (/all) --> fetch all the custSubIds from db (for all users) (Only Admin)
// GET (/:custId) --> fetches all the custSubIds for a customer (Admin & Customer)
