const express = require("express");
const router = express.Router();
const products = require("../controller/product.controller");
const upload = require("../middleware/uploadFiles");

router.post("/create", upload, products.createProduct);

module.exports = router;
