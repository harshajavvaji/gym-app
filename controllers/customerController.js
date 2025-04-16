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
  // Add validation
  if (!email) {
    throw new Error("Email cannot be empty");
  }
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
  try {
      const {
        name,
        role,
        dob,
        phoneNo,
        email,
        password,
        activeSubscriptionId,
        upcomingSubscriptionId,
        branch,
        profilePicture,
        height,
        weight,
      } = req.body;
      const customer = new Customer();
      const id = uuidv4();
      customer.id = id;
      customer.name = name;
      customer.role = role;
      customer.dob = dob;
      customer.phoneNo = phoneNo;
      customer.email = email;
      customer.activeSubscriptionId = activeSubscriptionId;
      customer.upcomingSubscriptionId = upcomingSubscriptionId;
      customer.password = password;
      customer.status = "newUser"; // by default would make it newUser when customer is created (should discuss)
      customer.branch = branch;
      customer.profilePicture = profilePicture;
      customer.height = height;
      customer.weight = weight;

      if (req.file) {
        customer.profilePicture = req.file.path;
      }

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
          process.env.KEY,
          { expiresIn: "1h" } // Set the token expiry to 1 hour
        );
        const data = await dynamoDB.put(params).promise();

        return res
          .status(201)
          .json({ message: "User created successfully", customer, token });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Internal server error", error });
      }
    ;
  } catch (error) {
    console.error("Registration error details:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character",
      });
    }

  try {
    const user = await checkEmailExists(email);
    console.log(user, "user record");
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
      process.env.KEY,
      {expiresIn : "1h"}
    );

    const { password: _ , ...userRecordWithoutPassword } = userRecord.Item; // Destructure to remove password from the response
    // const userRecordWithoutPassword = { ...userRecord.Item, password: undefined }; // Remove password from the response
    return res
      .status(200)
      .json({ message: "Logged in successfully", userRecord : userRecordWithoutPassword, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const loginAsAdmin = async (req, res) => {
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
    if (userRecord.Item.role != "Admin") {
      return res.status(403).json({ message: "Not allowed to login" });
    }
    const token = jwt.sign(
      { id: userRecord.Item.id, role: userRecord.Item.role },
      process.env.KEY,
      { expiresIn: "1h" } // Set the token expiry to 1 hour
    );
    const jwtExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 hour expiry
    return res
      .status(200)
      .json({ message: "Logged in successfully", userRecord, token, jwtExpiry });
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
  const { id } = req.params;
  const params2 = {
    TableName: process.env.CUSTOMERTABLENAME,
    Key: { id },
  };
  let customerToBeUpdated = {};
  try {
    const customer = await dynamoDB.get(params2).promise();
    if (Object.keys(customer).length == 0) {
      return res.status(404).json({ message: `Customer ${id} not found` });
    }
    customerToBeUpdated = customer.Item;
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

  const {
    name,
    password,
    role,
    dob,
    phoneNo,
    email,
    activeSubscriptionId,
    upcomingSubscriptionId,
    status,
    branch,
  } = req.body;
  if (req.customer.role == "Admin" && req.customer.id == id) {
    if (
      (email ? email != customerToBeUpdated.email : false) ||
      (status ? status != customerToBeUpdated.status : false)
    ) {
      return res.status(400).json({
        message: `You are not allowed to update id,email,status`,
      });
    }
    var customer = new Customer();
    customer = customerToBeUpdated;
    if (role) {
      customer.role = role;
    }
    if (activeSubscriptionId) {
      customer.activeSubscriptionId = activeSubscriptionId;
    }
    if (upcomingSubscriptionId) {
      customer.upcomingSubscriptionId = upcomingSubscriptionId;
    }
    if (branch) {
      customer.branch = branch;
      console.log(customer.branch, "test update");
    }
    if (name) {
      customer.name = name;
    }
    if (dob) {
      customer.dob = dob;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      customer.password = hashedPassword;
    }
    if (phoneNo) {
      customer.phoneNo = phoneNo;
    }
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      Item: customer,
    };
    const updatedCustomerData = await dynamoDB.put(params).promise();
    return res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } else if (req.customer.role == "Admin" && req.customer.id != id) {
    // || status || password || phoneNo || email || dob
    if (
      (name ? name != customerToBeUpdated.name : false) ||
      (status ? status != customerToBeUpdated.status : false) ||
      (password ? password != customerToBeUpdated.password : false) ||
      (phoneNo ? phoneNo != customerToBeUpdated.phoneNo : false) ||
      (email ? email != customerToBeUpdated.email : false) ||
      (dob ? dob != customerToBeUpdated.dob : false)
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this field" });
    }
    var customer = new Customer();
    customer = customerToBeUpdated;
    if (role) {
      customer.role = role;
    }
    if (activeSubscriptionId) {
      customer.activeSubscriptionId = activeSubscriptionId;
    }
    if (upcomingSubscriptionId) {
      customer.upcomingSubscriptionId = upcomingSubscriptionId;
    }
    if (branch) {
      customer.branch = branch;
    }
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      Item: customer,
    };
    const updatedCustomerData = await dynamoDB.put(params).promise();
    return res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } else if (req.customer.role == "member") {
    if (
      (activeSubscriptionId
        ? activeSubscriptionId != customerToBeUpdated.activeSubscriptionId
        : false) ||
      (role ? role != customerToBeUpdated.role : false) ||
      (upcomingSubscriptionId
        ? upcomingSubscriptionId != customerToBeUpdated.upcomingSubscriptionId
        : false) ||
      (status ? status != customerToBeUpdated.status : false) ||
      (email ? email != customerToBeUpdated.email : false) ||
      (branch ? branch != customerToBeUpdated.branch : false)
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this field" });
    }
    let customer = new Customer();
    customer = customerToBeUpdated;
    if (name) {
      customer.name = name;
    }
    if (dob) {
      customer.dob = dob;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      customer.password = hashedPassword;
    }
    if (phoneNo) {
      customer.phoneNo = phoneNo;
    }
    const params = {
      TableName: process.env.CUSTOMERTABLENAME,
      Item: customer,
    };
    const updatedCustomerData = await dynamoDB.put(params).promise();
    return res
      .status(200)
      .json({ message: "User updated successfully", customer });
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
    return res.status(200).json({
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
  loginAsAdmin,
};
