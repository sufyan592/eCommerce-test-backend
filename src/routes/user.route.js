const { Router } = require("express");
const user = require("../controller/user.controller");
const router = Router();

// router.post(
//   "/register",
//   [UserAuthMiddleware, uploadFiles("url")],
//   registerUser
// );
router.post("/login", user.login);

module.exports = router;
