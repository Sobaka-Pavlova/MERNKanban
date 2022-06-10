import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import Input from "./formElements/Input";

import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "./utils/validators";
import { useForm } from "./utils/hooks/form-hook";

import { login, signup } from "../../store/userActions";


import "./Auth.scss";

const Authenticate = () => {
	const isAuth = useSelector(state => state.user.isAuthenticated);
	const isLoading = useSelector(state => state.user.isLogginIn);
	const navigate = useNavigate();
	useEffect(() => {
		if (isAuth) {
			navigate("/user/boards", { replace: true });
		}
	}, [isAuth, navigate]);

	const [isLoginMode, setIsLoginMode] = useState(true);
	const dispatch = useDispatch();
	const [formState, inputHandler, setFormData] = useForm(
		{
			email: {
				value: "",
				isValid: false
			},
			password: {
				value: "",
				isValid: false
			}
		},
		false
	);

	const switchModeHandler = () => {
		if (!isLoginMode) {
			setFormData(
				{
					...formState.inputs,
					name: undefined,
				},
				formState.inputs.email.isValid && formState.inputs.password.isValid
			);
		} else {
			setFormData(
				{
					...formState.inputs,
					name: {
						value: "",
						isValid: false
					}
				},
				false
			);
		}
		setIsLoginMode(prevMode => !prevMode);
	};

	const authSubmitHandler = event => {
		event.preventDefault();
		const { email, password, name } = formState.inputs;
		if (isLoginMode) {
			dispatch(login(email.value, password.value));
		} else {
			dispatch(signup(email.value, password.value, name.value));
		}
	};


	return (
		<React.Fragment>
			<div className="card authentication">
				<form onSubmit={authSubmitHandler}>
					{!isLoginMode && (
						<Input
							id="name"
							type="text"
							label="Your Name"
							validators={[VALIDATOR_REQUIRE()]}
							errorText="Please enter a name."
							onInput={inputHandler}
						/>
					)}
					<Input
						id="email"
						type="email"
						label="E-Mail"
						validators={[VALIDATOR_EMAIL()]}
						errorText="Please enter a valid email address."
						onInput={inputHandler}
					/>
					<Input
						id="password"
						type="password"
						label="Password"
						validators={[VALIDATOR_MINLENGTH(6)]}
						errorText="Please enter a valid password, at least 6 characters."
						onInput={inputHandler}
					/>
					<button className="button" type="submit" disabled={!formState.isValid || isLoading}>
						{isLoginMode ? "LOGIN" : "SIGNUP"}
					</button>
				</form>
				<button className="button button--inverse" onClick={switchModeHandler}>
                    SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
				</button>
			</div>
		</React.Fragment>
	);
};

export default Authenticate;