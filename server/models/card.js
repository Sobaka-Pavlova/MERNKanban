const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const cardSchema = new Schema({
	title: { type: String, required: true },
	listOfOrigin: { type: mongoose.Types.ObjectId, required: true, ref: "List" },
});

cardSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Card", cardSchema);