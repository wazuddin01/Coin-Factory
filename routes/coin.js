const express = require("express");
const bodyParser = require("body-parser");

const Ico = require("../Models/Ico");
const Gateway = require("../Models/Gateway");
const coinRegister = require("../Validations/IcoRegistration");
const gateWayRegister = require("../Validations/gatewayRegistration");

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//@route POST api/coin/create
//@desc Create Coin for sale
//@access Admin
router.post("/create", (req, res) => {
  const { errors, isValid } = coinRegister(req.body);
  console.log(req.body);
  if (isValid == false) {
    return res.status(400).json(errors);
  }
  Ico.findOne({ name: req.body.name })
    .then(coin => {
      if (coin) {
        console.log(coin);
        errors.coin = "Already Exists";
        return res.status(400).json(errors);
      } else {
        let newCoin = new Ico({
          name: req.body.name,
          price: req.body.price,
          quantity: req.body.quantity,
          minimum: req.body.minimum,
          maximum: req.body.maximum,
          end: req.body.end
        });
        newCoin.save().then(coin => {
          console.log(newCoin);
          return res.status(200).json(coin);
        });
      }
    })
    .catch(err => {
      return res.status(404).json(err);
    });
});

//@route GET api/coin
//@desc get active ICO for sale
//@access Admin
router.get("/", (req, res) => {
  Ico.findOne({ status: 1 })
    .then(ico => {
      if (!ico) {
        return res.status(404).json({ Ico: "No active Ico found" });
      } else {
        return res.status(200).json(ico);
      }
    })
    .catch(err => {
      console.log("ico get error", err);
    });
});

//@route POST api/coin/gateway
//@desc Create Coin for sale
//@access Admin
router.post("/gateway", (req, res) => {
  const { errors, isValid } = gateWayRegister(req.body);
  if (isValid == false) {
    return res.status(400).json(errors);
  }
  Gateway.findOne({ name: req.body.name })
    .then(gateway => {
      if (gateway) {
        errors.gateway = "Gateway already Exists";
        return res.status(400).json(errors);
      }
      let newGateWay = new Gateway({
        privateKey: req.body.privateKey,
        publicKey: req.body.publicKey,
        name: req.body.name,
        minAmount: req.body.minAmount,
        maxAmount: req.body.maxAmount
      });
      newGateWay
        .save()
        .then(gateway => {
          console.log(gateway);
          return res.status(200).json(gateway);
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

module.exports = router;
