const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Board = require("../models/board");
const User = require("../models/user");

const getBoardById = async (req, res, next) => {
  const boardId = req.params.bid;

  let board;
  try {
    board = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a board.",
      500
    );
    return next(error);
  }

  if (!board) {
    const error = new HttpError(
      "Could not find board for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ board: board.toObject({ getters: true }) });
};

const getBoardsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithBoards;
  try {
    userWithBoards = await User.findById(userId).populate("boards");
  } catch (err) {
    const error = new HttpError(
      "Fetching boards failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithBoards || userWithBoards.boards.length === 0) {
    return next(
      new HttpError("Could not find boards for the provided user id.", 404)
    );
  }

  res.json({
    boards: userWithBoards.boards.map((board) =>
      board.toObject({ getters: true })
    ),
  });
};

const createBoard = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title } = req.body;

  const createdBoard = new Board({
    title,
    owner: req.userData.userId,
    lists: [],
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating board failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBoard.save({ session: sess });
    user.boards.push(createdBoard);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating board failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ board: createdBoard });
};

const updateBoardTitle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title } = req.body;

  const boardId = req.params.bid;

  let board;
  try {
    board = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update board.",
      500
    );
    return next(error);
  }

  if (!board) {
    const error = new HttpError(
      "Could not find board for the provided id.",
      404
    );
    return next(error);
  }

  if (board.owner.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this board.", 401);
    return next(error);
  }

  board.title = title;

  try {
    await board.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update board.",
      500
    );
    return next(error);
  }

  res.status(200).json({ board: board.toObject({ getters: true }) });
};

const updateBoardListsOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { lists } = req.body;

  const boardId = req.params.bid;

  let board;
  try {
    board = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update board.",
      500
    );
    return next(error);
  }

  if (!board) {
    const error = new HttpError(
      "Could not find board for the provided id.",
      404
    );
    return next(error);
  }

  if (board.owner.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this board.", 401);
    return next(error);
  }

  board.lists = lists;

  try {
    await board.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update board.",
      500
    );
    return next(error);
  }

  res.status(200).json({ board: board.toObject({ getters: true }) });
};

const deleteBoard = async (req, res, next) => {
  const boardId = req.params.bid;

  let board;
  try {
    board = await Board.findById(boardId).populate("owner");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete board.",
      500
    );
    return next(error);
  }

  if (!board) {
    const error = new HttpError("Could not find board for this id.", 404);
    return next(error);
  }

  if (board.owner.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this board.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await board.remove({ session: sess });
    board.owner.boards.pull(board);
    await board.owner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete board.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted board." });
};

exports.getBoardById = getBoardById;
exports.getBoardsByUserId = getBoardsByUserId;
exports.createBoard = createBoard;
exports.updateBoardTitle = updateBoardTitle;
exports.updateBoardListsOrder = updateBoardListsOrder;
exports.deleteBoard = deleteBoard;
