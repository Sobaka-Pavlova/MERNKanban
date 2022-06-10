import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

import Title from "../Title/title";
import Card from "../Card/card";
import InputContainer from "../InputContainer/inputContainer";

import "./styles.scss";

const List = ({ list, index: listIndex }) => {
	return (
		<Draggable draggableId={list._id} index={listIndex}>
			{(provided) => (
				<div {...provided.draggableProps} ref={provided.innerRef}>
					<div className="list-cards" {...provided.dragHandleProps}>
						<div className="title-list">
							<Title title={list.title} listId={list._id} />
						</div>
						<div className="container-cards">
							<Droppable droppableId={list._id} type="task">
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className="card-container"
									>
										{list.cards.map((card, index) => (
											<Card
												key={card._id}
												card={card}
												index={index}
												listId={list._id}
											/>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</div>
						<InputContainer listId={list._id} type="card" />
					</div>
				</div>
			)}
		</Draggable>
	);
};


export default List; 