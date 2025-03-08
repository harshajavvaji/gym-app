const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid")
const { CustomerSubscription } = require("../schemas/schemas")


AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const addCustomerSubscription = async (req, res) => {
    return res.status(201).json({ message: "CustomerSubscription addded Successfully" })
}
const updateCustomerSubscription = async (req, res) => {
    return res.status(200).json({ message: "CustomerSubscription Updated Successfully" })
}
const getCustomerSubscription = async (req, res) => {
    try {
        return res.status(200).json({ message: "CustomerSubscription fetched Successfully" })
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
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