const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid")
const { Subscription } = require("../schemas/schemas")


AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const addSubscription = async (req, res) => {

    const { name, type, amount, validity, isActive } = req.body
    const id = uuidv4();
    const subscription = new Subscription()
    subscription.id = id
    subscription.name = name
    subscription.type = type
    subscription.amount = amount
    subscription.validity = validity
    subscription.isActive = isActive

    const params = {
        TableName: process.env.SUBSCRIPTIONTABLENAME,
        Item: subscription
    };

    try {
        const data = await dynamoDB.put(params).promise();
        return res.status(201).json({ message: "Subscription Created Successfully", subscription })
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

const updateSubscription = async (req, res) => {
    res.status(200).send("Updated Subscription Successfully")
}

const getSubscription = async (req, res) => {

    const { id } = req.params
    const params = {
        TableName: process.env.SUBSCRIPTIONTABLENAME,
        Key: { id }
    }

    try {
        const subscription = await dynamoDB.get(params).promise()
        if(Object.keys(subscription).length==0){
            return res.status(404).json({message: `Resource ${id} not found`})
        }
        return res.status(200).json(subscription.Item)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const getSubscriptions = async (req, res) => {

    const { nextBookmark } = req.query
    const params = {
        TableName: process.env.SUBSCRIPTIONTABLENAME,
        Limit: 10, //kept 10 as default value.
        ExclusiveStartKey: nextBookmark ? { id: nextBookmark } : null //Expected format for nextBookmark is {id: "44a57314-f9a2-4920-86bc-1cf8010d7fee"}
    }
    try {
        const data = await dynamoDB.scan(params).promise()
        return res.status(200).json({ message: "Fetched Subscriptions Successfully", subscriptions: data.Items })
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

const deleteSubscription = async (req, res) => {
    res.status(204).send("Deleted Subscription Successfully")
}


module.exports = { addSubscription, updateSubscription, getSubscription, getSubscriptions, deleteSubscription }