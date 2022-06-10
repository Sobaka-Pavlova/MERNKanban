const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", usersController.getUsers);

router.get("/user/:uid", usersController.getUserById);

router.post(
	"/signup",
	[
		check("name")
			.not()
			.isEmpty(),
		check("email")
			.normalizeEmail()
			.isEmail(),
		check("password").isLength({ min: 6 })
	],
	usersController.signup
);

router.post("/login", [
	check("email")
		.normalizeEmail()
		.isEmail(),
	check("password").isLength({ min: 6 })
], usersController.login);


router.use(checkAuth);

router.get("/getPersonalData", usersController.getOwnData);

module.exports = router;