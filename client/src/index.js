import React from "react";
import axios from "axios";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { store } from "./app/store";

import "./index.scss";


if (window.location.origin === "http://localhost:3000") {
	axios.defaults.baseURL = "http://localhost:5000/api";
} else {
	axios.defaults.baseURL = window.location.origin + "/api";
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<Provider store={store}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</Provider>
);
