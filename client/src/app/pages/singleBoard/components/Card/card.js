import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { DeleteOutline } from "@material-ui/icons";
import { Draggable } from "react-beautiful-dnd";

import { removeCard, updateCardTitle } from "../../../../store/boardActions";

import "./styles.scss";

const Card = ({ card, index: cardIndex, listId }) => {
	const [open, setOpen] = useState(false);
	const [newTitle, setNewTitle] = useState(card.title);

	const dispatch = useDispatch();
	const currentBoard = useSelector(state => state.currentBoard.currentBoard);

	const handleOnBlur = () => {
		if (newTitle && newTitle !== card.title) {
			dispatch(updateCardTitle(newTitle, card._id, listId, currentBoard._id));
		}
		if (!newTitle) {
			setNewTitle(card.title);
		}
		setOpen(!open);
	};

	const handleRemoveCard = event => {
		event.preventDefault();
		event.stopPropagation();
		dispatch(removeCard(card._id, listId, currentBoard._id));
	};

	return (
		<Draggable draggableId={card._id} index={cardIndex}>
			{(provided) => (
				<div
					ref={provided.innerRef}
					{...provided.dragHandleProps}
					{...provided.draggableProps}
				>
					<div className="card-content">
						{open ? (
							<TextareaAutosize
								type="text"
								className="input-card-title"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								onBlur={handleOnBlur}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										handleOnBlur();
									}
									return;
								}}
								autoFocus
							/>
						) : (
							<div
								onClick={() => setOpen(!open)}
								className="card-title-container"
							>
								<p>{card.title}</p>
								<button onClick={(e) => handleRemoveCard(e)}>
									<DeleteOutline />
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</Draggable>
	);
};



export default Card; 