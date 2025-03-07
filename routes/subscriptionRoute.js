const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require("../middleware/checkCustomer")
const { addSubscription, getSubscription, getSubscriptions, deleteSubscription, updateSubscription } = require("../controllers/subscriptionController")

router.post("/", verifyAdmin, addSubscription)
router.get("/:id", getSubscription) // Doesn't have any authentication middleware, bcoz subscriptions available should be public
router.get("/", getSubscriptions)
router.delete("/:id", verifyAdmin, deleteSubscription)
router.put("/:id", verifyAdmin, updateSubscription)

module.exports = router