const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  grade: { type: String, required: true },
  skill: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  status: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  storeId: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema, 'products');