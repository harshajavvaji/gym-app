const { Customer, CustomerActivity, Activity } = require("../schemas/schemas");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY, // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const addCustomerActivity = async (req, res) => {
    const { date, activities, inTime, outTime, weight } = req.body
    try {
        if (!date || !inTime || !outTime) {
            return res.status(400).json({ message: "Please provide date, inTime and outTime" })
        }
        const customerActivity = activities ? new CustomerActivity(activities, inTime, outTime, date) : new CustomerActivity(inTime, outTime, date)
        customerActivity.id = uuidv4()
        customerActivity.customerId = req.customer.id
        if (weight) {
            customerActivity.weight = weight
        }
        const params = {
            TableName: process.env.CUSTOMERTABLENAME,
            Item: customerActivity,
        };

        const data = await dynamoDB.put(params).promise();
        return res.status(202).json({ message: "Activity added successfully", activity: customerActivity })
    } catch (error) {
        console.log("Error", error)
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

const udpateCustomerActivity = async (req, res) => {
    return res.status(200).json({ message: "Activity updated successfully" })
}

const deleteCustomerActivity = async (req, res) => {
    return res.status(200).json({ message: "Activity deleted successfully" })
}

const getCustomerActivityByMonth = async (req, res) => {
    return res.status(200).json({ message: "Activity fetched for month successfully" })
}

const getCustomerActivityById = async (req, res) => {
    const { id } = req.params;
    const params = {
        TableName: process.env.CUSTOMERTABLENAME,
        Key: { id },
    };
    try {
        const customerActivity = await dynamoDB.get(params).promise();
        if (Object.keys(customerActivity).length == 0) {
            return res.status(404).json({ message: `Activity ${id} not found` });
        }
        if (customerActivity.Item.customerId !== req.customer.id) {
            return res.status(403).json({ message: "You are not allowed to access this activity" });
        }
        return res.status(200).json(customerActivity.Item);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { addCustomerActivity, udpateCustomerActivity, deleteCustomerActivity, getCustomerActivityByMonth, getCustomerActivityById }