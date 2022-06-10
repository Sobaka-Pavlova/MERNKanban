import React from "react";
import { useSelector } from "react-redux";

import BoardCard from "./components/boardCard/boardCard";
import InputContainer from "./components/InputContainer/inputContainer";

import "./allBoards.scss";

const AllBoards = () => {
	const boards = useSelector(state => state.user.allBoards);

	return (
		<div className="board-wrapper">
			{boards.map((board, boardIndex) => {
				return <BoardCard board={board} key={board._id} index={boardIndex} />;
			})}
			<div>
				<InputContainer type="newBoard" />
			</div>
		</div>
	);
};

export default AllBoards;