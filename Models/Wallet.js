const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  privateKey: {
    type: String
  },
  address: {
    type: String
  },
  Balance: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Walllet", WalletSchema);
