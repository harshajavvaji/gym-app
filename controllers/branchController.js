
const getBranches = async(req, res)=>{
    // For now would return a static response 
    return res.status(200).json({branches: ['Ahmedabad', 'Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai', 'Pune']})
}

module.exports = {getBranches}