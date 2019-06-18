const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const KycSchema = new Schema({
  status: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    required: true
  },
  docType: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  path: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("kyc", KycSchema);
