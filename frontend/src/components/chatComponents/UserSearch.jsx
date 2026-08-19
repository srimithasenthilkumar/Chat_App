import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
	setChatLoading,
	setLoading,
	setUserSearchBox,
} from "../../redux/slices/conditionSlice";
import { toast } from "react-toastify";
import ChatShimmer from "../loading/ChatShimmer";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import socket from "../../socket/socket";

const UserSearch = () => {
	const dispatch = useDispatch();

	const isChatLoading = useSelector(
		(store) => store?.condition?.isChatLoading
	);

	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [inputUserName, setInputUserName] = useState("");
	const authUserId = useSelector((store) => store?.auth?._id);

	// 🔥 GET ALL USERS
	useEffect(() => {
		const getAllUsers = () => {
			dispatch(setChatLoading(true));

			const token = localStorage.getItem("token");
			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => res.json())
				.then((json) => {
					setUsers(json.data || []);
					setSelectedUsers(json.data || []);
					dispatch(setChatLoading(false));
				})
				.catch((err) => {
					console.log(err);
					dispatch(setChatLoading(false));
				});
		};

		getAllUsers();
	}, [dispatch]);

	// 🔥 SEARCH FILTER
	useEffect(() => {
		setSelectedUsers(
			users.filter((user) => {
				const search = inputUserName.toLowerCase();

				return (
					user.firstName?.toLowerCase().includes(search) ||
					user.lastName?.toLowerCase().includes(search) ||
					user.email?.toLowerCase().includes(search)
				);
			})
		);
	}, [inputUserName, users]);

	// 🔥 CREATE CHAT
	const handleCreateChat = async (userId) => {
		dispatch(setLoading(true));

		const token = localStorage.getItem("token");

		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ userId }),
		})
			.then((res) => res.json())
			.then((json) => {
				dispatch(addSelectedChat(json?.data));
				dispatch(setLoading(false));

				socket.emit("chat created", json?.data, authUserId);

				toast.success("Created & Selected chat");

				dispatch(setUserSearchBox());
			})
			.catch((err) => {
				console.log(err);
				toast.error(err.message);
				dispatch(setLoading(false));
			});
	};

	// 🔥 REAL-TIME PROFILE IMAGE UPDATE
	useEffect(() => {
		socket.on("profile-image-changed", (data) => {
			console.log("UserSearch received:", data);

			setUsers((prev) =>
				prev.map((user) =>
					user._id === data.userId
						? { ...user, image: data.image }
						: user
				)
			);

			setSelectedUsers((prev) =>
				prev.map((user) =>
					user._id === data.userId
						? { ...user, image: data.image }
						: user
				)
			);
		});

		return () => {
			socket.off("profile-image-changed");
		};
	}, []);

	return (
		<>
			{/* HEADER */}
			<div className="p-6 w-full h-[7vh] font-semibold flex justify-between items-center bg-slate-800 text-white border-slate-500 border-r">

				<h1 className="mr-2 whitespace-nowrap">New Chat</h1>

				<div className="w-2/3 flex items-center gap-2">

					<input
						id="search"
						type="text"
						placeholder="Search Users..."
						className="w-full border border-slate-600 py-1 px-2 font-normal outline-none rounded-md bg-transparent"
						onChange={(e) => setInputUserName(e.target.value)}
					/>

					<label htmlFor="search" className="cursor-pointer">
						<FaSearch />
					</label>

				</div>
			</div>

			{/* USERS LIST */}
			<div className="flex flex-col w-full px-4 gap-1 py-2 overflow-y-auto h-[73vh]">

				{selectedUsers.length === 0 && isChatLoading ? (
					<ChatShimmer />
				) : (
					<>
						{selectedUsers.length === 0 && (
							<div className="w-full h-full flex justify-center items-center text-white">
								<h1>No users registered.</h1>
							</div>
						)}

						{selectedUsers.map((user) => (
							<div
								key={user._id}
								className="w-full h-16 border border-slate-500 rounded-lg flex items-center p-2 gap-2 hover:bg-black/50 cursor-pointer text-white"
								onClick={() => handleCreateChat(user._id)}
							>

								<img
									className="h-12 w-12 rounded-full object-cover"
									src={user?.image}
									alt="user"
								/>

								<div className="w-full">

									<div className="capitalize font-semibold">
										{user?.firstName} {user?.lastName}
									</div>

									<div className="text-xs text-gray-300">
										{SimpleDateAndTime(user?.createdAt)}
									</div>

								</div>
							</div>
						))}
					</>
				)}
			</div>
		</>
	);
};

export default UserSearch;