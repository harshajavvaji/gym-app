
class Customer {
    id;
    name;
    role;
    age;
    phoneNo;
    email;
    password;
    activeSubscriptionId;
    upcomingSubscriptionId;
    status; //Same as the customerSubscription status
    branch;
    // metdata = {
    //     updatedDate
    // }
}


class Subscription {
    id
    name
    type
    amount
    validity
    isActive
}

class CustomerSubscription {
    id
    subscriptionId
    status // active/inactive/expired
    customerId
    expiryDate // would be null if status is inactive
}

module.exports = { Subscription, Customer, CustomerSubscription }
