const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.DB_CONNECTION || 'mongodb+srv://suuf786:2OLVlLVXHaj4qWMR@cluster0.ygrk4.mongodb.net/';
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database is connected Successfully.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

module.exports = mongoose;
