const { Customer } = require("../schemas/schemas");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { DynamoDB } = require("aws-sdk");
require("dotenv").config();

const AWS = require("aws-sdk");
// Configure AWS SDK
AWS.config.update({
  region: process.env.REGION, // Replace with your region
  accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
  secretAccessKey: process.env.SECRETACCESSKEY, // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function checkEmailExists(email) {
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    IndexName: "email-index",
    KeyConditionExpression: "email =:email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };
  try {
    const result = await dynamoDB.query(params).promise();
    return { count: result.Count, Items: result.Items };
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function checkIdExists(id) {
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    KeyConditionExpression: "id =:id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  };
  try {
    const result = await dynamoDB.query(params).promise();
    return { count: result.Count, Items: result.Items };
  } catch (error) {
    console.error("Error checking ID:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    branch,
  } = req.body;
  const customer = new Customer();
  const id = uuidv4();
  customer.id = id;
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
    Item: customer,
  };

  try {
    const user = await checkEmailExists(customer.email);
    if (user.count > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(customer.password, salt);

    customer.password = hashedPassword;
    const token = jwt.sign(
      { id: customer.id, role: customer.role },
      process.env.KEY
    );
    const data = await dynamoDB.put(params).promise();

    return res
      .status(201)
      .json({ message: "User created successfully", customer, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error1", error });
  }
};

async function getUserRecord(id) {
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    Key: { id: id },
  };

  try {
    const userRecord = await dynamoDB.get(params).promise();
    return userRecord;
  } catch (error) {
    return false;
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await checkEmailExists(email);
    if (user.count == 0) {
      return res
        .status(400)
        .json({ message: "Email does not exist, Register and try" });
    }
    const userRecord = await getUserRecord(user.Items[0].id);
    const status = await bcrypt.compare(password, userRecord.Item.password);
    if (!status) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: userRecord.Item.id, role: userRecord.Item.role },
      process.env.KEY
    );
    return res
      .status(200)
      .json({ message: "Logged in successfully", userRecord, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    Key: {
      id: id,
    },
  };
  try {
    const user = await checkIdExists(id);
    if (user.count == 0) {
      return res.status(404).json({ message: "Customer doesnot exist" });
    }
    // Deletes an entry from customer table with primary key as Id
    await dynamoDB.delete(params).promise();
    return res.status(204).json();
    // return res.status(204);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to delete Customer entry", error });
  }
};

const updateCustomer = async (req, res) => {
  const {
    id,
    name,
    password,
    role,
    age,
    phoneNo,
    email,
    activeSubscriptionId,
    upcomingSubscriptionId,
    status,
    branch,
  } = req.body;
  if (req.customer.role == "Admin") {
    if (id || name || password || phoneNo || email || age) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this field" });
    }
    var customer = new Customer()
    customer = req.customer
    if(role){
      customer.role = role
    }
    if(activeSubscriptionId){
      customer.activeSubscriptionId = activeSubscriptionId
    }
    if(upcomingSubscriptionId){
      customer.upcomingSubscriptionId = upcomingSubscriptionId
    }
    if(status){
      customer.status = status
    }
    if(branch){
      customer.branch = branch
    }
    console.log(customer)
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      Item: customer
    }
    const updatedCustomerData = await dynamoDB.put(params).promise()
    return res.status(200).json({message: "Customer updated successfully", customer})
  } else if (req.customer.role == "member") {
    if (
      id ||
      activeSubscriptionId ||
      role ||
      upcomingSubscriptionId ||
      email ||
      status ||
      branch
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this field" });
    }
    let customer = new Customer()
    customer = req.customer
    if(name){
      customer.name = name
    }
    if(age){
      customer.age = age
    }
    if(password){
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      customer.password = hashedPassword;
    }
    if(phoneNo){
      customer.phoneNo = phoneNo
    }
    const updatedCustomerData = await dynamoDB.put(params).promise();
    return res.status(200).json({message: "User updated successfully", updatedCustomerData})
  }
};

const getCustomer = async (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    Key: { id },
  };

  try {
    const customer = await dynamoDB.get(params).promise();
    if (Object.keys(customer).length == 0) {
      return res.status(404).json({ message: `Resource ${id} not found` });
    }
    return res.status(200).json(customer.Item);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCustomers = async (req, res) => {
  const { nextBookmark } = req.query;
  const params = {
    TableName: process.env.CUSTOMERTABLENAME,
    Limit: 10, //kept 10 as default value.
    ExclusiveStartKey: nextBookmark ? { id: nextBookmark } : null, //Expected format for nextBookmark is {id: "44a57314-f9a2-4920-86bc-1cf8010d7fee"}
  };
  try {
    const data = await dynamoDB.scan(params).promise();
    return res
      .status(200)
      .json({
        message: "Fetched Customers Successfully",
        customers: data.Items,
      });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = {
  register,
  login,
  deleteCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
};
