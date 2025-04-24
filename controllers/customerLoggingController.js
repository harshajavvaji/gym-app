const { Customer, CustomerActivity, Activity } = require("../schemas/schemas");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { getCustomerLog } = require("../services/customerLogs");

const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.REGION, // Replace with your region
  accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
  secretAccessKey: process.env.SECRETACCESSKEY, // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const addCustomerActivity = async (req, res) => {
  let { date, activities, inTime, outTime, weight, waterIntake, calorieIntake } = req.body;
  try {
    if (!date || !inTime || !outTime) {
      return res
        .status(400)
        .json({ message: "Please provide date, inTime and outTime" });
    }
    console.log("date before changing", date);
    if (date.toString().length != 13) {
      // if not in milliseconds then convert to it.
      date = date * 1000;
    }
    console.log("date after changing", date);
    const customerActivity = activities
      ? new CustomerActivity(activities, inTime, outTime, date)
      : new CustomerActivity(inTime, outTime, date);
    if(waterIntake){
      customerActivity.waterIntake = waterIntake
    }
    if(calorieIntake){
      customerActivity.calorieIntake = calorieIntake
    }
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
    Key: { id },
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
  if (req.customer.id !== customerActivityToBeUpdated.customerId) {
    return res
      .status(401)
      .json({ message: "Not allowed to update another customer Activity" });
  }
  var customerActivity = new CustomerActivity();
  customerActivity = customerActivityToBeUpdated;
  if (activities) {
    customerActivity.activities = activities;
  }
  if (inTime) {
    customerActivity.inTime = inTime;
  }
  if (outTime) {
    customerActivity.outTime = outTime;
  }
  if (date) {
    customerActivity.date = date;
  }
  if (weight) {
    customerActivity.weight = weight;
  }
  if (resourceType) {
    customerActivity.resourceType = resourceType;
  }
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    Item: customerActivity,
  };
  try {
    const updatedCustomerActivityData = await dynamoDB.put(params).promise();
    return res.status(200).json({
      message: "Customer Activity updated successfully",
      customerActivity,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error" });
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

const getCustomerActivityByTimeRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  console.log("startDate", startDate);
  console.log("endDate", endDate);
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Please provide startDate and endDate" });
  }

  try {
    // Create Date objects for start and end of day
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const startTimestamp = startDateTime.getTime();
    const endTimestamp = endDateTime.getTime();

    console.log("startTimestamp", startTimestamp);
    console.log(typeof startTimestamp, typeof endTimestamp, "types");
    console.log("endTimestamp", endTimestamp);
    // Validate the dates
    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({
        message: "Invalid date format. Please use YYYY-MM-DD format",
      });
    }
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      IndexName: "resourceType-date-index", // Your GSI name
      KeyConditionExpression:
        "resourceType = :resourceType AND #date BETWEEN :startDate AND :endDate",
      FilterExpression: "customerId = :customerId",
      ExpressionAttributeNames: {
        "#date": "date", // date is a reserved word in DynamoDB
      },
      ExpressionAttributeValues: {
        ":resourceType": "activity",
        ":startDate": startTimestamp,
        ":endDate": endTimestamp,
        ":customerId": req.customer.id, // customerId is a projected field in the gsi created.
      },
    };

    const data = await dynamoDB.query(params).promise();
    if (data.Items.length == 0) {
      return res.status(200).json({
        message: "Activities fetched successfully",
        activities: [],
      });
    }
    const ids = data.Items.map((item) => {
      return { id: item.id };
    });
    console.log(ids, "ids");

    let getParams = {
      RequestItems: {
        [process.env.CUSTOMERTABLENAME]: {
          Keys: ids,
        },
      },
    };
    let activities = [];
    try {
      // batch processing is more efficent than querying for each item.
      const result = await dynamoDB.batchGet(getParams).promise();
      console.log(result.Responses, "result");
      activities = result.Responses.customers;

      // Optional: check for unprocessed keys
      if (
        result.UnprocessedKeys &&
        Object.keys(result.UnprocessedKeys).length > 0
      ) {
        console.warn("Some keys were not processed:", result.UnprocessedKeys);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
    return res.status(200).json({
      message: "Activities fetched successfully",
      activities: activities,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error, data: error?.__type });
  }
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
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addCustomerActivity,
  udpateCustomerActivity,
  deleteCustomerActivity,
  getCustomerActivityByTimeRange,
  getCustomerActivityById,
};
