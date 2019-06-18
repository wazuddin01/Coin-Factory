const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String
  },
  //Firebase Id
  userId: {
    type: String
  },
  email: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  countryCode: {
    type: String
  },
  mobile: {
    type: String
  },
  status: {
    type: Number,
    default: 0
  },
  address: {
    houseNo: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    pincode: {
      type: String
    }
  },
  TokenPurchased: {
    type: Number
  },
  refer: {
    type: String
  },
  profilepicture: {
    type: String
  },
  Date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);
