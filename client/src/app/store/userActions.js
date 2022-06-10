import axios from "axios";
import { toast } from "react-toastify";
import { toastOnError, updateErrorToast } from "./utils";
import { userSliceActions } from "./userSlice";

export const setAuthorizationHeader = (token) => {
  typeof token !== "undefined" && token
    ? axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    : delete axios.defaults.headers.common["Authorization"];
};

export const setUserData = () => async (dispatch) => {
  try {
    const res = await axios.get("/users/getPersonalData");

    const { user, token } = res.data;

    const userData = {
      name: user.name,
      email: user.email,
      id: user._id,
    };

    localStorage.setItem("jwt_token", token);
    setAuthorizationHeader(token);
    dispatch(
      userSliceActions.setUser({
        user: userData,
        token,
        allBoards: user.boards,
      })
    );
  } catch (err) {
    toastOnError(err);

    localStorage.removeItem("jwt_token");
    setAuthorizationHeader(null); //* enforce manual login
    dispatch(userSliceActions.failedSettingUser());
  }
};

export const login = (email, password) => async (dispatch) => {
  const notif = toast.loading("Please wait...", { theme: "dark" });
  dispatch(userSliceActions.loginIn(true));

  try {
    const res = await axios.post("users/login", { email, password });

    toast.update(notif, {
      render: `Welcome, ${res.data.name}`,
      type: "success",
      isLoading: false,
      theme: "dark",
      autoClose: 2500,
    });

    setAuthorizationHeader(res.data.token);
    localStorage.setItem("jwt_token", res.data.token);

    dispatch(setUserData());
  } catch (err) {
    updateErrorToast(err, notif);

    setAuthorizationHeader(null);
    localStorage.removeItem("jwt_token");

    dispatch(userSliceActions.logout());
  }
};

export const signup = (email, password, name) => async (dispatch) => {
  const notif = toast.loading("Please wait...", { theme: "dark" });
  dispatch(userSliceActions.loginIn(true));

  try {
    const res = await axios.post("users/signup", { name, email, password });

    toast.update(notif, {
      render: `Welcome, ${name}`,
      type: "success",
      isLoading: false,
      theme: "dark",
      autoClose: 2500,
    });

    setAuthorizationHeader(res.data.token);
    localStorage.setItem("jwt_token", res.data.token);

    dispatch(setUserData());
  } catch (err) {
    dispatch(userSliceActions.loginIn(false));
    updateErrorToast(err, notif);

    setAuthorizationHeader(null);
    localStorage.removeItem("jwt_token");

    dispatch(userSliceActions.logout());
  }
};

export const logout = () => (dispatch) => {
  toast.success("Logged out!", { theme: "dark" });
  setAuthorizationHeader(null);
  localStorage.removeItem("jwt_token");

  dispatch(userSliceActions.logout());
};
