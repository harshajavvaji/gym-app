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
        res.status(201).json({ message: "Subscription Created Successfully", subscription })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error })
    }
}

const updateSubscription = async (req, res) => {
    res.status(200).send("Updated Subscription Successfully")
}

const getSubscription = async (req, res) => {
    const { id } = req.params
    console.log(id)
    const params = {
        TableName: process.env.SUBSCRIPTIONTABLENAME,
        Key: { id }
    }

    try {
        const subscription = await dynamoDB.get(params).promise()
        // if(Object.keys(subscription).length==0){
        //     res.status(404).json({message: `Resource ${id} not found`})
        // }
        res.status(200).json({ subscription })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getSubscriptions = async (req, res) => {
    res.status(200).send("Fetched Subscriptions Successfully")
}

const deleteSubscription = async (req, res) => {
    res.status(204).send("Deleted Subscription Successfully")
}


module.exports = { addSubscription, updateSubscription, getSubscription, getSubscriptions, deleteSubscription }