import React, { useState } from "react";
import { Collapse } from "@material-ui/core";

import InputCard from "../InputCard/inputCard";

import "./styles.scss";

export default function InputContainer({ boardId, type }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="board-input-container">
			<Collapse in={open}>
				<InputCard setOpen={setOpen} boardId={boardId} type={type} />
			</Collapse>
			<Collapse in={!open}>
				<div className="board-input-content">
					<button onClick={() => setOpen(!open)}>
            + Add Board
					</button>
				</div>
			</Collapse>
		</div>
	);
}