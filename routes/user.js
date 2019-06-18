const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Web3 = require("web3");
const path = require("path");
const multer = require("multer");

const rpcUrl = "https://mainnet.infura.io/v3/YOUR_KEY";
const web3 = new Web3(rpcUrl);

const User = require("../Models/User");
const Wallet = require("../Models/Wallet");
const Kyc = require("../Models/Kyc");
const registerValidation = require("../Validations/userRegistration");
const options = require("../config/keys");

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//@route POST api/users/register
//@desc Registering User
//@access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = registerValidation(req.body);
  //console.log(errors);
  if (isValid == false) {
    return res.status(400).json(errors);
  }
  const userId = req.body.userId;
  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    countryCode: req.body.countryCode,
    mobile: req.body.mobile,
    refer: req.body.refer,
    address: {
      houseNo: req.body.houseNo,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode
    }
  };
  //Find user by its firebase id
  User.findOne({ userId }) //userId is firebase id
    .then(user => {
      //Find user and update by its id
      let id = user._id;
      //console.log("user id", id);
      User.findOneAndUpdate({ _id: id }, { $set: newUser }, { new: true })
        .then(singleuser => {
          return res.status(200).json(singleuser);
        })
        .catch(err => {
          // console.log("user not found error", err);
          return res.status(404).json({ user: "User not found" });
        });
    })
    .catch(err => {
      //console.log("firebase user not found error", err);
      return res.status(404).json({ user: "User not found by firebase id" });
    });
});

//@route GET api/users/:userId
//@desc Get user by its firebase id
//@access Public
router.get("/:userId", (req, res) => {
  User.findOne({ userId: req.params.userId })
    .then(user => {
      if (!user) {
        return res.status(404).json({ user: "User not found" });
      }
      return res.status(200).json(user);
    })
    .catch(err => {
      console.log("user get by id", err);
    });
});

//@route POST api/users/wallet
//@desc Create Wallet and user username/firstname by user FireBase Uid
//@access Public
router.post("/wallet", (req, res) => {
  const email = req.body.email;
  const userId = req.body.Id; //Firebase user id
  const username =
    email.split("@")[0] + Math.floor(Math.random() * 100).toString();
  -``;
  //Checking wallet exists or Not if it exists then return null value
  Wallet.findOne({ userId }).then(wallet => {
    if (wallet) {
      return res.status(400).json({ wallet: "wallet already exists" });
    }
    //Creating a new Ethereum Wallet
    const account = web3.eth.accounts.create();
    const newWallet = Wallet({
      userId: req.body.Id,
      address: account.address,
      privateKey: account.privateKey
    });
    //Saving the created wallet into database
    newWallet.save().then(wallet => {
      console.log(wallet);
    });
    User.findOne({ userId }).then(user => {
      const newUser = User({
        userId: userId,
        email: email,
        username: username
      });
      newUser
        .save()
        .then(user => {
          console.log(user);
        })
        .catch(err => {
          console.log("Register user wallet", err);
          return res.status(400).json({ Wallet: "Error in Creating Wallet" });
        });
    });
    //Return new create wallet
    return res.status(200).json({ Wallet: "Wallet successfully created" });
  });
});

//@route GET api/users/wallet/:firebaseId
//@desc Getting Wallet by firebaseId
//@access Public
router.get("/wallet/:firebaseId", (req, res) => {
  const userId = req.params.firebaseId;
  Wallet.findOne({ userId })
    .then(wallet => {
      if (!wallet) {
        return res.status(404).json({ wallet: "Wallet not found" });
      }
      wallet = {
        // id: wallet._id,
        // firebaseId: wallet.userId,
        balance: wallet.Balance,
        address: wallet.address
      };
      return res.status(200).json(wallet);
    })
    .catch(err => console.log(err));
});

//Upload documents
//Set storage engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
//INIT upload
const upload = multer({ storage: storage }).single("kyc");

//@route POST api/users/upload
//@desc upload document
//@access Public
router.post("/upload", upload, (req, res) => {
  let kyc = req.body;
  upload(req, res, err => {
    if (err) {
      console.log(err);
      return res.status(400).json(err);
    }

    kyc.path = req.file.path;
    kyc.fileName = req.file.filename;

    //Find and update kyc if user want to
    Kyc.findOneAndUpdate({ userId: kyc.userId }, { $set: kyc }, { new: true })
      .then(kycDoc => {
        console.log(kycDoc);
        return res.status(200).json({ kyc: "Kyc has been updated" });
      })
      .catch(err => {
        console.log(err);
        return res.status(400).json({ err: err });
      });
  });
});

module.exports = router;
