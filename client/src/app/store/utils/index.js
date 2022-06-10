import { toast } from "react-toastify";

const stringify = value => {
	return JSON.stringify(value).replace(/"/g, "");
};

export const toastOnError = error => {
	if (error.response && error.response.data.message) {
		//* known error
		toast.error(stringify(error.response.data.message), { theme: "dark" });
	} else if (error.response) {
		toast.error(stringify(error.response.data), { theme: "dark" });
	} else if (error.message) {
		toast.error(stringify(error.message), { theme: "dark" });
	} else {
		toast.error(stringify(error), { theme: "dark" });
	}
};

export const updateErrorToast = (error, notif) => {
	if (error.response) {
		toast.update(notif, { render: stringify(error.response.data.message), type: "error", isLoading: false, theme: "dark", autoClose: 2500 });
	} else if (error.message) {
		toast.update(notif, { render: stringify(error.message), type: "error", isLoading: false, theme: "dark", autoClose: 2500 });
	} else {
		toast.update(notif, { render: "An unknown error has occured, please try again", type: "error", isLoading: false, theme: "dark", autoClose: 2500 });
	}
};