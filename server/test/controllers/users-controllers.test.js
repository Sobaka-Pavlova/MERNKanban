require("dotenv").config();

const {
  getOwnData,
  getUsers,
  getUserById,
  signup,
  login,
} = require("../../controllers/users-controllers");
const User = require("../../models/user");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

describe("Users Controllers", () => {
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
  });

  after(async function () {
    try {
      await User.deleteMany({});

      return mongoose.disconnect();
    } catch (err) {
      console.log(err);
    }
  });

  let testUser = null;

  const jsonwebtoken = "jsonwebtoken";

  const req = {
    body: {
      name: "user",
      email: "user@user.com",
      password: "password",
    },
  };

  describe("Signup", () => {
    it("should throw 422 if user exists", async () => {
      const next = sinon.spy();
      sinon.stub(User, "findOne");
      User.findOne.returns({ user: "user" });

      await signup(req, {}, next);
      
      expect(User.findOne.called).to.be.true;
      User.findOne.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 422);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "User exists already, please login instead."
      );
    });

    it("should create user", async () => {
      const { email, password } = req.body;
      sinon.stub(User, "findOne");
      User.findOne.returns(null);

      sinon.stub(bcrypt, "hash");
      bcrypt.hash.returns(password);

      sinon.stub(jwt, "sign");
      jwt.sign.returns(jsonwebtoken);

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.userId = data.userId;
          this.email = data.email;
          this.token = data.token;
        },
      };

      await signup(req, res, () => {});

      User.findOne.restore();
      bcrypt.hash.restore();
      jwt.sign.restore();
      expect(res).to.have.property("statusCode", 201);
      expect(res).to.have.property("userId");
      expect(res).to.have.property("email", email);
      expect(res).to.have.property("token", jsonwebtoken);
    });
  });

  describe("Login", () => {
    it("should throw 403 if no user was found", async () => {
      const next = sinon.spy();
      sinon.stub(User, "findOne");
      User.findOne.returns(null);

      await login(req, {}, next);
      
      expect(User.findOne.called).to.be.true;
      User.findOne.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 403);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Invalid credentials, could not log you in."
      );
    });

    it("should throw 403 if password is invalid", async () => {
      const next = sinon.spy();
      sinon.stub(User, "findOne");
      sinon.stub(bcrypt, "compare");
      User.findOne.returns({ password: "password" });
      bcrypt.compare.returns(false);

      await login(req, {}, next);

      expect(User.findOne.called).to.be.true;
      expect(bcrypt.compare.called).to.be.true;
      User.findOne.restore();
      bcrypt.compare.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 403);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Invalid credentials, could not log you in."
      );
    });

    it("should login new user", async () => {
      const { name, email } = req.body;

      const res = {
        json: function ({ name, email, token, userId }) {
          this.name = name;
          this.userId = userId;
          this.email = email;
          this.token = token;
        },
      };

      sinon.stub(jwt, "sign");
      sinon.stub(bcrypt, "compare");

      jwt.sign.returns(jsonwebtoken);
      bcrypt.compare.returns(true);

      await login(req, res, () => {});
      expect(jwt.sign.called).to.be.true;
      expect(bcrypt.compare.called).to.be.true;
      jwt.sign.restore();
      bcrypt.compare.restore();

      expect(res).to.have.property("name", name);
      expect(res).to.have.property("userId");
      expect(res).to.have.property("email", email);
      expect(res).to.have.property("token", jsonwebtoken);
    });
  });

  describe("Get all users", () => {
    it("should throw 500 if DB return is unexpected", async () => {
      const next = sinon.spy();

      sinon.stub(User, "find");
      User.find.throws();

      await getUsers({}, {}, next);
      expect(User.find.called).to.be.true;
      User.find.restore();
      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 500);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Fetching users failed, please try again later."
      );
    });

    it("should fetch created user", async () => {
      const { name, email } = req.body;

      const res = {
        json: function (data) {
          this.users = data.users;
        },
      };

      await getUsers({}, res, () => {});

      expect(res)
        .to.have.property("users")
        .to.be.an("array")
        .that.has.length(1);

      testUser = res.users[0];

      expect(testUser).to.have.property("boards").to.be.an("array").that.is
        .empty;
      expect(testUser).to.have.property("_id");
      expect(testUser).to.have.property("name", name);
      expect(testUser).to.have.property("email", email);
    });
  });

  describe("Get a user by id", () => {
    before(() => {
      req["params"] = { uid: testUser.id };
    });

    after(() => {
      delete req.params;
    });

    it("should throw 404 if no user was found", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await getUserById(req, {}, next);
      mongoose.Query.prototype.populate.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find user for the provided id."
      );
    });

    it("should retrieve created user", async () => {
      const res = {
        json: function (data) {
          this.user = data.user;
        },
      };

      await getUserById(req, res, () => {});

      expect(res).to.have.property("user");
      expect(res.user).to.have.property("id", testUser.id);
      expect(res.user).to.have.property("name", testUser.name);
      expect(res.user).to.have.property("email", testUser.email);
      expect(res.user).to.have.property("boards").to.be.an("array").that.is
        .empty;
    });
  });

  describe("Get own data", () => {
    before(() => {
      req["userData"] = { userId: testUser.id };
    });

    after(() => {
      delete req.userData;
    });

    it("should throw 404 if no user was found", async () => {
      const next = sinon.spy();

      sinon.stub(mongoose.Query.prototype, "populate");
      mongoose.Query.prototype.populate.returns(null);

      await getOwnData(req, {}, next);
      mongoose.Query.prototype.populate.restore();

      expect(next.callCount).to.equal(1);
      expect(next.getCall(0).firstArg).to.have.property("code", 404);
      expect(next.getCall(0).firstArg).to.have.property(
        "message",
        "Could not find user for the provided id."
      );
    });

    it("should return user data and a new token", async () => {
      sinon.stub(jwt, "sign");
      jwt.sign.returns(jsonwebtoken);

      const res = {
        json: function (data) {
          this.token = data.token;
          this.user = data.user;
        },
      };
      await getOwnData(req, res, () => {});

      jwt.sign.restore();
      expect(res).to.have.property("token", jsonwebtoken);
      expect(res).to.have.property("user");
      expect(res.user).to.have.property("id", testUser.id);
      expect(res.user).to.have.property("name", testUser.name);
      expect(res.user).to.have.property("email", testUser.email);
      expect(res.user).to.have.property("boards").to.be.an("array").that.is
        .empty;
    });
  });
});
