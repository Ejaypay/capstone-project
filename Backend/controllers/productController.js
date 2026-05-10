const Product = require("../models/Product");

// ADD PRODUCT (Admin use)
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// FILTER PRODUCTS (onhand / preorder / restock)
exports.filterProducts = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json(error.message);
  }
};