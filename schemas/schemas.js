
class Customer{
    id;
    name;
    role;
    age;
    phoneNo;
    email;
    password;
    activeSubscriptionId;
    upcomingSubscriptionId;
    status;
    branch;
    // metdata = {
    //     updatedDate
    // }
}


class Subscriptions{
    id
    name
    type
    amount
    validity
    isActive
}


module.exports ={Subscriptions,Customer}