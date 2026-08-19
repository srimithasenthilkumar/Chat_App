import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		addAuth: (state, action) => {
			return action.payload;
		},

		removeAuth: () => {
			return null;
		},

		updateAuth: (state, action) => {
			if (!state) return state;

			return {
				...state,
				...action.payload,
			};
		},
	},
});

export const { addAuth, removeAuth, updateAuth } = authSlice.actions;

export default authSlice.reducer;