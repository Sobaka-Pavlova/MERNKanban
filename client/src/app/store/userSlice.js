import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	user: null,
	allBoards: null,
	isSettingUser: true,
	isAuthenticated: false,
	token: null,
	isLogginIn: false
};


export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.allBoards = action.payload.allBoards;
			state.isAuthenticated = true;
			state.isSettingUser = false;
			state.isLogginIn = false;
		},
		failedSettingUser: (state) => {
			state.isSettingUser = false;
		},
		loginIn: (state, action) => {
			state.isLogginIn = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.allBoards = null;
			state.token = null;
			state.isSettingUser = false;
			state.isAuthenticated = false;
			state.isLogginIn = false;
		},
		deleteBoard: (state, action) => {
			state.allBoards = state.allBoards.filter(board => board._id !== action.payload);
		},
		updateBoardTitle: (state, action) => {
			const index = state.allBoards.findIndex(board => board._id === action.payload._id);
			state.allBoards[index].title = action.payload.title;
		},
		addNewBoard: (state, action) => {
			state.allBoards.push(action.payload);
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase("shuffleLists", (state, action) => {
				const index = state.allBoards.findIndex(board => board._id === action.payload.boardId);
				state.allBoards[index].lists = action.payload.lists;
			})
			.addCase("moveCardWithinOneList", (state, action) => {
				const currentBoard = state.allBoards.filter(board => board._id === action.payload.boardId)[0];
				const index = currentBoard.lists.findIndex(list => list._id === action.payload.listOfOriginId);

				currentBoard.lists[index].cards = action.payload.updatedCards;
			})
			.addCase("shuffleCards", (state, action) => {
				const currentBoard = state.allBoards.filter(board => board._id === action.payload.boardId)[0];
				const destinationIndex = currentBoard.lists.findIndex(list => list._id === action.payload.destinationListId);
				const originIndex = currentBoard.lists.findIndex(list => list._id === action.payload.listOfOriginId);

				currentBoard.lists[originIndex].cards = action.payload.updatedOriginCards;
				currentBoard.lists[destinationIndex].cards = action.payload.updatedDestinationCards;
			})
			.addCase("addNewCard", (state, action) => {
				const { card, listId, boardId } = action.payload;
				const currentBoard = state.allBoards.filter(board => board._id === boardId)[0];
				const currentList = currentBoard.lists.filter(list => list._id === listId)[0];
				currentList.cards.push(card);
			})
			.addCase("updateCardTitle", (state, action) => {
				const { title, cardId, listId, boardId } = action.payload;
				const currentBoard = state.allBoards.filter(board => board._id === boardId)[0];
				const currentList = currentBoard.lists.filter(list => list._id === listId)[0];
				const currentCard = currentList.cards.filter(card => card._id === cardId)[0];
				currentCard.title = title;
			})
			.addCase("removeCard", (state, action) => {
				const { cardId, listId, boardId } = action.payload;
				const currentBoard = state.allBoards.filter(board => board._id === boardId)[0];
				const currentList = currentBoard.lists.filter(list => list._id === listId)[0];

				currentList.cards = currentList.cards.filter(card => card._id !== cardId);
			})
			.addCase("addNewList", (state, action) => {
				const { list, boardId } = action.payload;
				const currentBoard = state.allBoards.filter(board => board._id === boardId)[0];
				currentBoard.lists.push(list);
			})
			.addCase("updateListTitle", (state, action) => {
				const { title, listId, boardId } = action.payload;
				const currentBoard = state.allBoards.filter(board => board._id === boardId)[0];
				const currentList = currentBoard.lists.filter(list => list._id === listId)[0];

				currentList.title = title;
			})
			.addCase("removeList", (state, action) => {
				const { listId, boardId } = action.payload;
				const currentBoard = state.allBoards.filter(board => board._id === boardId)[0];
				currentBoard.lists = currentBoard.lists.filter(list => list._id !== listId);
			});
	},
});

export const userSliceActions = userSlice.actions;


export default userSlice.reducer;