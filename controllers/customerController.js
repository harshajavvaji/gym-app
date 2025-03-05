const { Customer } = require("../schemas/schemas")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid');
const { DynamoDB } = require("aws-sdk");
require('dotenv').config()

const AWS = require('aws-sdk');
// Configure AWS SDK
AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function checkEmailExists(email) {
    const params = {
        TableName: process.env.CUSTOMERTABLENAME,
        IndexName: 'email-index',
        KeyConditionExpression: 'email =:email',
        ExpressionAttributeValues: {
            ':email': email
        }
    }
    try {
        const result = await dynamoDB.query(params).promise();
        return result.Items.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

const register = async (req, res) => {
    const {
        name,
        role,
        age,
        phoneNo,
        email,
        password,
        activeSubscriptionId,
        upcomingSubscriptionId,
        status,
        branch
    } = req.body;
    const customer = new Customer();
    const id = uuidv4();
    customer.id = id
    customer.name = name;
    customer.role = role;
    customer.age = age;
    customer.phoneNo = phoneNo;
    customer.email = email;
    customer.activeSubscriptionId = activeSubscriptionId;
    customer.upcomingSubscriptionId = upcomingSubscriptionId;
    customer.password = password;
    customer.status = status;
    customer.branch = branch;

    const params = {
        TableName: process.env.CUSTOMERTABLENAME,
        Item: customer
    }

    try {
        checkEmailExists(customer.email).then(exists => {
            if (exists) {
                return res.status(400).json({ message: 'Email already exists' })
            }
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(customer.password, salt);

        customer.password = hashedPassword;
        const token = jwt.sign({ Id: customer.id, role: customer.role }, process.env.KEY)
        const data = await dynamoDB.put(params).promise()

        res.status(201).json({ message: "User created successfully", customer, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })
    }
}

const getCustomer = async (req, res) => {

    const { id } = req.params
    const params = {
        TableName: process.env.CUSTOMERTABLENAME,
        Key: { id }
    }

    try {
        const customer = await dynamoDB.get(params).promise()
        if (Object.keys(customer).length == 0) {
            return res.status(404).json({ message: `Resource ${id} not found` })
        }
        return res.status(200).json(customer.Item)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const getCustomers = async (req, res) => {
    
    const { nextBookmark } = req.query
    const params = {
        TableName: process.env.CUSTOMERTABLENAME,
        Limit: 10, //kept 10 as default value.
        ExclusiveStartKey: nextBookmark ? { id: nextBookmark } : null //Expected format for nextBookmark is {id: "44a57314-f9a2-4920-86bc-1cf8010d7fee"}
    }
    try {
        const data = await dynamoDB.scan(params).promise()
        return res.status(200).json({ message: "Fetched Customers Successfully", customers: data.Items })
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

const deleteCustomer = async (req, res) => {
    res.status(204).json()
}

const updateCustomer = async (req, res) => {
    res.status(200).json("Updated customer successfully")
}

module.exports = { register, getCustomer, getCustomers, deleteCustomer, updateCustomer }