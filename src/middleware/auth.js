const { resError } = require("../utils/response");
const ErrorConstants = require("../constants/error.constants");
const jwt = require("jsonwebtoken");

exports.UserAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.send(resError(ErrorConstants.UNAUTHORIZED_USER, 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.send(resError(ErrorConstants.UNAUTHORIZED_USER, 401));
    }

    const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.send(resError(err.message, 500));
  }
};
