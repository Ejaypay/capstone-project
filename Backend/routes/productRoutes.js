const express = require('express');
const router = express.Router();
const { getProducts, updateProductInventory, addProduct } = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', getProducts);

router.put('/:id', auth, auth.requireRole('seller'), updateProductInventory);

router.post('/', auth, auth.requireRole('seller'), addProduct);

module.exports = router;
