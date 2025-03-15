const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')
require('dotenv').config()

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.send("Hello world connected to GymApplication, Developed by Harsha & Sahana");
})

app.use("/api/customers", require("./routes/customerRoute"));
app.use("/api/subscriptions", require("./routes/subscriptionRoute"));
app.use("/api/customerSubscriptions", require("./routes/customerSubscriptionRoute"))

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});