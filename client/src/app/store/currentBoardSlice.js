import { userSliceActions } from "./userSlice";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	currentBoard: null,
};

export const currentBoardSlice = createSlice({
	name: "currentBoard",
	initialState,
	reducers: {
		setBoard: (state, action) => {
			state.currentBoard = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(userSliceActions.logout, (state) => {
				state.currentBoard = null;
			})
			.addCase("shuffleLists", (state, action) => {
				state.currentBoard.lists = action.payload.lists;
			})
			.addCase("moveCardWithinOneList", (state, action) => {
				const index = state.currentBoard.lists.findIndex(list => list._id === action.payload.listOfOriginId);

				state.currentBoard.lists[index].cards = action.payload.updatedCards;
			})
			.addCase("shuffleCards", (state, action) => {
				const destinationIndex = state.currentBoard.lists.findIndex(list => list._id === action.payload.destinationListId);
				const originIndex = state.currentBoard.lists.findIndex(list => list._id === action.payload.listOfOriginId);

				state.currentBoard.lists[originIndex].cards = action.payload.updatedOriginCards;
				state.currentBoard.lists[destinationIndex].cards = action.payload.updatedDestinationCards;
			})
			.addCase("addNewCard", (state, action) => {
				const { card, listId } = action.payload;
				const currentList = state.currentBoard.lists.filter(list => list._id === listId)[0];
				currentList.cards.push(card);
			})
			.addCase("updateCardTitle", (state, action) => {
				const { title, cardId, listId } = action.payload;
				const currentList = state.currentBoard.lists.filter(list => list._id === listId)[0];
				const currentCard = currentList.cards.filter(card => card._id === cardId)[0];
				currentCard.title = title;
			})
			.addCase("removeCard", (state, action) => {
				const { cardId, listId } = action.payload;
				const currentList = state.currentBoard.lists.filter(list => list._id === listId)[0];

				currentList.cards = currentList.cards.filter(card => card._id !== cardId);
			})
			.addCase("addNewList", (state, action) => {
				state.currentBoard.lists.push(action.payload.list);
			})
			.addCase("updateListTitle", (state, action) => {
				const { title, listId } = action.payload;
				const currentList = state.currentBoard.lists.filter(list => list._id === listId)[0];
				currentList.title = title;
			})
			.addCase("removeList", (state, action) => {
				const { listId } = action.payload;
				state.currentBoard.lists = state.currentBoard.lists.filter(list => list._id !== listId);
			});
	},
});

export const currentBoardSliceActions = currentBoardSlice.actions;


export default currentBoardSlice.reducer;
