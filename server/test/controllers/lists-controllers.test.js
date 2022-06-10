require("dotenv").config();

const {
  getListById,
  getListsByBoardId,
  createList,
  updateListTitle,
  updateListCardsOrder,
  shuffleCards,
  deleteList,
} = require("../../controllers/lists-controllers");
const User = require("../../models/user");
const Board = require("../../models/board");
const List = require("../../models/list");
const Card = require("../../models/card");

const mongoose = require("mongoose");
const expect = require("chai").expect;
const sinon = require("sinon");

describe("List Controllers", () => {
  before(async function () {
    try {
      await mongoose.connect(process.env.TEST_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });

      testUser = new User({
        name: "list",
        email: "list@test.com",
        password: "password",
        boards: [],
        _id: fakeUserId,
      });

      testBoard = new Board({
        title: "boardTitle",
        owner: fakeUserId,
        lists: [],
      });

      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await testBoard.save({ session: sess });
        testUser.boards.push(testBoard);
        await testUser.save({ session: sess });
        await sess.commitTransaction();
      } catch (err) {
        return new Error(err);
      }
    } catch (err) {
      console.log(err);
    }
  });

  after(async function () {
    try {
      await User.deleteMany({});
      await Board.deleteMany({});
      await List.deleteMany({});

      return mongoose.disconnect();
    } catch (err) {
      console.log(err);
    }
  });

  let testUser = null;
  let testBoard = null;
  let testList = null;

  const fakeUserId = "5c0f66b979af55031b34728a";

  const req = {
    body: {
      title: "listTitle",
      cards: [],
    },
  };

  describe("createList", () => {
    afterEach(() => {
      delete req.userData;
      delete req.params;
    });

    it("should throw 404 if no board was found", async () => {
      req["params"] = { bid: null };

      const next = sinon.spy();

      await createList(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find board for provided id."
      );
    });

    it("should throw 401 if list creator is not board owner", async () => {
      req["params"] = { bid: testBoard._id };
      req["userData"] = { userId: "" };

      const next = sinon.spy();

      await createList(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to create lists in this board."
      );
    });

    it("should return status 201 and created list", async () => {
      req["params"] = { bid: testBoard._id };
      req["userData"] = { userId: fakeUserId };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.list = data.list;
        },
      };

      await createList(req, res, () => {});

      expect(res).to.have.property("statusCode", 201);
      expect(res)
        .to.have.property("list")
        .to.have.property("cards")
        .to.be.an("array").that.is.empty;
      expect(res.list).to.have.property("title", req.body.title);
      expect(res.list).to.have.property("boardOfOrigin", testBoard._id);
    });

    it("should increase length of board's list array to 1", async () => {
      let board;
      try {
        board = await Board.findById(testBoard._id.toString());
      } catch (err) {
        throw new Error(err);
      }

      expect(board)
        .to.have.property("lists")
        .to.be.an("array")
        .that.has.lengthOf(1);
    });
  });

  describe("getListsByBoardId", () => {
    before(() => {
      req["params"] = { bid: testBoard.id };
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if board does not exist", async () => {
      const next = sinon.spy();
      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);
      await getListsByBoardId(req, {}, next);
      mongoose.Query.prototype.populate.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find lists for the provided board id."
      );
    });

    it("should throw 404 if board has no lists", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(testBoard);

      await getListsByBoardId(req, {}, next);
      mongoose.Query.prototype.populate.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find lists for the provided board id."
      );
    });

    it("should return an array with a single created list", async () => {
      const res = {
        json: function (data) {
          this.lists = data.lists;
        },
      };

      await getListsByBoardId(req, res, () => {});

      expect(res)
        .to.have.property("lists")
        .to.be.an("array")
        .to.have.lengthOf(1);

      testList = res.lists[0];

      expect(testList).to.have.property("cards").to.be.an("array").that.is
        .empty;
      expect(testList).to.have.property("title", req.body.title);
      expect(testList).to.have.property("boardOfOrigin");
      expect(testList.boardOfOrigin.toString()).to.be.equal(testBoard.id);
    });
  });

  describe("getListById", () => {
    before(() => {
      req["params"] = { lid: testList._id };
    });

    after(() => {
      delete req.params;
    });

    it("should return 404 if no list was found", async () => {
      const next = sinon.spy();

      sinon.stub(List, "findById");
      List.findById.returns(null);

      await getListById(req, {}, next);
      List.findById.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for the provided id."
      );
    });

    it("should return a list that is deep equal to created list", async () => {
      const res = {
        json: function ({ list }) {
          this.list = list;
        },
      };

      await getListById(req, res, () => {});

      expect(res).to.have.property("list").to.deep.equal(testList);
    });
  });

  describe("updateListTitle", () => {
    before(() => {
      req["params"] = { lid: testList._id };
    });

    afterEach(() => {
      delete req.userData;
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if list does not exist", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await updateListTitle(req, {}, next);
      mongoose.Query.prototype.populate.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for the provided id."
      );
    });

    it("should throw 401 if sender id does not match owner id", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: "fakeUserId" };

      await updateListTitle(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to edit this list."
      );
    });

    it("should return status code 200 and update list title", async () => {
      const updatedTitle = "updatedTitle";
      req["userData"] = { userId: fakeUserId };
      req["body"] = { ...req.body, title: updatedTitle };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.list = data.list;
        },
      };

      await updateListTitle(req, res, () => {});

      expect(res.statusCode).to.be.equal(200);
      expect(res.list).to.have.property("cards").to.be.an("array").that.is
        .empty;
      expect(res.list).to.have.property("title", updatedTitle);
    });
  });

  describe("updateListCardsOrder", () => {
    before(() => {
      req["params"] = { lid: testList._id };

      const createdCard = new Card({
        title: "cardTitle",
        listOfOrigin: testList._id,
        cards: [],
      });

      req.body.cards.push(createdCard);
    });

    afterEach(() => {
      delete req.userData;
    });

    it("should throw 404 if list does not exist", async () => {
      const next = sinon.spy();
      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await updateListCardsOrder(req, {}, next);

      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for the provided id."
      );
    });

    it("should throw 401 if sender id does not match owner id", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: "fakeUserId" };

      await updateListCardsOrder(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to edit this list."
      );
    });

    it("should return status code 200 and a list with an updated array of cards", async () => {
      req["userData"] = { userId: fakeUserId };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.list = data.list;
        },
      };

      await updateListCardsOrder(req, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res.list).to.have.property("title", req.body.title);
      expect(res.list)
        .to.have.property("cards")
        .to.be.an("array")
        .to.have.lengthOf(1);
    });
  });

  describe("deleteList", () => {
    before(() => {
      req["params"] = { lid: testList._id };
    });

    after(() => {
      delete req.params;
      delete req.userData;
    });

    it("should throw 401 if deleting is performed by non-owner", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: "" };

      await deleteList(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to delete this list."
      );
    });

    it("should return status 200 and deleted list message", async () => {
      req["userData"] = { userId: fakeUserId };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.message = data.message;
        },
      };

      await deleteList(req, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res).to.have.property("message", "Deleted list.");
    });

    it("should return 404 as the board was deleted", async () => {
      const next = sinon.spy();

      await deleteList(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for this id."
      );
    });

    it("should decrease board origin's lists array length to 0", async () => {
      let board;

      try {
        board = await Board.findById(testBoard.id);
      } catch (err) {
        new Error(err);
      }

      expect(board)
        .to.have.property("lists")
        .to.be.an("array")
        .to.have.lengthOf(0);
    });
  });

  describe("shuffleCards", () => {
    let shuffleBoard = null;

    let listOfOrigin = null;
    let destinationList = null;

    let updatedOriginCards = null;
    let updatedDestinationCards = null;

    before(async () => {
      shuffleBoard = await Board.findById(testBoard._id);
      listOfOrigin = new List({
        title: "origin title",
        boardOfOrigin: testBoard._id,
        cards: [],
      });

      destinationList = new List({
        title: "destination title",
        boardOfOrigin: testBoard._id,
        cards: [],
      });

      const createdCard = new Card({
        title: "cardTitle",
        listOfOrigin: listOfOrigin._id,
        cards: [],
      });

      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await listOfOrigin.save({ session: sess });
        await destinationList.save({ session: sess });
        await listOfOrigin.cards.push(createdCard);
        await shuffleBoard.lists.push(listOfOrigin);
        await shuffleBoard.lists.push(destinationList);
        await shuffleBoard.save({ session: sess });

        await sess.commitTransaction();
      } catch (err) {
        new Error(err);
      }

      updatedOriginCards = [];
      updatedDestinationCards = listOfOrigin.cards;
    });

    it("should throw 404 if origin list is not found", async () => {
      const next = sinon.spy();

      const justReq = {
        body: {
          listOfOriginId: fakeUserId,
          destinationListId: destinationList._id,
          updatedOriginCards,
          updatedDestinationCards,
        },
        userData: {
          userId: fakeUserId,
        },
      };

      await shuffleCards(justReq, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for the provided id."
      );
    });

    it("should throw 401 if sender is not owner of either list", async () => {
      const next = sinon.spy();

      const justReq = {
        body: {
          listOfOriginId: listOfOrigin._id,
          destinationListId: destinationList._id,
          updatedOriginCards,
          updatedDestinationCards,
        },
        userData: {
          userId: "",
        },
      };

      await shuffleCards(justReq, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to edit this list."
      );
    });

    it("should throw 404 if destination list is not found", async () => {
      const next = sinon.spy();

      const justReq = {
        body: {
          listOfOriginId: fakeUserId,
          destinationListId: destinationList._id,
          updatedOriginCards,
          updatedDestinationCards,
        },
        userData: {
          userId: fakeUserId,
        },
      };

      await shuffleCards(justReq, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for the provided id."
      );
    });

    it("should return status 200 and list updated message", async () => {
      const justReq = {
        body: {
          listOfOriginId: listOfOrigin._id,
          destinationListId: destinationList._id,
          updatedOriginCards,
          updatedDestinationCards,
        },
        userData: {
          userId: fakeUserId,
        },
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function ({ message }) {
          this.message = message;
        },
      };

      await shuffleCards(justReq, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res).to.have.property("message", "Lists updated.");
    });

    it("should confirm origin list cards array to be empty", async () => {
      const mutatedOriginList = await List.findById(listOfOrigin._id);

      expect(mutatedOriginList).to.have.property("cards").to.be.an("array").that
        .is.empty;
    });

    it("should confirm destination list cards array to have lenght of 1", async () => {
      const mutatedDestinationList = await List.findById(destinationList._id);

      expect(mutatedDestinationList)
        .to.have.property("cards")
        .to.be.an("array")
        .to.have.lengthOf(1);
    });
  });
});
