const jwt = require('jsonwebtoken')
const { Customer } = require('../schemas/schemas')
const { DynamoDB } = require('aws-sdk')
const AWS = require('aws-sdk');
// Configure AWS SDK
AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const key = process.env.KEY


const verifyToken = async (req, res, next) => {
    const token = req.header('token')
    if (!token) {
        return res.status(400).json({ message: 'Token not found' })
    }
    const customer = jwt.verify(token, key)
    if (!customer) {
        return res.status(400).json({ message: 'Customer data not retained' })
    }
    const params = {
        TableName: process.env.CUSTOMERTABLENAME,
        Key: { id: id }
    }
    try {
        const data = await dynamoDB.get(params).promise()
        if (!data.Item) {
            throw new Error("Item not found");
        }
        req.customer = data;
        console.log(req.customer)
        next();
    } catch (error) {
        console.error("Error fetching item:", error.message);
        return res.status(500).json({ message: "Not authorized" })
    }
}

const verifyAdmin = async (req,res,next) => {
    try {
        verifyToken(req, res, () => {
            if (req.customer.role == "Admin") {
                next()
            }
            else {
                return res.status(402).json({ message: "Not Authorized to perform this action." })
            }
        })
    } catch (error) {
        return res.status(402).json({ message: "Not Authorized to perform this action." })
    }
}

module.exports = { verifyToken, verifyAdmin };