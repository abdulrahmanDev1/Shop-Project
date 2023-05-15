// Import dependencies
const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');


// Handle GET request to display all products
exports.getProducts = (req, res, next) => {
  // Find all products and render them using a template engine
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle GET request to display a specific product detail page
exports.getProduct = (req, res, next) => {
  // Find the product with the given ID and render its detail page using a template engine
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle GET request to display the home page
exports.getIndex = (req, res, next) => {
  // Find all products and render the home page using a template engine
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle GET request to display the user's cart page
exports.getCart = (req, res, next) => {
  // Populate the user's cart with product data and render the cart page using a template engine
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle POST request to add a product to the user's cart
exports.postCart = (req, res, next) => {
  // Find the product with the given ID, add it to the user's cart, and redirect to the cart page
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

// Handle POST request to remove a product from the user's cart
exports.postCartDeleteProduct = (req, res, next) => {
  // Find the product with the given ID, remove it from the user's cart, and redirect to the cart page
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle POST request to create an order with the products in the user's cart
exports.postOrder = (req, res, next) => {
  // Populate the user's cart with product data, create an order with the products, and clear the user's cart
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: {
            ...i.productId._doc
          }
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// Handle GET request to display the user's orders
exports.getOrders = (req, res, next) => {
  // Find all orders created by the user and render them using a template engine
  Order.find({
      'user.userId': req.user._id
    })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true
      })
      pdfDoc.fontSize(14).text('Order ID: ' + order._id);
      pdfDoc.text('________________________________')
      let totalPrice = 0;
      order.products.forEach(p => {

        totalPrice += p.quantity * p.product.price

        pdfDoc.fontSize(14).text(p.product.title + ' - ' + p.quantity + ' x ' + '$' + p.product.price);
      });

      pdfDoc.fontSize(18).text('Total Price: $' + totalPrice);
      pdfDoc.end();
    })
    .catch(err => next(err));
};