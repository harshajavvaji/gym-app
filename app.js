const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const app = express();
const port = 5000;

app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.send("Hello world connected to GymApplication, Developed by Harsha & Sahana");
})

app.use("/api/customers", require("./routes/customerRoute"));
// app.use("/api/subscriptions", require("./routes/subscriptionRoute"));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});