const Product = require('../models/Product');
const mongoose = require('mongoose');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching products", error: error.message });
  }
};

const updateProductInventory = async (req, res) => {
  try {
    const { stock, status } = req.body;
    const productId = req.params.id;

    let existingProduct = null;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      existingProduct = await Product.findById(new mongoose.Types.ObjectId(productId));
    }
    
    if (!existingProduct) {
      existingProduct = await Product.findOne({ id: productId });
    }

    if (!existingProduct) {
      return res.status(404).json({ message: `Product ${productId} not found inside your database collection.` });
    }

    const finalStock = Math.max(0, Number(stock) || 0);
    let finalStatus = status;

    if (!finalStatus) {
      if (finalStock <= 0) {
        finalStatus = existingProduct.status === "Pre-order" ? "Pre-order" : "Out of Stock";
      } else if (finalStock <= 5) {
        finalStatus = "Low Stock";
      } else {
        finalStatus = existingProduct.status === "Pre-order" ? "Pre-order" : "Available";
      }
    }

    existingProduct.stock = finalStock;
    existingProduct.status = finalStatus;

    const updatedProduct = await existingProduct.save();
    res.status(200).json(updatedProduct);

  } catch (error) {
    console.error("Mongoose execution error during inventory transaction:", error);
    res.status(500).json({ message: "Server error updating inventory", error: error.message });
  }
};

const addProduct = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

module.exports = {
  getProducts,
  updateProductInventory,
  addProduct
};