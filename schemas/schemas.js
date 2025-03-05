
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


class Subscription{
    id
    name
    type
    amount
    validity
    isActive
}


module.exports ={Subscription,Customer}