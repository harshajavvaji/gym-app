const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid")
const { CustomerSubscription } = require("../schemas/schemas")

// Configure AWS SDK
AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY, // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const addCustomerSubscription = async (req, res) => {

    const { subscriptionId, status, customerId, expiryDate } = req.body
    const custSubscription = new CustomerSubscription()

    const id = uuidv4();
    custSubscription.id = id
    custSubscription.subscriptionId = subscriptionId
    // custSubscription.status = status //--> Should be calculated with logic
    custSubscription.customerId = customerId
    // custSubscription.expiryDate = expiryDate //--> Should be calculated with logic

    var custParams = {
        TableName: process.env.CUSTOMERTABLENAME,
        Key: {
            id: customerId
        }
    }
    var subParams = {
        TableName: process.env.SUBSCRIPTIONTABLENAME,
        Key: {
            id: subscriptionId
        }
    }

    try {
        let customer = await dynamoDB.get(custParams).promise()
        if (Object.keys(customer).length == 0) {
            return res.status(400).json({ message: `Customer ${customerId} not found` })
        }
        customer = customer.Item

        let subscription = await dynamoDB.get(subParams).promise()
        if(Object.keys(subscription).length==0){
            return res.status(400).json({message: `Subscription ${subscriptionId} not found`})
        }
        subscription = subscription.Item

        let months = Number((subscription.validity).slice(0, -1)) // validity would be in 3m/6m format
        let currentDate = new Date()
        
        let expiryTime = new Date(currentDate.setMonth(currentDate.getMonth() + months)).getTime()
        console.log("expiryTime", expiryTime)

        if (customer.status == "expired" || customer.status == "newUser") {
            customer.status = "active"
            custSubscription.status = "active"
            custSubscription.expiryDate = expiryTime
            customer.activeSubscriptionId = id // update this record as the activeSubscription of the customer
        }
        else {
            custSubscription.status = "inactive" // yet to be active (for future subscription)
            
            if (customer.upcomingSubscriptionId != "" && customer.upcomingSubscriptionId != undefined) {
                return res.status(400).json({ message: "Already a subscription is scheduled" })
            }
            else {
                customer.upcomingSubscriptionId = id
            }
        }

        var custSubParams = {
            TableName: process.env.CUSTOMERSUBSCRIPTIONTABLENAME,
            Item: custSubscription
        }
        custParams = {
            TableName: process.env.CUSTOMERTABLENAME,
            Item: customer
        }
        await dynamoDB.put(custParams).promise() // Update the customerRecord
        await dynamoDB.put(custSubParams).promise() // Insert the custSubscriptionRecord
        return res.status(201).json({ message: "CustomerSubscription addded Successfully", customerSubscription: custSubscription })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
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