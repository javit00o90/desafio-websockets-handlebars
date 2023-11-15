const express = require('express');
const router = express.Router();
const ProductManager = require('../classes/productManager');

const productManager = new ProductManager();


router.get('/', async (req, res) => {
    const products = await productManager.getProducts();

    res.render('home', {
        products
    });
});


module.exports = router;