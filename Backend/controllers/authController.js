const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ALLOWED_ROLES = ["buyer", "seller", "admin"];

function sanitizeRole(role) {
 const normalized = String(role || "buyer").trim().toLowerCase();
 return ALLOWED_ROLES.includes(normalized) ? normalized : null;
}

function publicUser(user) {
 return {
   id: user._id,
   username: user.username,
   email: user.email,
   role: user.role,
   storeName: user.storeName || "",
   storeLocation: user.storeLocation || ""
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
   const {username,email,password,role,storeName,storeLocation,adminSecret} = req.body;
   const accountRole = sanitizeRole(role);
   const normalizedStoreName = String(storeName || "").trim();
   const normalizedStoreLocation = String(storeLocation || "").trim();

   if(!username || !email || !password) {
     return res.status(400).json({message:"Username, email, and password are required"});
   }

   if(!accountRole) {
     return res.status(400).json({message:"Role must be buyer, seller, or admin"});
   }

   if(accountRole === "admin") {
     if(!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
       return res.status(403).json({message:"Unauthorized to register as admin"});
     }
   }

   if(accountRole === "seller" && (!normalizedStoreName || !normalizedStoreLocation)) {
     return res.status(400).json({message:"Store name and location are required for seller accounts"});
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
     role: accountRole,
     storeName: accountRole === "seller" ? normalizedStoreName : "",
     storeLocation: accountRole === "seller" ? normalizedStoreLocation : ""
   });

   const token = createToken(user);

   res.status(201).json({token,user:publicUser(user)});
 } catch (error) {
   res.status(500).json({message:"Registration failed", error:error.message});
 }
};

exports.login = async(req,res)=>{
 try {
   const {email, password} = req.body;

   if(!email || !password) {
     return res.status(400).json({message:"Email and password are required"});
   }

   const user = await User.findOne({email:String(email).trim().toLowerCase()}).select("+password");
   if(!user) return res.status(400).json({message:"Invalid email or password"});

   const match = await bcrypt.compare(password, user.password);
   if(!match) return res.status(400).json({message:"Invalid email or password"});

   const token = createToken(user);

   res.json({token, user:publicUser(user)});
 } catch (error) {
   res.status(500).json({message:"Login failed", error:error.message});
 }
};