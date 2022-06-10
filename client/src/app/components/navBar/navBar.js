import React from "react";
import Bookmark from "@material-ui/icons/Bookmark";
import { NavLink } from "react-router-dom";
import "./styles.scss";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/userActions";

const NavBar = () => {
	const isAuth = useSelector(state => state.user.isAuthenticated);
	const dispatch = useDispatch();

	return (
		<div>
			<nav>
				<div className="container">
					<div>
						<Bookmark />
						<NavLink className={"navlink"} to="/user/boards">All Boards</NavLink>
					</div>
					{isAuth &&
            <button className="logout" onClick={() => dispatch(logout())} >Logout</button>
					}
				</div>
			</nav>
		</div>
	);
};

export default NavBar;