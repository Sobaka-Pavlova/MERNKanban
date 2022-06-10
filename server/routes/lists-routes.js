const express = require("express");
const { check } = require("express-validator");

const listsControllers = require("../controllers/lists-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:lid", listsControllers.getListById);

router.get("/board/:bid", listsControllers.getListsByBoardId);

router.use(checkAuth);

router.post(
  "/:bid",
  [check("title").not().isEmpty()],
  listsControllers.createList
);

router.patch(
  "/shuffleCards",
  [
    check("listOfOriginId").not().isEmpty(),
    check("destinationListId").not().isEmpty(),
    check("updatedOriginCards").isArray(),
    check("updatedDestinationCards").isArray(),
  ],
  listsControllers.shuffleCards
);

router.patch(
  "/title/:lid",
  [check("title").not().isEmpty()],
  listsControllers.updateListTitle
);

router.patch(
  "/cards/:lid",
  [check("cards").isArray()],
  listsControllers.updateListCardsOrder
);

router.delete("/:lid", listsControllers.deleteList);

module.exports = router;
