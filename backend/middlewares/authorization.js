const { getUserIdFromToken } = require("../config/jwtProvider");
const User = require("../models/user");
const wrapAsync = require("./wrapAsync");

const authorization = wrapAsync(async (req, res, next) => {
	try {
		// Get token from header
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				message: "Token not found",
			});
		}

		// Decode token → get userId
		const userId = getUserIdFromToken(token);

		if (!userId) {
			return res.status(401).json({
				message: "Invalid token",
			});
		}

		// Find user in DB
		const user = await User.findById(userId).select("-password");

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		// Attach user to request
		req.user = user;

		next();
	} catch (error) {
		return res.status(401).json({
			message: "Unauthorized access",
			error: error.message,
		});
	}
});

module.exports = { authorization };