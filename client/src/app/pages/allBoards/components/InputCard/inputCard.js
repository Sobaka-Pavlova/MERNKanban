import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Clear } from "@material-ui/icons";

import { addNewBoard } from "../../../../store/boardActions";

import "./styles.scss";

export default function InputCard({ setOpen }) {
	const [title, setTitle] = useState("");

	const dispatch = useDispatch();


	const handleBtnConfirm = () => {
		setOpen(false);
		if (title) {
			dispatch(addNewBoard(title));
		}
		setTitle("");
	};

	return (
		<div className="board-input-card">
			<div className="board-input-card-container">
				<textarea
					maxLength={20}
					onChange={e => setTitle(e.target.value)}
					value={title}
					className="board-input-text"
					placeholder={"Enter board title"}
					autoFocus
				/>
			</div>
			<div className="board-confirm">
				<button className="board-button-confirm" onClick={handleBtnConfirm}>
          Add Board
				</button>
				<button
					className="board-button-cancel"
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
}

