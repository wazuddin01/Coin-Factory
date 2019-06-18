const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const GatewaySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  minAmount: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Gateway", GatewaySchema);
