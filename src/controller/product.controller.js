const { resSuccess, resError } = require("../utils/response");
const SuccessConstants = require("../constants/success.constants");
const Product = require("../models/product");

exports.createProduct = async (req, res) => {
  try {
    const pictures = req.files.map((file) => file.path);

    const product = new Product({ ...req.body, pictures });
    console.log("pi", product);

    await product.save();
    return res.send(resSuccess(SuccessConstants.PRODUCT_CREATED, 201, product));
  } catch (err) {
    return res.status(500).send(resError(err.message, 500));
  }
};
