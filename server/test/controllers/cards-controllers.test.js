require("dotenv").config();

const {
  getCardById,
  getCardsByListId,
  createCard,
  updateCard,
  deleteCard,
} = require("../../controllers/cards-controllers");
const User = require("../../models/user");
const Board = require("../../models/board");
const List = require("../../models/list");
const Card = require("../../models/card");

const mongoose = require("mongoose");
const expect = require("chai").expect;
const sinon = require("sinon");

describe("Card Controllers", () => {
  before(async function () {
    try {
      await mongoose.connect(process.env.TEST_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });
    } catch (err) {
      console.log(err);
    }

    try {
      testUser = new User({
        name: "card",
        email: "cards@test.com",
        password: "password",
        boards: [],
        _id: fakeUserId,
      });

      testBoard = new Board({
        title: "board title",
        owner: fakeUserId,
        lists: [],
      });

      testList = new List({
        title: "list title",
        boardOfOrigin: testBoard._id,
        cards: [],
      });

      const sess = await mongoose.startSession();
      sess.startTransaction();
      await testUser.boards.push(testBoard);
      await testUser.save({ session: sess });
      await testBoard.lists.push(testList);
      await testBoard.save({ session: sess });
      await testList.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      console.log(err);
    }

    req["body"] = {
      title: "title",
      listOfOrigin: testList._id,
    };
  });

  after(async function () {
    try {
      await User.deleteMany({});
      await Board.deleteMany({});
      await List.deleteMany({});
      await Card.deleteMany({});
      return mongoose.disconnect();
    } catch (err) {
      console.log(err);
    }
  });

  const fakeUserId = "5c0f66b979af55031b34728a";

  let testUser = null;
  let testBoard = null;
  let testList = null;
  let testCard = null;

  const req = {
    body: {},
  };

  describe("createCard", () => {
    before(() => {
      req["params"] = { lid: testList._id };
    });

    afterEach(() => {
      delete req.userData;
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if no list was found", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await createCard(req, {}, next);
      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find list for provided id."
      );
    });

    it("should throw 401 if creator is not list owner", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: null };

      await createCard(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to create cards in this list."
      );
    });

    it("should return status 201 and created card", async () => {
      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function ({ card }) {
          this.card = card;
        },
      };

      req["userData"] = { userId: fakeUserId };

      await createCard(req, res, () => {});

      expect(res).to.have.property("statusCode", 201);
      expect(res).to.have.property("card");
      expect(res.card).to.have.property("title", req.body.title);
      expect(res.card).to.have.property("listOfOrigin", req.body.listOfOrigin);
    });

    it("should confirm cards array of origin list has length of 1", async () => {
      const updatedList = await List.findById(testList._id);

      expect(updatedList)
        .to.have.property("cards")
        .to.be.an("array")
        .that.has.lengthOf(1);
    });
  });

  describe("getCardsByListId", () => {
    before(() => {
      req["params"] = { lid: testList._id };
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if no list was found", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await getCardsByListId(req, {}, next);
      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find cards for the provided list id."
      );
    });

    it("should throw 404 if list has no cards", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(testList);

      await getCardsByListId(req, {}, next);
      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find cards for the provided list id."
      );
    });

    it("should return array of cards", async () => {
      const res = {
        json: function ({ cards }) {
          this.cards = cards;
        },
      };

      await getCardsByListId(req, res, () => {});
      expect(res).to.have.property("cards").to.have.lengthOf(1);
      testCard = res.cards[0];
      expect(testCard).to.have.property("title", req.body.title);
      expect(testCard).to.have.property("listOfOrigin");
      expect(testCard.listOfOrigin.toString()).to.be.equal(testList.id);
    });
  });

  describe("getCardById", () => {
    afterEach(() => {
      delete req.params;
    });

    it("should throw 404 if no card was found", async () => {
      const next = sinon.spy();
      req["params"] = { cid: null };
      await getCardById(req, {}, next);
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find card for the provided id."
      );
    });

    it("should return a card that is deep equal to created card", async () => {
      req["params"] = { cid: testCard.id };

      const res = {
        json: function ({ card }) {
          this.card = card;
        },
      };
      await getCardById(req, res, () => {});
      expect(res).to.have.property("card").to.deep.equal(testCard);
    });
  });

  describe("updateCard", () => {
    before(() => {
      req["params"] = { cid: testCard.id };
    });

    afterEach(() => {
      delete req.userData;
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if no card was found", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await updateCard(req, {}, next);
      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find card for this id."
      );
    });

    it("should throw 401 if sender is not owner", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: null };

      await updateCard(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to edit this card."
      );
    });

    it("should return status 200 and card with updated title", async () => {
      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function ({ card }) {
          this.card = card;
          return this;
        },
      };

      const updatedTitle = "updatedTitle";
      req["body"] = { ...req.body, title: updatedTitle };
      req["userData"] = { userId: fakeUserId };

      await updateCard(req, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res)
        .to.have.property("card")
        .to.have.property("title", updatedTitle);
    });
  });

  describe("deleteCard", () => {
    before(() => {
      req["params"] = { cid: testCard.id };
    });

    afterEach(() => {
      delete req.userData;
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if no card was found", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await deleteCard(req, {}, next);
      mongoose.Query.prototype.populate.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find card for this id."
      );
    });

    it("should throw 401 if sender is not owner", async () => {
      const next = sinon.spy();
      req["userData"] = { userId: null };

      await deleteCard(req, {}, next);

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 401);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "You are not allowed to delete this card."
      );
    });

    it("should return status 200 and deleted card message", async () => {
      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function ({ message }) {
          this.message = message;
          return this;
        },
      };

      req["userData"] = { userId: fakeUserId };

      await deleteCard(req, res, () => {});

      expect(res).to.have.property("statusCode", 200);
      expect(res).to.have.property("message", "Deleted card.");
    });

    it("should confirm cards array of origin list is empty", async () => {
      const updatedList = await List.findById(testList.id);

      expect(updatedList).to.have.property("cards").to.be.an("array").that.is
        .empty;
    });
  });
});
