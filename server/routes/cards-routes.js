const express = require("express");
const { check } = require("express-validator");

const cardsControllers = require("../controllers/cards-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:cid", cardsControllers.getCardById);

router.get("/list/:lid", cardsControllers.getCardsByListId);

router.use(checkAuth); 

router.post(
	"/:lid",
	[
		check("title")
			.not()
			.isEmpty(),
	],
	cardsControllers.createCard
);

router.patch(
	"/:cid",
	[
		check("title")
			.not()
			.isEmpty(),
	],
	cardsControllers.updateCard
);

router.delete("/:cid", cardsControllers.deleteCard);

module.exports = router;
