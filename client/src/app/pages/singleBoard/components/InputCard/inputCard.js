import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clear } from "@material-ui/icons";


import { addNewCard, addNewList } from "../../../../store/boardActions";
import "./styles.scss";

const InputCard = ({ setOpen, listId, type }) => {
	const [title, setTitle] = useState("");
	const dispatch = useDispatch();

	const currentBoard = useSelector(state => state.currentBoard.currentBoard);


	const handleBtnConfirm = () => {
		if (!title) {
			return;
		}
		type === "card" ?
			dispatch(addNewCard(title, listId, currentBoard._id))
			:
			dispatch(addNewList(title, currentBoard._id));
		setOpen(false);
		setTitle("");
	};

	return (
		<div className="input-card">
			<div className="input-card-container">
				<textarea
					onChange={(e) => setTitle(e.target.value)}
					value={title}
					className="input-text"
					placeholder={
						type === "card"
							? "Enter a title of this card..."
							: "Enter list title"
					}
					autoFocus
				/>
			</div>
			<div className="confirm">
				<button className="button-confirm" onClick={handleBtnConfirm}>
					{type === "card" ? "Add Card" : "Add List"}
				</button>
				<button
					className="button-cancel"
					onClick={() => {
						setTitle("");
						setOpen(false);
					}}
				>
					<Clear />
				</button>
			</div>
		</div>
	);
};




export default InputCard; 