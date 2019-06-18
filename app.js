const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const user = require("./routes/user");
const transaction = require("./routes/transaction");
const options = require("./config/keys");
const coin = require("./routes/coin");
let conn = mongoose.connection;

const app = express();
const port = process.env.PORT || 3000;

mongoose.set("useFindAndModify", false);
mongoose
  .connect(options.mongoURI, { useNewUrlParser: true })
  .then(console.log("Connected to database"))
  .catch(err => console.log(err));

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

app.use(methodOverride("_method"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use("/api/users", user);
app.use("/api/transaction", transaction);
app.use("/api/coin", coin);

app.get("/", (req, res) => {
  res.send("Invalid end point");
});

app.get("/file/:id", (req, res) => {
  gfs.files.findOne({ _id: req.params.id }, (err, files) => {
    if (err) {
      console.log(err);
    }
    console.log(files);
    return res.status(200).json(files);
  });
});

app.listen(port, () => {
  console.log(`app is running at port ${port}`);
});
