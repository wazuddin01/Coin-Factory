const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ICOSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  start: {
    type: Date,
    default: Date.now
  },
  end: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,
    default: 0
  },
  minimum: {
    type: Number,
    required: true
  },
  maximum: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    default: 0
  }
});
Ico = mongoose.model("Ico", ICOSchema);
module.exports = Ico;
