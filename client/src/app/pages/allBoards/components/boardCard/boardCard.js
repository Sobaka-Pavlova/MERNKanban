import React from "react";

import Title from "../Title/title";

import "./styles.scss";

export default function BoardCard({ board, index: boardIndex }) {
	return (
		<React.Fragment>
			<div className="board-list-cards">
				<div className="board-title-list">
					<Title title={board.title} boardId={board._id} />
				</div>
			</div>
		</React.Fragment>
	);
}
