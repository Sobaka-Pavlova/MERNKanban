const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const List = require("../models/list");
const Board = require("../models/board");

const getListById = async (req, res, next) => {
  const listId = req.params.lid;

  let list;
  try {
    list = await List.findById(listId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a list.",
      500
    );
    return next(error);
  }

  if (!list) {
    const error = new HttpError(
      "Could not find list for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ list: list.toObject({ getters: true }) });
};

const getListsByBoardId = async (req, res, next) => {
  const boardId = req.params.bid;

  let boardWithLists;
  try {
    boardWithLists = await Board.findById(boardId).populate("lists");
  } catch (err) {
    const error = new HttpError(
      "Fetching lists failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!boardWithLists || boardWithLists.lists.length === 0) {
    return next(
      new HttpError("Could not find lists for the provided board id.", 404)
    );
  }

  res.json({
    lists: boardWithLists.lists.map((list) => list.toObject({ getters: true })),
  });
};

const createList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const boardId = req.params.bid;

  const { title } = req.body;

  const createdList = new List({
    title,
    boardOfOrigin: boardId,
    cards: [],
  });

  let board;
  try {
    board = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError("Creating list failed, please try again.", 500);
    return next(error);
  }

  if (!board) {
    const error = new HttpError("Could not find board for provided id.", 404);
    return next(error);
  }

  if (board.owner.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to create lists in this board.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdList.save({ session: sess });
    board.lists.push(createdList);
    await board.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating list failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ list: createdList });
};

const shuffleCards = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    listOfOriginId,
    destinationListId,
    updatedOriginCards,
    updatedDestinationCards,
  } = req.body;

  let listOfOrigin;
  try {
    listOfOrigin = await List.findById(listOfOriginId).populate({
      select: "owner",
      path: "boardOfOrigin",
      model: "Board",
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  if (!listOfOrigin) {
    const error = new HttpError(
      "Could not find list for the provided id.",
      404
    );
    return next(error);
  }

  let destinationList;
  try {
    destinationList = await List.findById(destinationListId).populate({
      select: "owner",
      path: "boardOfOrigin",
      model: "Board",
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  if (!destinationList) {
    const error = new HttpError(
      "Could not find list for the provided id.",
      404
    );
    return next(error);
  }

  if (
    listOfOrigin.boardOfOrigin.owner.toString() !== req.userData.userId ||
    destinationList.boardOfOrigin.owner.toString() !== req.userData.userId
  ) {
    const error = new HttpError("You are not allowed to edit this list.", 401);
    return next(error);
  }

  listOfOrigin.cards = updatedOriginCards;
  destinationList.cards = updatedDestinationCards;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await listOfOrigin.save({ session: sess });
    await destinationList.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Lists updated." });
};

const updateListTitle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title } = req.body;
  const listId = req.params.lid;

  let list;
  try {
    list = await List.findById(listId).populate({
      select: "owner",
      path: "boardOfOrigin",
      model: "Board",
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  if (!list) {
    const error = new HttpError(
      "Could not find list for the provided id.",
      404
    );
    return next(error);
  }

  if (list.boardOfOrigin.owner.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this list.", 401);
    return next(error);
  }

  list.title = title;

  try {
    await list.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  res.status(200).json({ list: list.toObject({ getters: true }) });
};

const updateListCardsOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { cards } = req.body;
  const listId = req.params.lid;

  let list;
  try {
    list = await List.findById(listId).populate({
      select: "owner",
      path: "boardOfOrigin",
      model: "Board",
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  if (!list) {
    const error = new HttpError(
      "Could not find list for the provided id.",
      404
    );
    return next(error);
  }

  if (list.boardOfOrigin.owner.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this list.", 401);
    return next(error);
  }

  list.cards = cards;

  try {
    await list.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update list.",
      500
    );
    return next(error);
  }

  res.status(200).json({ list: list.toObject({ getters: true }) });
};

const deleteList = async (req, res, next) => {
  const listId = req.params.lid;

  let list;
  try {
    list = await List.findById(listId).populate("boardOfOrigin");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete list.",
      500
    );
    return next(error);
  }

  if (!list) {
    const error = new HttpError("Could not find list for this id.", 404);
    return next(error);
  }

  if (list.boardOfOrigin.owner.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this list.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await list.remove({ session: sess });
    list.boardOfOrigin.lists.pull(list);
    await list.boardOfOrigin.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete list.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted list." });
};

exports.getListById = getListById;
exports.getListsByBoardId = getListsByBoardId;
exports.createList = createList;
exports.updateListTitle = updateListTitle;
exports.updateListCardsOrder = updateListCardsOrder;
exports.shuffleCards = shuffleCards;
exports.deleteList = deleteList;
