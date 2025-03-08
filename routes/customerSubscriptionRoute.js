const express = require("express")
const { getAllCustomerSubscription, getCustomerSubscription, deleteCustomerSubscription, updateCustomerSubscription, addCustomerSubscription } = require("../controllers/customerSubscriptionController")
const { deleteSubscription } = require("../controllers/subscriptionController")
const { verifyAdmin } = require("../middleware/checkCustomer")

const router = express.Router()

route.post('/', verifyAdmin, addCustomerSubscription)
route.put('/:id', verifyAdmin, updateCustomerSubscription)
route.get('/:id', getCustomerSubscription)
route.get('/', getAllCustomerSubscription)
route.delete('/:id', deleteSubscription)

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
