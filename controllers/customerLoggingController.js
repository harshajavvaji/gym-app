const { Customer } = require("../schemas/schemas");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { DynamoDB } = require("aws-sdk");
require("dotenv").config();

const AWS = require("aws-sdk");


const addCustomerActivity = async(req, res)=>{
    return res.status(202).json({message: "Activity added successfully"})
}

const udpateCustomerActivity = async(req, res)=>{
    return res.status(200).json({message: "Activity updated successfully"})
}

const deleteCustomerActivity = async(req, res)=>{
 return res.status(200).json({message: "Activity deleted successfully"})   
}

const getCustomerActivityByMonth = async(req, res)=>{
    return res.status(200).json({message: "Activity fetched for month successfully"})
}

const getCustomerActivityById = async(req, res)=>{
    return res.status(200).json({message: "Activity fetched by id successfully"})
}

module.exports = {addCustomerActivity, udpateCustomerActivity, deleteCustomerActivity, getCustomerActivityByMonth, getCustomerActivityById}