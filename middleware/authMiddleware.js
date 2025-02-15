const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// for protecting routes
const protect = async (req, res, next) => {
  console.log(req.user);   
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))  {
    try {
      console.log(req.headers.authorization);
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  
      console.log(decoded);
      req.user = await User.findById(decoded.id).select("-password");
      console.log(req.user);

      next();  

    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "No token provided: not authorized" });
  }
};     

//! for creating NEW group
const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized - admin only (in isAdmin authMiddleware)" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized (in isAdmin authMiddleware)" });
  }
};     

module.exports = { protect, isAdmin };
