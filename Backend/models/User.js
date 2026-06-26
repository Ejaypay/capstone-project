const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["buyer", "seller"],
    default: "buyer"
  },
  storeName: {
    type: String,
    trim: true,
    default: ""
  },
  storeLocation: {
    type: String,
    trim: true,
    default: ""
  }
});

module.exports = mongoose.model("User",UserSchema);
