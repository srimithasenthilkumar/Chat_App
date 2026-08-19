import React from "react";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setProfileDetail } from "../redux/slices/conditionSlice";
import { updateAuth } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import socket from "../socket/socket";

const ProfileDetail = () => {
	const dispatch = useDispatch();
	const user = useSelector((store) => store.auth);

	// Upload Image Handler
	const handleUpdate = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("image", file);

		try {
			const response = await fetch(
				"http://localhost:5001/api/upload",
				{
					method: "POST",
					body: formData,
				}
			);

			const data = await response.json();

			if (!data.imageUrl) {
				toast.error("Upload failed");
				return;
			}

			toast.success("Image Uploaded Successfully");

			// ✅ 1. Update Redux (your UI)
			dispatch(updateAuth({ image: data.imageUrl }));

			// ✅ 2. Emit socket (other users UI)
			socket.emit("profile-image-changed", {
				userId: user._id,
				image: data.imageUrl,
			});
		} catch (error) {
			console.log(error);
			toast.error("Upload Failed");
		}
	};

	return (
		<div className="flex -m-2 sm:-m-4 flex-col items-center my-6 text-slate-300 min-h-screen w-full fixed top-0 justify-center z-50">

			<div className="p-3 pt-4 w-[80%] sm:w-[60%] md:w-[50%] lg:w-[40%] min-w-72 max-w-[1000px] border border-slate-400 bg-slate-800 rounded-lg h-fit mt-5 relative">

				{/* TITLE */}
				<h2 className="text-2xl underline underline-offset-8 font-semibold text-slate-100 w-full text-center mb-2">
					Profile
				</h2>

				<div className="w-full py-4 flex justify-evenly flex-wrap items-center gap-3">

					{/* USER INFO */}
					<div className="self-end">
						<h3 className="text-xl font-semibold p-1">
							Name : {user?.firstName} {user?.lastName}
						</h3>

						<h3 className="text-xl font-semibold p-1">
							Email : {user?.email}
						</h3>

						<button
							onClick={() => {
								localStorage.removeItem("token");
								window.location.reload();
							}}
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded mt-3 hidden sm:block"
						>
							Logout
						</button>
					</div>

					{/* IMAGE + ACTIONS */}
					<div className="self-end flex w-full sm:w-fit items-center justify-evenly sm:flex-col">

						<img
							src={user?.image}
							alt="user"
							className="w-24 h-24 rounded-full object-cover border-2 border-white"
						/>

						<div className="flex flex-col">

							<label className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-1.5 px-4 rounded sm:mt-3 cursor-pointer text-center">

								Update

								<input
									type="file"
									hidden
									accept="image/*"
									onChange={handleUpdate}
								/>
							</label>

							<button
								onClick={() => {
									localStorage.removeItem("token");
									window.location.reload();
								}}
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded mt-3 sm:hidden"
							>
								Logout
							</button>

						</div>
					</div>
				</div>

				{/* CLOSE BUTTON */}
				<div
					title="Close"
					onClick={() => dispatch(setProfileDetail())}
					className="bg-black/15 hover:bg-black/50 h-7 w-7 rounded-md flex items-center justify-center absolute top-2 right-3 cursor-pointer"
				>
					<MdOutlineClose size={22} />
				</div>

			</div>
		</div>
	);
};

export default ProfileDetail;