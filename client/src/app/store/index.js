import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import currentBoardReducer from "./currentBoardSlice";

export const store = configureStore({
	reducer: {
		user: userReducer,
		currentBoard: currentBoardReducer,
	},
	devTools: process.env.NODE_ENV === "development",
});
