// app.js
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const app = express();
const port = 3000;

// Configure body-parser middleware
app.use(bodyParser.json());


app.get('/', (req, res) => {
    return res.send("Hello world connected to dynamodb");
})

console.log(process.env.SECRETACCESSKEY)

// Configure AWS SDK
AWS.config.update({
  region: 'eu-north-1', // Replace with your region
  accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
  secretAccessKey: process.env.SECRETACCESSKEY // Replace with your secret access key
});



const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Route to save a record
app.post('/save', (req, res) => {
  const { tableName, item } = req.body;
    console.log(req.body)

    // Generate a UUID
    const id = uuidv4();
    // console.log(id);  // Example output: '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
  const params = {
    TableName: tableName,
    Item: {
        id : id,
        name: item.name,
        email: item.email
    }
  };
  console.log(params);

  dynamoDB.put(params, (err, data) => {
    if (err) {
      console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
      res.status(500).send('Error saving the record');
    } else {
      console.log('Added item:', JSON.stringify(data, null, 2));
      res.status(200).send('Record saved successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});