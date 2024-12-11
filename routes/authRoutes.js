const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const limiterLogin = require("../middleware/limiterLogin");

router.route("/").post(limiterLogin, authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;
