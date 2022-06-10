import React, { Suspense, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import { setAuthorizationHeader, setUserData } from "./app/store/userActions";
import { userSliceActions } from "./app/store/userSlice";

import LoadingSpinner from "./app/components/ui/spinner/LoadingSpinner";

import NavBar from "./app/components/navBar/navBar";

import "react-toastify/dist/ReactToastify.css";

const Auth = React.lazy(() => import("./app/pages/authenticate/authenticate"));
const AllBoards = React.lazy(() => import("./app/pages/allBoards/allBoards"));
const Board = React.lazy(() => import("./app/pages/singleBoard/singleBoard"));



const App = () => {
	const isAuth = useSelector(state => state.user.isAuthenticated);
	const isSettingUser = useSelector(state => state.user.isSettingUser);
	const dispatch = useDispatch();

	useEffect(() => {
		const jwt = localStorage.getItem("jwt_token");
		setAuthorizationHeader(jwt); 
		jwt ?
			dispatch(setUserData())
			:
			dispatch(userSliceActions.failedSettingUser());
	}, [dispatch]);

	function RequireAuth({ children, redirectTo }) {
		return isAuth ? children : <Navigate to={redirectTo} replace />;
	}


	return (
		<React.Fragment>
			<ToastContainer
				position="top-right"
				autoClose={3500}
				hideProgressBar={true}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			{isSettingUser ? <LoadingSpinner asOverlay />
				:
				<React.Fragment>
					{isAuth && <NavBar />}
					<Suspense fallback={<LoadingSpinner />}>
						<Routes>
							<Route path="/auth" element={<Auth />} />
							{/** Protected Routes */}
							<Route
								path="/user/boards"
								element={
									<RequireAuth redirectTo="/auth">
										<AllBoards />
									</RequireAuth>
								}
							/>
							<Route
								path="/user/boards/:board"
								element={
									<RequireAuth redirectTo="/auth">
										<Board />
									</RequireAuth>
								}
							/>

							{/** Redirect */}
							<Route path="*" element={isAuth ? <Navigate replace to="/user/boards" /> : <Navigate replace to='/auth' />} />

						</Routes>
					</Suspense>
				</React.Fragment>
			}
		</React.Fragment>
	);
};



export default App;