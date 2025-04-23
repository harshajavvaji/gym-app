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
  const { date, activities, inTime, outTime, weight } = req.body;
  try {
    if (!date || !inTime || !outTime) {
      return res
        .status(400)
        .json({ message: "Please provide date, inTime and outTime" });
    }
    const customerActivity = activities
      ? new CustomerActivity(activities, inTime, outTime, date)
      : new CustomerActivity(inTime, outTime, date);
    customerActivity.id = uuidv4();
    customerActivity.customerId = req.customer.id;
    if (weight) {
      customerActivity.weight = weight;
    }
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      Item: customerActivity,
    };

    const data = await dynamoDB.put(params).promise();
    return res.status(202).json({
      message: "Activity added successfully",
      activity: customerActivity,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const udpateCustomerActivity = async (req, res) => {
  const { id } = req.params;
  const params2 = {
    TableName: process.env.CUSTOMERTABLENAME,
    Key: {id},
  };
  let customerActivityToBeUpdated;
  try {
    const customer = await dynamoDB.get(params2).promise();
    customerActivityToBeUpdated = customer.Item;
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Internal server error1" });
  }
  const { activities, inTime, outTime, weight, date, resourceType } = req.body;
  if(req.customer.id !== customerActivityToBeUpdated.customerId){
    return res.status(401).json({message : "Not allowed to update another customer Activity"})
  }
  var customerActivity = new CustomerActivity()
  customerActivity = customerActivityToBeUpdated;
  if(activities){
    customerActivity.activities = activities;
  }
  if(inTime){
    customerActivity.inTime = inTime;
  }
  if(outTime){
    customerActivity.outTime = outTime;
  }
  if(date){
    customerActivity.date = date;
  }
  if(weight){
    customerActivity.weight = weight;
  }
  if(resourceType){
    customerActivity.resourceType = resourceType;
  }
  const params = {
    TableName : process.env.CUSTOMERTABLENAME,
    Item : customerActivity
  }
  try {
    const updatedCustomerActivityData = await dynamoDB.put(params).promise()
    return res.status(200).json({message: "Customer Activity updated successfully", customerActivity})
  } catch (error) {
    console.log("error", error)
    return res.status(500).json({message: "Internal Server Error"})
  }
  

};

const deleteCustomerActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      Key: { id },
    };

    const customerActivity = await dynamoDB.delete(params).promise();
    if (Object.keys(customerActivity).length == 0) {
      return res.status(400).json({ message: `Activity {id} not found` });
    }
    return res.staus(200).json({ message: "Activity deleted succesfully" });
  } catch (error) {
    console.log("Error", error);
    return res.staus(500).json({ message: "Internal server error" });
  }
};

const getCustomerActivityByMonth = async (req, res) => {
  return res
    .status(200)
    .json({ message: "Activity fetched for month successfully" });
};

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
      return res
        .status(403)
        .json({ message: "You are not allowed to access this activity" });
    }
    return res.status(200).json(customerActivity.Item);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addCustomerActivity,
  udpateCustomerActivity,
  deleteCustomerActivity,
  getCustomerActivityByMonth,
  getCustomerActivityById,
};
