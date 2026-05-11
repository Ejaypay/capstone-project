const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
 name:String,
 description:String,
 price:Number,
 image:String,
 stock:Number,
 status:{
   type:String,
   enum:["onhand","preorder","restock"]
 }
});

module.exports = mongoose.model("Product",ProductSchema);