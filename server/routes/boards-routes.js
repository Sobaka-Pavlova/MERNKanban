const express = require("express");
const { check } = require("express-validator");

const boardsControllers = require("../controllers/boards-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:bid", boardsControllers.getBoardById);

router.get("/user/:uid", boardsControllers.getBoardsByUserId);

router.use(checkAuth);

router.post(
  "/",
  [check("title").not().isEmpty()],
  boardsControllers.createBoard
);

router.patch(
  "/title/:bid",
  [check("title").not().isEmpty()],
  boardsControllers.updateBoardTitle
);

router.patch(
  "/lists/:bid",
  [check("lists").isArray()],
  boardsControllers.updateBoardListsOrder
);

router.delete("/:bid", boardsControllers.deleteBoard);

module.exports = router;
