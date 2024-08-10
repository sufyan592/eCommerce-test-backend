const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  pictures: {
    type: [String],
    validate: {
      validator: function (v) {
        return v.length >= 0 && v.length <= 6;
      },
      message: (props) =>
        `${props.value.length} pictures provided, but the number of pictures should be between 1 and 6.`,
    },
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
