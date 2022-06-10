const expect = require("chai").expect;
const checkAuth = require("../../middleware/check-auth");
const sinon = require("sinon");

const jwt = require("jsonwebtoken");

describe("check-auth middleware", () => {
  it("should call next if method is OPTIONS", function () {
    const req = {
      method: "OPTIONS",
    };

    const next = sinon.spy();

    checkAuth(req, {}, next);

    expect(next.callCount).to.equal(1);
    expect(next.getCall(0).args).to.be.an("array").that.is.empty;
  });

  it("should throw if no token", function () {
    const req = {
      headers: {
        authorization: "Bearer",
      },
    };

    const next = sinon.spy();
    checkAuth(req, {}, next);

    expect(next.callCount).to.equal(1);
    expect(next.getCall(0).firstArg).to.have.property("code", 403);
    expect(next.getCall(0).firstArg).to.have.property(
      "message",
      "Authentication failed!"
    );
  });

  it("should append userData to request after decoding the token", function () {
    const tokenValue = "abc";
    const req = {
      headers: {
        authorization: `Bearer ${tokenValue}`,
      },
    };

    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: tokenValue });

    checkAuth(req, {}, () => {});

    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
    expect(req).to.have.property("userData");
    expect(req.userData).to.have.property("userId", tokenValue);
  });
});
