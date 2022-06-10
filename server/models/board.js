const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const boardSchema = new Schema({
	title: { type: String, required: true },
	owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
	lists: [{ type: mongoose.Types.ObjectId, required: true, ref: "List" }]
});

boardSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Board", boardSchema);