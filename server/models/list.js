const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const listSchema = new Schema({
	title: { type: String, required: true },
	boardOfOrigin: { type: mongoose.Types.ObjectId, required: true, ref: "Board" },
	cards: [{ type: mongoose.Types.ObjectId, required: true, ref: "Card" }]
});

listSchema.plugin(uniqueValidator);

module.exports = mongoose.model("List", listSchema);