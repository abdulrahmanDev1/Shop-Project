const {
    body
} = require('express-validator');
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
    [body('title', 'Title must be at least 3 characters long.')
        .isString()
        .isLength({
            min: 3
        })
        .trim(),
        body('imageUrl', 'Please enter a valid Url.')
        .isURL(),
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
        body('imageUrl', 'Please enter a valid Url.')
        .isURL(),
        body('price', 'Please enter a valid Price.')
        .isFloat(),
        body('description', 'Description must be at least 5 characters long.')
        .isLength({
            min: 5,
            max: 500
        })
        .trim()
    ], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;