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
            ':email' : email
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
                if(exists){
                    res.status(400).json({message: 'Email already exists'})
                } 
            });
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(customer.password, salt);

            customer.password = hashedPassword;
            const token = jwt.sign({Id: customer.id, role: customer.role},process.env.KEY)
            const data = await dynamoDB.put(params).promise()

            res.status(201).json({message: "User created successfully", customer, token});
        } catch (error) {
            res.status(500).json({message: "Internal server error", error})
        }
}

module.exports = { register }