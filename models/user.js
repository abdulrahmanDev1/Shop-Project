// Require Mongoose module
const mongoose = require('mongoose');

// Assign Mongoose.Schema to a variable for convenience
const Schema = mongoose.Schema;

// Define user schema with required properties
const userSchema = new Schema({
  email: {
    type: String,
    required: true // Email is required
  },
  password: {
    type: String,
    required: true // Password is required
  },
  resetToken: String, // Reset token is optional
  resetTokenExpiration: Date, // Reset token expiration is optional
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true // Product ID is required
      },
      quantity: {
        type: Number,
        required: true // Quantity is required
      }
    }]
  }
});

// Add a method to the user schema to add a product to the cart
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

// Add a method to the user schema to remove a product from the cart
userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

// Add a method to the user schema to clear the cart
userSchema.methods.clearCart = function () {
  this.cart = {
    items: []
  };
  return this.save();
};

// Export the user schema as a model
module.exports = mongoose.model('User', userSchema);