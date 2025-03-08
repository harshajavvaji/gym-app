const addCustomerSubscription = async (req, res) => {
    return res.status(201).json({ message: "CustomerSubscription addded Successfully" })
}
const updateCustomerSubscription = async (req, res) => {
    return res.status(200).json({ message: "CustomerSubscription Updated Successfully" })
}
const getCustomerSubscription = async (req, res) => {
    return res.status(200).json({ message: "CustomerSubscription fetched Successfully" })
}
const getAllCustomerSubscription = async (req, res) => {
    return res.status(201).json({ message: "CustomerSubscriptions fetched for all customers Successfully" })
}
const deleteCustomerSubscription = async (req, res) => {
    return res.status(204).json({ message: "CustomerSubscription deleted Successfully" })
}

const getAllCustomerSubscriptionforCustomer = async (req, res) => {
    return res.status(200).json({ message: "CustomerSubscriptions fetched for a customer  Successfully" })
}

module.exports = { updateCustomerSubscription, getAllCustomerSubscription, getCustomerSubscription, addCustomerSubscription, deleteCustomerSubscription, getAllCustomerSubscriptionforCustomer }