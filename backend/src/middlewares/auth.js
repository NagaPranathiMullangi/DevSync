const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    
    //console.log("into feed user auth")
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).send("Please Login!");
    }


   
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
   // console.log(decodedObj);
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = {
  userAuth,
};
