import axios from "axios";
import { toastOnError } from "./utils";
import { userSliceActions } from "./userSlice";

export const addNewBoard = (title) => async (dispatch) => {
  try {
    const res = await axios.post("/boards", { title });
    dispatch(userSliceActions.addNewBoard(res.data.board));
  } catch (err) {
    toastOnError(err);
  }
};

export const updateBoardTitle = (title, boardId) => async (dispatch) => {
  try {
    const res = await axios.patch(`/boards/title/${boardId}`, { title });
    dispatch(userSliceActions.updateBoardTitle(res.data.board));
  } catch (err) {
    toastOnError(err);
  }
};

export const deleteBoard = (boardId) => async (dispatch) => {
  try {
    await axios.delete(`/boards/${boardId}`);
    dispatch(userSliceActions.deleteBoard(boardId));
  } catch (err) {
    toastOnError(err);
  }
};

export const addNewCard = (title, listId, boardId) => async (dispatch) => {
  try {
    const res = await axios.post(`/cards/${listId}`, { title });
    dispatch({
      type: "addNewCard",
      payload: { card: { ...res.data.card }, listId, boardId },
    });
  } catch (err) {
    toastOnError(err);
  }
};

export const updateCardTitle =
  (title, cardId, listId, boardId) => async (dispatch) => {
    dispatch({
      type: "updateCardTitle",
      payload: { title, cardId, listId, boardId },
    });
    try {
      await axios.patch(`/cards/${cardId}`, { title });
    } catch (err) {
      toastOnError(err);
    }
  };

export const removeCard = (cardId, listId, boardId) => async (dispatch) => {
  try {
    await axios.delete(`/cards/${cardId}`);
    dispatch({ type: "removeCard", payload: { cardId, listId, boardId } });
  } catch (err) {
    toastOnError(err);
  }
};

export const addNewList = (title, boardId) => async (dispatch) => {
  try {
    const res = await axios.post(`/lists/${boardId}`, { title });
    dispatch({
      type: "addNewList",
      payload: { list: { ...res.data.list }, boardId },
    });
  } catch (err) {
    toastOnError(err);
  }
};

export const updateListTitle = (title, listId, boardId) => async (dispatch) => {
  dispatch({ type: "updateListTitle", payload: { title, listId, boardId } });
  try {
    await axios.patch(`/lists/title/${listId}`, { title });
  } catch (err) {
    toastOnError(err);
  }
};

export const removeList = (listId, boardId) => async (dispatch) => {
  try {
    await axios.delete(`/lists/${listId}`);
    dispatch({ type: "removeList", payload: { listId, boardId } });
  } catch (err) {
    toastOnError(err);
  }
};

export const shuffleLists = (payload) => async (dispatch) => {
  const { boardId, lists } = payload;
  dispatch({
    type: "shuffleLists",
    payload,
  });
  try {
    await axios.patch(`/boards/lists/${boardId}`, { lists });
  } catch {
    toastOnError(
      "Unable to propogate most recent changes, please refresh the page"
    );
  }
};

export const moveCardWithinOneList = (payload) => async (dispatch) => {
  const { listOfOriginId, updatedCards } = payload;
  dispatch({
    type: "moveCardWithinOneList",
    payload,
  });
  try {
    await axios.patch(`/lists/cards/${listOfOriginId}`, {
      cards: updatedCards,
    });
  } catch {
    toastOnError(
      "Unable to propogate most recent changes, please refresh the page"
    );
  }
};

export const shuffleCards = (payload) => async (dispatch) => {
  dispatch({
    type: "shuffleCards",
    payload,
  });
  try {
    await axios.patch("/lists/shuffleCards", { ...payload });
  } catch {
    toastOnError(
      "Unable to propogate most recent changes, please refresh the page"
    );
  }
};
