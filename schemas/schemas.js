
class Customer {
    id;
    name;
    role;
    dob;
    phoneNo;
    email;
    password;
    activeSubscriptionId;
    upcomingSubscriptionId;
    status; //Same as the customerSubscription status
    branch;
    profilePicture;
    height;
    weight;
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
    name
    type // basic/super/premium
    price // price
}

class Activity {
    type
    calories
}

class CustomerActivity {
    id
    customerId
    activities
    date
    inTime
    outTime
    weight // optional, null if not provided
    resourceType // for identification in db.
    constructor(activities = [], inTime, outTime, date) {
        this.inTime = Number(inTime);
        this.outTime = Number(outTime);
        this.date = Number(date);
        this.activities = activities;  // Changed from activity:[Activity] to activities
        this.resourceType = 'activity' // for identification in db.
    }
}

// Usage example:
// const activity1 = new Activity('running', 500);
// const activity2 = new Activity('weightlifting', 300);
// const customerActivity = new CustomerActivity(
//     '1',
//     'customer123',
//     [activity1, activity2],
//     new Date(),
//     '09:00',
//     '10:00',
//     70
// );    


module.exports = { Subscription, Customer, CustomerSubscription, CustomerActivity, Activity }
