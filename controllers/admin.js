// Import dependencies
const {
  validationResult
} = require('express-validator');
const Product = require('../models/product');

// Handle GET request to add a new product
exports.getAddProduct = (req, res, next) => {
  // Render the "edit-product" template with initial data
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasErrors: false,
    errorMessage: null,
    validationErrors: []
  });
};

// Handle POST request to add a new product
exports.postAddProduct = (req, res, next) => {
  // Extract form data from the request
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // Validate the form data using "express-validator"
  const errors = validationResult(req);

  // If there are validation errors, render the "edit-product" template with error messages and previously entered data
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasErrors: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  // If there are no validation errors, create a new product using the "Product" model and save it to the database
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // If there is an error during the process, pass the error to the error handler middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle GET request to edit an existing product
exports.getEditProduct = (req, res, next) => {
  // Check if the "edit" parameter is present in the query string
  const editMode = req.query.edit;
  if (!editMode) {
    // If not, redirect the user to the home page
    return res.redirect('/');
  }
  // Find the product with the given ID and render the "edit-product" template with the product data
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasErrors: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      // If there is an error during the process, pass the error to the error handler middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle POST request to update an existing product
exports.postEditProduct = (req, res, next) => {
  // Extract form data from the request
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  // Validate the form data using "express-validator"
  const errors = validationResult(req);

  // If there are validation errors, render the "edit-product" template with error messages and previously entered data
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasErrors: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  // If there are no validation errors, find the product with the given ID, update its fields with the new data, and save it to the database
  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      // If there is an error during the process, pass the error to the error handler middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle GET request to get all products created by the currently logged in user
exports.getProducts = (req, res, next) => {
  // Find all products created by the currently logged in user and render them using a template engine
  Product.find({
      userId: req.user._id
    })
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      // If there is an error during the process, pass the error to the error handler middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle POST request to delete a product with the given ID created by the currently logged in user
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Find the product with the given ID and delete it from the database
  Product.deleteOne({
      _id: prodId,
      userId: req.user._id
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // If there is an error during the process, pass the error to the error handler middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};