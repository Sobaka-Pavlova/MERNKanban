import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import List from "./components/List/list";
import InputContainer from "./components/InputContainer/inputContainer";

import { currentBoardSliceActions } from "../../store/currentBoardSlice";
import { shuffleLists, moveCardWithinOneList, shuffleCards } from "../../store/boardActions";

import "./singleBoard.scss";


const Board = () => {
	const { board } = useParams();
	const currentBoard = useSelector(state => state.currentBoard.currentBoard);
	const allBoards = useSelector(state => state.user.allBoards);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		if (!currentBoard) {
			const selectedBoard = allBoards.filter(el => el.title === board)[0];
			if (!selectedBoard) {
				navigate("/user/boards", { replace: true });
			}
			dispatch(currentBoardSliceActions.setBoard(selectedBoard));
		}
	}, [navigate, dispatch, currentBoard, allBoards, board]);

	const onDragEnd = (result) => {
		const { destination, source, draggableId, type } = result;

		if (!destination) { return; }

		const newListsArray = [...currentBoard.lists];

		if (type === "list") {
			const draggableList = newListsArray.filter(el => el._id === draggableId)[0];
			newListsArray.splice(source.index, 1);
			newListsArray.splice(destination.index, 0, draggableList);

			dispatch(shuffleLists({
				boardId: draggableList.boardOfOrigin,
				lists: newListsArray
			}));

			return;
		}

		const sourceList = newListsArray.filter(el => el._id === source.droppableId)[0];
		const destinationList = newListsArray.filter(el => el._id === destination.droppableId)[0];
		const draggingCard = sourceList.cards.filter(card => card._id === draggableId)[0];
		
		const sourceCards = [...sourceList.cards];
		const destinationCards = [...destinationList.cards];

		if (source.droppableId === destination.droppableId) {
			destinationCards.splice(source.index, 1);
			destinationCards.splice(destination.index, 0, draggingCard);

			dispatch(moveCardWithinOneList({
				boardId: currentBoard._id,
				listOfOriginId: source.droppableId,
				updatedCards: destinationCards
			}));


		} else {
			sourceCards.splice(source.index, 1);
			const updatedOriginDragginCard = {
				...draggingCard,
				listOfOrigin: destination.droppableId
			};
			destinationCards.splice(destination.index, 0, updatedOriginDragginCard);

			dispatch(shuffleCards({
				boardId: currentBoard._id,
				listOfOriginId: source.droppableId,
				destinationListId: destination.droppableId,
				updatedOriginCards: sourceCards,
				updatedDestinationCards: destinationCards,
			}));
		}
	};
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="app" type="list" direction="horizontal">
				{(provided) => (
					<div
						className="wrapper"
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{currentBoard && currentBoard.lists.map((singleList, listIndex) => {
							return <List list={singleList} key={singleList._id} index={listIndex} />;
						})}
						<div>
							<InputContainer type="list" />
						</div>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export default Board;