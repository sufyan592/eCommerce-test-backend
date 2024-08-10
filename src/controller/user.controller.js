const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { resSuccess, resError } = require("../utils/response");
const ErrorConstants = require("../constants/error.constants");
const SuccessConstants = require("../constants/success.constants");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send(resError(ErrorConstants.EMPTY_USER_DETAILS, 401));
    }
    const user = await User.findOne({ email: email });
    const correct = await user.compairePass(password, user.password);

    if (!user || !correct) {
      return res.send(resError(ErrorConstants.ACCOUNT_NOT_FOUND, 404));
    }
    const screate_key= process.env.SCREATE_KEY || 'base64UrlEncode(header) + "." +'
    const token = jwt.sign({ id: user._id }, screate_key, {
      expiresIn: "6d",
    });

    return res.send(resSuccess(SuccessConstants.LOGIN_SUCCESS, 200, token));
  } catch (err) {
    return res.status(500).send(resError(err.message, 500));
  }
};
