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
        const { id } = req.params;
        const params = {
            TableName: process.env.CUSTOMERSUBSCRIPTIONTABLENAME,
            Key : {
                id
            }
        }
        const customerSubscription = await dynamoDB.get(params).promise();
        if(Object.keys(customerSubscription).length == 0){
            return res.status(404).json({message: "No entry found"})
        }
        if(req.customer.id !== customerSubscription.customerId && req.customer.role !== "Admin"){
            return res.status(403).json({message: "Not allowed to perform this action"})
        }else{
            return res.status(200).json({ message: "CustomerSubscription fetched Successfully", customerSubscription})
        }
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
}
const getAllCustomerSubscription = async (req, res) => {
    const { nextBookmark } = req.query;
    const params = {
         TableName: process.env.CUSTOMERSUBSCRIPTIONTABLENAME,
         Limit: 1,
         ExclusiveStartKey : nextBookmark ? { id : nextBookmark}: null
    }
    try {
        const customerSubscriptions = await dynamoDB.scan(params).promise();
        if(Object.keys(customerSubscriptions).length == 0){
            return  res.status(404).json({message: "No entries found"})
        }
        return res.status(201).json({ message: "CustomerSubscriptions fetched for all customers Successfully", customerSubscriptions })
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
}
const deleteCustomerSubscription = async (req, res) => {
    const { id } = req.params;
    const params = {
        TableName : process.env.CUSTOMERSUBSCRIPTIONTABLENAME,
        Key : {
            id
        }
    }
    try {
        const customerSubscriptions = await dynamoDB.get(params).promise()
        console.log(customerSubscriptions)
        if(Object.keys(customerSubscriptions).length == 0){
            return res.status(404).json({message: `Resource ${id} not found`})
        }
        await dynamoDB.delete(params).promise();
        return res.status(204).json({ message: "CustomerSubscription deleted Successfully" })
    } catch (error) {
        
    }
}

const getAllCustomerSubscriptionforCustomer = async (req, res) => {
    const { custId } = req.params;
    const params = {
        TableName : process.env.CUSTOMERSUBSCRIPTIONTABLENAME,
        IndexName: "customerId-index",
        KeyConditionExpression: "customerId =:customerId",
        ExpressionAttributeValues: {
            ":customerId": custId,
        }
    }
    try {
        const customerSpecificSubscriptions = await dynamoDB.query(params).promise()
        if(Object.keys(customerSpecificSubscriptions).length == 0){
            return res.status(404).json({message: "No entries found"})
        }
        return res.status(200).json({ message: "CustomerSubscriptions fetched for a customer  Successfully", customerSpecificSubscriptions})   
    } catch (error) {
        return res.status(500).json({message: "Internal server error", error})
    }
}

module.exports = { updateCustomerSubscription, getAllCustomerSubscription, getCustomerSubscription, addCustomerSubscription, deleteCustomerSubscription, getAllCustomerSubscriptionforCustomer }