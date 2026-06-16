const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ALLOWED_ROLES = ["buyer", "seller"];

function sanitizeRole(role) {
 const normalized = String(role || "buyer").trim().toLowerCase();
 return ALLOWED_ROLES.includes(normalized) ? normalized : null;
}

function publicUser(user) {
 return {
   id: user._id,
   username: user.username,
   email: user.email,
   role: user.role
 };
}

function createToken(user) {
 return jwt.sign(
   {id:user._id, role:user.role},
   process.env.JWT_SECRET,
   {expiresIn:"1d"}
 );
}

exports.register = async(req,res)=>{
 try {
   const {username,email,password,role} = req.body;
   const accountRole = sanitizeRole(role);

   if(!username || !email || !password) {
     return res.status(400).json({message:"Username, email, and password are required"});
   }

   if(!accountRole) {
     return res.status(400).json({message:"Role must be buyer or seller"});
   }

   const normalizedEmail = String(email).trim().toLowerCase();
   const existingUser = await User.findOne({email: normalizedEmail});

   if(existingUser) {
     return res.status(409).json({message:"Email is already registered"});
   }

   const hashed = await bcrypt.hash(password,10);

   const user = await User.create({
     username,
     email: normalizedEmail,
     password:hashed,
     role: accountRole
   });

   const token = createToken(user);

   res.status(201).json({token,user:publicUser(user)});
 } catch (error) {
   res.status(500).json({message:"Registration failed", error:error.message});
 }
};

exports.login = async(req,res)=>{
 try {
   const {email,password,role}=req.body;

   if(!email || !password) {
     return res.status(400).json({message:"Email and password are required"});
   }

   const requestedRole = role ? sanitizeRole(role) : null;

   if(role && !requestedRole) {
     return res.status(400).json({message:"Role must be buyer or seller"});
   }

   const user = await User.findOne({email:String(email).trim().toLowerCase()}).select("+password");
   if(!user) return res.status(400).json({message:"User not found"});

   const storedRole = sanitizeRole(user.role) || "buyer";
   const shouldMigrateRole = user.role !== storedRole;

   const match = await bcrypt.compare(password,user.password);
   if(!match) return res.status(400).json({message:"Wrong password"});

   if(requestedRole && requestedRole !== storedRole) {
     return res.status(403).json({message:`This account is registered as ${storedRole}`});
   }

   if(shouldMigrateRole) {
     user.role = storedRole;
     await user.save();
   }

   const token = createToken(user);

   res.json({token,user:publicUser(user)});
 } catch (error) {
   res.status(500).json({message:"Login failed", error:error.message});
 }
};
