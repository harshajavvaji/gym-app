const express = require('express')
const router = express.Router()
const { addSubscription, getSubscription, getSubscriptions, deleteSubscription, updateSubscription } = require("../controllers/subscriptionController")

router.post("/", addSubscription)
router.get("/:id", getSubscription)
router.get("/", getSubscriptions)
router.delete("/:id", deleteSubscription)
router.put("/:id", updateSubscription)

module.exports = router