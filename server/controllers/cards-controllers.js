const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Card = require("../models/card");
const List = require("../models/list");

const getCardById = async (req, res, next) => {
  const cardId = req.params.cid;

  let card;
  try {
    card = await Card.findById(cardId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a card.",
      500
    );
    return next(error);
  }

  if (!card) {
    const error = new HttpError(
      "Could not find card for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ card: card.toObject({ getters: true }) });
};

const getCardsByListId = async (req, res, next) => {
  const listId = req.params.lid;

  let listWithCards;
  try {
    listWithCards = await List.findById(listId).populate("cards");
  } catch (err) {
    const error = new HttpError(
      "Fetching lists failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!listWithCards || listWithCards.cards.length === 0) {
    return next(
      new HttpError("Could not find cards for the provided list id.", 404)
    );
  }

  res.json({
    cards: listWithCards.cards.map((card) => card.toObject({ getters: true })),
  });
};

const createCard = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const listId = req.params.lid;

  const { title } = req.body;

  const createdCard = new Card({
    title,
    listOfOrigin: listId,
  });

  let list;
  try {
    list = await List.findById(listId).populate("boardOfOrigin");
  } catch (err) {
    const error = new HttpError("Creating list failed, please try again.", 500);
    return next(error);
  }

  if (!list) {
    const error = new HttpError("Could not find list for provided id.", 404);
    return next(error);
  }

  if (list.boardOfOrigin.owner.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to create cards in this list.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCard.save({ session: sess });
    list.cards.push(createdCard);
    await list.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating card failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ card: createdCard });
};

const updateCard = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title } = req.body;
  const cardId = req.params.cid;

  let card;
  try {
    card = await Card.findById(cardId).populate({
      path: "listOfOrigin",
      model: "List",
      select: "boardOfOrigin",
      populate: {
        select: "owner",
        path: "boardOfOrigin",
        model: "Board",
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update card.",
      500
    );
    return next(error);
  }
  if (!card) {
    const error = new HttpError("Could not find card for this id.", 404);
    return next(error);
  }
  if (card.listOfOrigin.boardOfOrigin.owner.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this card.", 401);
    return next(error);
  }

  card.title = title;

  try {
    await card.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update card.",
      500
    );
    return next(error);
  }

  res.status(200).json({ card: card.toObject({ getters: true }) });
};

const deleteCard = async (req, res, next) => {
  const cardId = req.params.cid;

  let card;
  try {
    card = await Card.findById(cardId).populate({
      path: "listOfOrigin",
      model: "List",
      select: "-__v",
      populate: {
        select: "owner",
        path: "boardOfOrigin",
        model: "Board",
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete card.",
      500
    );
    return next(error);
  }

  if (!card) {
    const error = new HttpError("Could not find card for this id.", 404);
    return next(error);
  }

  if (card.listOfOrigin.boardOfOrigin.owner.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this card.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await card.remove({ session: sess });
    card.listOfOrigin.cards.pull(card);
    await card.listOfOrigin.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete card.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted card." });
};

exports.getCardById = getCardById;
exports.getCardsByListId = getCardsByListId;
exports.createCard = createCard;
exports.updateCard = updateCard;
exports.deleteCard = deleteCard;
