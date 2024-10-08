const express = require("express");
const dotenv = require("dotenv");
const app = express();
const userRoutes = require("./routes/user.route");
const path = require("path");
const productRoutes = require("./routes/product.route");
require("./db/db");
const cors = require("cors");
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
const port = process.env.APP_PORT || 3006;

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
