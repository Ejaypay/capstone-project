const express = require('express');
const router = express.Router();
const { getProducts, updateProductInventory, addProduct } = require('../controllers/productController');

router.get('/', getProducts);

router.put('/:id', updateProductInventory);

router.post('/', addProduct);

module.exports = router;