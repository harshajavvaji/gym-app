const addSubscription = async (req, res) => {
    res.status(201).send("Added Subscription Successfully")
}

const updateSubscription = async (req, res) => {
    res.status(200).send("Updated Subscription Successfully")
}

const getSubscription = async (req, res) => {
    res.status(200).send("Fetched Subscription Successfully")
}

const getSubscriptions = async (req, res) => {
    res.status(200).send("Fetched Subscriptions Successfully")
}

const deleteSubscription = async (req, res) => {
   res.status(204).send("Deleted Subscription Successfully")
}


module.exports = { addSubscription, updateSubscription, getSubscription, getSubscriptions, deleteSubscription }