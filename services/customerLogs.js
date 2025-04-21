const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION, // Replace with your region
    accessKeyId: process.env.ACCESSKEYID, // Replace with your access key ID
    secretAccessKey: process.env.SECRETACCESSKEY, // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getCustomerLog = async (id) => {
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
            return res.status(403).json({ message: "You are not allowed to access this activity" });
        }
        return res.status(200).json(customerActivity.Item);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { getCustomerLog }