require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/users-routes");
const boardsRoutes = require("./routes/boards-routes");
const listsRoutes = require("./routes/lists-routes");
const cardsRoutes = require("./routes/cards-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

let mongoAtlas;
if (process.env.NODE_ENV === "development") {
  mongoAtlas = process.env.DEV_DB;
}
if (process.env.NODE_ENV === "production") {
  mongoAtlas = process.env.PROD_DB;
}

const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/boards", boardsRoutes);
app.use("/api/lists", listsRoutes);
app.use("/api/cards", cardsRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(mongoAtlas, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
