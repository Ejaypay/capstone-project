const jwt = require("jsonwebtoken");

function auth(req,res,next){
 const authHeader = req.headers.authorization || "";
 const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

 if(!token) return res.status(401).json({message:"No token"});

 try {
   const verified = jwt.verify(token,process.env.JWT_SECRET);
   req.user = verified;

   next();
 } catch (error) {
   res.status(401).json({message:"Invalid or expired token"});
 }
}

auth.requireRole = (...roles) => (req,res,next) => {
 if(!req.user) return res.status(401).json({message:"Authentication required"});

 if(!roles.includes(req.user.role)) {
   return res.status(403).json({message:"You do not have permission to access this resource"});
 }

 next();
};

module.exports = auth;
