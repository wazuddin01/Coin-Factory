const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SaleSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  icoId: {
    type: Schema.Types.ObjectId,
    ref: "Ico"
  },
  gatewayId: {
    type: Schema.Types.ObjectId,
    ref: "Gateway"
  },
  address: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  numberOfToken: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    //To check transaction has been confirmed/failed/pending
    type: Number,
    required: true
  },
  try: {
    type: Number,
    required: true
  }
});
module.exports = mongoose.model("Sale", SaleSchema);
