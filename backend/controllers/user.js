const User = require("../models/user");

// 👤 GET LOGGED IN USER
const getAuthUser = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(404).json({ message: "User Not Found" });
		}

		res.status(200).json({
			success: true,
			data: req.user,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// 👥 GET ALL USERS (EXCEPT LOGGED IN USER)
const getAllUsers = async (req, res) => {
	try {
		const allUsers = await User.find({
			_id: { $ne: req.user._id },
		})
			.select("-password")
			.sort({ _id: -1 });

		res.status(200).json({
			success: true,
			data: allUsers,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// 🖼️ UPDATE PROFILE IMAGE
const updateProfileImage = async (req, res) => {
	try {
		const userId = req.user._id;
		const { imageUrl } = req.body;

		if (!imageUrl) {
			return res.status(400).json({
				success: false,
				message: "Image URL is required",
			});
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ image: imageUrl },
			{ new: true }
		).select("-password");

		res.status(200).json({
			success: true,
			message: "Profile image updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// 📦 EXPORT ALL CONTROLLERS
module.exports = {
	getAuthUser,
	getAllUsers,
	updateProfileImage,
};