const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const product = require("../controllers/productController");

// ADD PRODUCT (protected)
router.post("/add", authMiddleware, product.addProduct);

// GET ALL PRODUCTS
router.get("/", product.getProducts);

// FILTER PRODUCTS
router.get("/filter", product.filterProducts);

module.exports = router;