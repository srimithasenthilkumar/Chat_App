const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");

// 🔐 GET logged-in user profile
router.get(
	"/profile",
	authorization,
	wrapAsync(userControllers.getAuthUser)
);

// 👥 GET all users except current user
router.get(
	"/users",
	authorization,
	wrapAsync(userControllers.getAllUsers)
);

// 🖼️ UPDATE PROFILE IMAGE
router.put(
	"/update-image",
	authorization,
	wrapAsync(userControllers.updateProfileImage)
);

module.exports = router;