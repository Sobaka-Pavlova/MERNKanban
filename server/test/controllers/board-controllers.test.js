require("dotenv").config();

const {
  getBoardById,
  getBoardsByUserId,
  createBoard,
  updateBoardTitle,
  updateBoardListsOrder,
  deleteBoard,
} = require("../../controllers/boards-controllers");
const User = require("../../models/user");
const Board = require("../../models/board");
const List = require("../../models/list");

const mongoose = require("mongoose");
const expect = require("chai").expect;
const sinon = require("sinon");

describe("Board Controllers", () => {
  before(async function () {
    try {
      await mongoose.connect(process.env.TEST_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });

      testUser = new User({
        name: "board",
        email: "board@test.com",
        password: "password",
        boards: [],
        _id: fakeUserId,
      });
      await testUser.save();
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
  const fakeUserId = "5c0f66b979af55031b34728a";

  const req = {
    body: {
      title: "title",
      lists: [],
    },
  };

  let testBoard = null;

  describe("Create Board", () => {
    afterEach(() => {
      delete req.userData;
    });

    it("should throw 404 if no user was found", async () => {
      req["userData"] = { userId: null };
      const next = sinon.spy();

      await createBoard(req, {}, next);
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find user for provided id."
      );
    });

    it("should return status 201 and new board", async () => {
      const res = {
        status: function (code) {
          this.code = code;
          return this;
        },
        json: function (data) {
          this.board = data.board;
        },
      };
      req["userData"] = { userId: fakeUserId };
      await createBoard(req, res, () => {});

      testBoard = res.board;

      expect(res).to.have.property("code", 201);
      expect(res).to.have.property("board");
      expect(testBoard).to.have.property("lists").to.be.an("array").that.is
        .empty;
      expect(testBoard).to.have.property("_id");
      expect(testBoard).to.have.property("title", req.body.title);
      expect(testBoard).to.have.property("owner");
      expect(testBoard.owner.toString()).to.be.equal(fakeUserId);
    });

    it("should increase length of owner's boards array to 1", async () => {
      let user;
      try {
        user = await User.findById(testBoard.owner.toString());
      } catch (err) {
        throw new Error(err);
      }

      expect(user)
        .to.have.property("boards")
        .to.be.an("array")
        .to.have.lengthOf(1);
    });
  });

  describe("Get boards by owner ID", () => {
    before(() => {
      req["params"] = { uid: fakeUserId };
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if owner does not exist", async () => {
      const next = sinon.spy();
      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);
      await getBoardsByUserId(req, {}, next);
      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find boards for the provided user id."
      );
    });

    it("should throw 404 if owner has no boards", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(testUser);

      await getBoardsByUserId(req, {}, next);

      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find boards for the provided user id."
      );
    });

    it("should return an array with a single created board", async () => {
      const res = {
        json: function (data) {
          this.boards = data.boards;
        },
      };

      await getBoardsByUserId(req, res, () => {});

      expect(res)
        .to.have.property("boards")
        .to.be.an("array")
        .to.have.lengthOf(1);

      testBoard = res.boards[0];

      expect(testBoard).to.have.property("lists").to.be.an("array").that.is
        .empty;
      expect(testBoard).to.have.property("title", req.body.title);
      expect(testBoard).to.have.property("owner");
      expect(testBoard.owner.toString()).to.be.equal(fakeUserId);
    });
  });

  describe("Get board by it's id", () => {
    before(() => {
      req["params"] = { bid: testBoard.id };
    });

    after(() => {
      delete req.params;
    });

    it("should return 404 if no board was found", async () => {
      const next = sinon.spy();

      sinon.stub(Board, "findById");
      Board.findById.returns(null);

      await getBoardById(req, {}, next);

      Board.findById.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find board for the provided id."
      );
    });

    it("should return a board that is deep equal to created board", async () => {
      const res = {
        json: function (data) {
          this.board = data.board;
        },
      };

      await getBoardById(req, res, () => {});

      expect(res).to.have.property("board").to.deep.equal(testBoard);
    });
  });

  describe("Update board title", () => {
    before(() => {
      req["params"] = { bid: testBoard.id };
    });

    afterEach(() => {
      delete req.userData;
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if board does not exist", async () => {
      const next = sinon.spy();

      sinon.stub(Board, "findById");
      Board.findById.returns(null);

      await updateBoardTitle(req, {}, next);
      Board.findById.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find board for the provided id."
      );
    });

    it("should throw 401 if sender id does not match owner id", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: "fakeUserId" };

      await updateBoardTitle(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to edit this board."
      );
    });

    it("should return status code 200 and update board title", async () => {
      const updatedTitle = "updatedTitle";
      req["userData"] = { userId: fakeUserId };
      req["body"] = { ...req.body, title: updatedTitle };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.board = data.board;
        },
      };

      await updateBoardTitle(req, res, () => {});

      expect(res.statusCode).to.be.equal(200);
      expect(res.board).to.have.property("lists").to.be.an("array").that.is
        .empty;
      expect(res.board).to.have.property("title", updatedTitle);
    });
  });

  describe("Update lists array for given Board", () => {
    before(() => {
      req["params"] = { bid: testBoard.id };

      const createdList = new List({
        title: "listTitle",
        boardOfOrigin: testBoard.id,
        cards: [],
      });

      req.body.lists.push(createdList);
    });

    afterEach(() => {
      delete req.userData;
    });

    it("should throw 404 if board does not exist", async () => {
      const next = sinon.spy();

      sinon.stub(Board, "findById");
      Board.findById.returns(null);

      await updateBoardListsOrder(req, {}, next);
      Board.findById.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find board for the provided id."
      );
    });

    it("should throw 401 if sender id does not match owner id", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: "fakeUserId" };

      await updateBoardListsOrder(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to edit this board."
      );
    });

    it("should return status code 200 and update array of lists", async () => {
      req["userData"] = { userId: fakeUserId };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.board = data.board;
        },
      };

      await updateBoardListsOrder(req, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res.board).to.have.property("title", req.body.title);
      expect(res.board)
        .to.have.property("lists")
        .to.be.an("array")
        .to.have.lengthOf(1);
    });
  });

  describe("deleteBoard", () => {
    before(() => {
      req["params"] = { bid: testBoard.id };
    });

    it("should throw 401 if deleting is performed by non-owner", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: "" };

      await deleteBoard(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to delete this board."
      );
    });

    it("should return status 200 and deleted board message", async () => {
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

      await deleteBoard(req, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res).to.have.property("message", "Deleted board.");
    });

    it("should return 404 as the board was deleted", async () => {
      const next = sinon.spy();

      await deleteBoard(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find board for this id."
      );
    });

    it("should decrease owner's boards array length to 0", async () => {
      let user;
      try {
        user = await User.findById(testBoard.owner.toString());
      } catch (err) {
        new Error(err);
      }

      expect(user)
        .to.have.property("boards")
        .to.be.an("array")
        .to.have.lengthOf(0);
    });
  });
});
