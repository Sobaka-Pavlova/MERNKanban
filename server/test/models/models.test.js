const expect = require("chai").expect;
const Card = require("../../models/card");
const List = require("../../models/list");
const Board = require("../../models/board");
const User = require("../../models/user");

const HttpError = require("../../models/http-error");

describe("Mongoose Models", () => {
  const name = "user";
  const email = "user@user.ca";
  const password = "password";

  const createdUser = new User({
    name,
    email,
    password,
    boards: [],
  });

  it("should create User", function () {
    expect(createdUser).to.have.property("name", name);
    expect(createdUser).to.have.property("email", email);
    expect(createdUser).to.have.property("password", password);
    expect(createdUser).to.have.property("boards").to.be.an("array").that.is.empty;
  });

  const boardTitle = "board";

  const createdBoard = new Board({
    title: boardTitle,
    owner: createdUser,
    lists: [],
  });

  it("should create Board", function () {
    expect(createdBoard).to.have.property("title", boardTitle);
    expect(createdBoard).to.have.property("owner", createdUser);
    expect(createdBoard.lists).to.be.an("array").that.is.empty;
  });

  const listTitle = "List";

  const createdList = new List({
    title: listTitle,
    boardOfOrigin: createdBoard,
    cards: [],
  });

  it("should create List", function () {
    expect(createdList).to.have.property("title", listTitle);
    expect(createdList).to.have.property("boardOfOrigin", createdBoard);
    expect(createdList.cards).to.be.an("array").that.is.empty;
  });

  const cardTitle = "Card";

  const createdCard = new Card({
    title: cardTitle,
    listOfOrigin: createdList,
  });

  it("should create Card", function () {
    expect(createdCard).to.have.property("title", cardTitle);
    expect(createdCard).to.have.property("listOfOrigin", createdList);
  });

  it("should create custom error class", function () {
    const message = "error!";
    const errorCode = 500;
    const newError = new HttpError(message, errorCode);

    expect(newError).to.have.property("message", message);
    expect(newError).to.have.property("code", errorCode);
  });
});
