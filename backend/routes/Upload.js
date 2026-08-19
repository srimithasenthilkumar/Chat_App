const express = require("express");
const router = express.Router();

const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post(
	"/",
	upload.single("image"),
	async (req, res) => {
		try {
			const result = await cloudinary.uploader.upload(
				req.file.path
			);

			res.json({
				imageUrl: result.secure_url,
			});
		} catch (error) {
			res.status(500).json({
				message: error.message,
			});
		}
	}
);

module.exports = router;