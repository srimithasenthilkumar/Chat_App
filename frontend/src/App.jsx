import React, { useEffect, useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Error from "./pages/Error";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import ProfileDetail from "./components/ProfileDetail";
import Loading from "./components/loading/Loading";
import GroupChatBox from "./components/chatComponents/GroupChatBox";
import NotificationBox from "./components/NotificationBox";

import socket from "./socket/socket";
import { updateAuth } from "./redux/slices/authSlice";

const Applayout = () => {
	const [toastPosition, setToastPosition] = useState("bottom-left");

	const dispatch = useDispatch();

	const isProfileDetails = useSelector((s) => s.condition.isProfileDetail);
	const isGroupChatBox = useSelector((s) => s.condition.isGroupChatBox);
	const isNotificationBox = useSelector((s) => s.condition.isNotificationBox);
	const isLoading = useSelector((s) => s.condition.isLoading);

	// 🔥 PROFILE IMAGE LISTENER
	useEffect(() => {
		socket.on("profile-image-changed", (data) => {
			console.log("App received:", data);

			dispatch(updateAuth({ image: data.image }));
		});

		return () => socket.off("profile-image-changed");
	}, [dispatch]);

	useEffect(() => {
		const handleResize = () => {
			setToastPosition(window.innerWidth >= 600 ? "bottom-left" : "top-left");
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div>
			<ToastContainer position={toastPosition} autoClose={3000} theme="dark" />

			<Header />
			<div className="h-16 md:h-20"></div>

			<div className="min-h-[85vh] p-2 sm:p-4 bg-gradient-to-tr to-black via-blue-900 from-black">
				<Outlet />

				{isProfileDetails && <ProfileDetail />}
				{isGroupChatBox && <GroupChatBox />}
				{isNotificationBox && <NotificationBox />}
			</div>

			{isLoading && <Loading />}
			<Footer />
		</div>
	);
};

const routers = createBrowserRouter([
	{
		path: "/",
		element: <Applayout />,
		children: [
			{ path: "/", element: <Home /> },
			{ path: "/signup", element: <SignUp /> },
			{ path: "/signin", element: <SignIn /> },
			{ path: "*", element: <Error /> },
		],
	},
]);

function App() {
	return (
		<Provider store={store}>
			<RouterProvider router={routers} />
		</Provider>
	);
}

export default App;