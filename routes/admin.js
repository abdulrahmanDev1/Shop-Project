const {
    body
} = require('express-validator');
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product',
    [body('title', 'Title must be at least 3 characters long.')
        .isString()
        .isLength({
            min: 3
        })
        .trim(),
        body('price', 'Please enter a valid Price.')
        .isFloat(),
        body('description', 'Description must be at least 5 characters long.')
        .isLength({
            min: 5,
            max: 500
        })
        .trim()
    ], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [body('title', 'Title must be at least 3 characters long.')
        .isString()
        .isLength({
            min: 3
        })
        .trim(),
        body('price', 'Please enter a valid Price.')
        .isFloat(),
        body('description', 'Description must be at least 5 characters long.')
        .isLength({
            min: 5,
            max: 500
        })
        .trim()
    ], isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;