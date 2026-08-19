const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const corsOptions = {
	origin: process.env.FRONTEND_URL,
	methods: ["GET", "POST", "DELETE", "PUT"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const uploadRouter = require("./routes/upload");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");

app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// Root route
app.get("/", (req, res) => {
	res.json({
		message: "Welcome to Chat Application!",
		frontend_url: process.env.FRONTEND_URL,
	});
});

// Invalid routes
app.all("*", (req, res) => {
	res.json({ error: "Invalid Route" });
});

// Error handler
app.use((err, req, res, next) => {
	res.status(500).json({
		message: err.message || "Something Went Wrong!",
	});
});

// Connect DB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("Database Connected"))
	.catch((err) => console.log(err));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
	pingTimeout: 60000,
	transports: ["websocket"],
	cors: corsOptions,
});

global.io = io;

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
	console.log("Connected to socket.io:", socket.id);

	// setup user
	socket.on("setup", (userId) => {
		socket.join(userId);
		socket.emit("connected");
		console.log("User joined:", userId);
	});

	// chat join
	socket.on("join chat", (room) => {
		socket.join(room);
		socket.currentRoom = room;
		console.log("User joined Room:", room);
	});

	// typing
	socket.on("typing", (room) => {
		socket.in(room).emit("typing");
	});

	socket.on("stop typing", (room) => {
		socket.in(room).emit("stop typing");
	});

	// messages
	socket.on("new message", (newMessage) => {
		let chat = newMessage?.chat;

		chat?.users.forEach((user) => {
			if (user._id === newMessage.sender._id) return;
			socket.in(user._id).emit("message received", newMessage);
		});
	});

	// chat actions
	socket.on("clear chat", (chatId) => {
		socket.in(chatId).emit("clear chat", chatId);
	});

	socket.on("delete chat", (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			socket.in(user._id).emit("delete chat", chat._id);
		});
	});

	socket.on("chat created", (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			socket.in(user._id).emit("chat created", chat);
		});
	});

	// ⭐ NEW: PROFILE IMAGE UPDATE (IMPORTANT ADDITION)
	socket.on("profile-image-updated", (data) => {
		// broadcast to ALL users
		io.emit("profile-image-changed", data);

		console.log("Profile image updated:", data.userId);
	});

	// disconnect
	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

// Start server
server.listen(process.env.PORT || 3000, () => {
	console.log(`Server running on port ${process.env.PORT || 3000}`);
});