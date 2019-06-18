const express = require("express");
const bodyParser = require("body-parser");
const Tx = require("ethereumjs-tx");
const Web3 = require("web3");
const Coinpayments = require("coinpayments");
//const CoinpaymentsError = require(`coinpayments/lib/error`);
const router = express.Router();

// const ganache = "http://127.0.0.1:7545";
const rpcUrl = "https://mainnet.infura.io/v3/YOUR_KEY";
const web3 = new Web3(rpcUrl);

const options = require("../config/keys");
//Models
const User = require("../Models/User");
const Wallet = require("../Models/Wallet");
const Ico = require("../Models/Ico");
const Gateway = require("../Models/Gateway");
const Sales = require("../Models/Sales");

const client = new Coinpayments(options);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//@route POST api/transaction/send
//@desc Buying Token by Ethereum or sending ether from user account
//@access Public
router.post("/send", (req, res) => {
  const userId = req.body.userId;
  User.findOne({ userId }).then(user => {
    if (!user) {
      return res.status(400).json({ User: "User not found" });
    } else {
      Wallet.findOne({ userId }).then(wallet => {
        //User account address though which ether will transfer to buy coin
        const userAccAddress = wallet.address;
        console.log("userAccAddress", userAccAddress);

        //Removing 0x form wallet key so that it will be used
        const privateKey = wallet.privateKey.split("x")[1];
        console.log("privatekey", privateKey);

        //Converting private key into hexadecimal buffer
        const userPrivateKey = Buffer.from(privateKey, "hex");
        console.log("userPrivateKey", userPrivateKey);

        //Amount of ether to pay
        const ether = req.body.amount;
        //Amount of gas price to pay
        const gasPrice = req.body.gasPrice;
        //user account to which payment is going
        const account2 = req.body.receiver;

        //Checking values so that it cannot be empty
        if (account2 == "" || ether == "" || gasPrice == "") {
          return res.status(400).json({
            success: false,
            data: {},
            error: { message: "One of the Input parameter is empty" }
          });}
        web3.eth.getTransactionCount(userAccAddress, (err, txCount) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              success: false,
              data: {},
              error: { message: "Something Went wrong" }
            });}
          const txObject = {
            nonce: web3.utils.toHex(txCount),
            to: account2,
            value: web3.utils.toHex(
              web3.utils.toWei(ether.toString(), "ether")
            ),
            gasLimit: web3.utils.toHex(21000),
            gasPrice: web3.utils.toHex(
              web3.utils.toWei(gasPrice.toString(), "gwei")
            )
          };
          console.log(txObject);
          // Sign the transaction
          const tx = new Tx(txObject);
          tx.sign(userPrivateKey);

          const serializedTx = tx.serialize();
          const raw = "0x" + serializedTx.toString("hex");

          // Broadcast the transaction
          web3.eth.sendSignedTransaction(raw, (err, txHash) => {
            if (err) {
              return res.status(400).json({
                success: false,
                data: {},
                error: { message: "Transaction cannot be created" }
              });
            }
            console.log("txHash:", txHash);
            // Now go check etherscan to see the transaction!
            return res
              .status(200)
              .json({ success: true, data: { txHash: txHash }, Error: {} });
          });
        });
      });
    }
  });
});

//@route POST api/transaction/sendBtc
//@desc Buying Token by BTC or sending BTC from user account
//@access Public
router.post("/sendBtc", (req, res) => {
  const saleAmountInBTC = req.body.saleAmount;
  Ico.findOne({ status: 1 })
    .then(Ico => {
      //status 0 means,This coin is not available for sale
      if (!Ico) {
        return res.status(400).json({ Ico: `There is no Active ICO` });
      } else {
        const icoId = Ico._id;
        //To check if coin left in ICO is less than coin to buy
        if (req.body.noOfToken > Ico.quantity || req.body.noOfToken == null) {
          return res.status(400).json({ coin: "Enter less number of token" });
        }
        //To Check user is entering coins between minimum and mxamium value provided by admin
        if (
          req.body.noOfToken < Ico.minimum ||
          req.body.noOfToken > Ico.maximum
        ) {
          return res.status(400).json({
            Token: `Token should between ${Ico.minimum} and ${Ico.maximum}`
          });
        }
        //Finding the gateway through which user want to pay
        Gateway.findOne({ name: req.body.name }).then(gateway => {
          if (gateway.status == 0) {
            return res.status(400).json({
              Gateway: `Method of payment thorugh ${gateway.name} is Inctive`
            });
          } else {
            let email = req.body.email; //Email of user who is sending buying token
            if (email == " " || email == null) {
              return res.status(404).json({ email: "Email is empty" });
            }
            let priceOfOneToken = Ico.price; //Price of one Token
            console.log(`price of one token ${priceOfOneToken}`);

            let noOfTokenToBuy = req.body.noOfToken; //No of token user want to buy

            let totalAmnt = priceOfOneToken * noOfTokenToBuy; //Total amount user has to pay
            console.log("Total Amount", totalAmnt);

            //Options to buy token
            let option = {
              currency1: "USD",
              currency2: "BTC",
              amount: totalAmnt,
              buyer_email: email,
              ipn_url: `api/transaction/detail`
            };
            console.log(option);
            //Creating the transaction
            client
              .createTransaction(option)
              .then(success => {
                userId = req.body.userId;
                if (userId == "") {
                  return res.status(404).json({
                    userId: "UserId is empty so sales cannot be created"
                  });
                }
                User.findOne({ userId }).then(user => {
                  //If user not found
                  if (!user) {
                    return res.status(400).json({ user: "user not found" });
                  } else {
                    //Excute if user found
                    let newSale = new Sales({
                      userId: userId,
                      icoId: Ico._id,
                      gatewayId: gateway._id,
                      address: success.address,
                      amount: saleAmountInBTC,
                      transactionId: success.txn_id,
                      numberOfToken: noOfTokenToBuy,
                      status: 0,
                      try: success.confirms_needed
                    });
                    console.log("Sales object", newSale);
                    newSale
                      .save()
                      .then(sale =>
                        console.log("Sale has been generated by user id", sale)
                      )
                      .catch(err => console.log("sales error", err));
                    console.log("Ico Id", icoId);
                    //Deduct the amount of token from ICO and add to sold
                    const ico = {
                      quantity: Ico.quantity - noOfTokenToBuy,
                      sold: Ico.sold + noOfTokenToBuy
                    };

                    //transaction created
                    return res.status(200).json(success);
                  }
                });
              })
              .catch(err => {
                //Catch of client.createTransaction
                return res.status(404).json(err);
              });
          }
        });
      }
    })
    .catch(err => console.log(err));
});

//@route GET api/transaction/all/:userId
//@desc Get all the transaction by user id
//@access Private
router.get("/all/:userId", (req, res) => {
  const {userId} = req.params;
  Sales.find({ userId })
    .then(sales => {
      if (!sales) {
        return res.status(404).json({ sales: "No sales found" });
      }
      return res.status(200).json(sales);
    })
    .catch(err => console.log("sales error", err));
});

//@route GET api/transaction/:id
//@desc Get single transaction of a user
//@access Public
router.get("/:id", (req, res) => {
  Sales.findById(req.params.id)
    .then(transaction => {
      if (!transaction) {
        return res.status(404).json({ Error: "Transaction not found" });
      }
      return res.status(200).json(transaction);
    })
    .catch(err => {
      console.log("error by sales find", err);
    });
});

//@route POST api/transaction/detail
//@desc Get single transaction of a user
//@access Public
router.post("/detail", (req, res) => {
  //   {
  //     "time_created": 1557819919,
  //     "time_expires": 1557841519,
  //     "status": -1,
  //     "status_text": "Cancelled / Timed Out",
  //     "type": "coins",
  //     "coin": "BTC",
  //     "amount": 6793806007,
  //     "amountf": "67.93806007",
  //     "received": 0,
  //     "receivedf": "0.00000000",
  //     "recv_confirms": 0,
  //     "payment_address": "3C3H6rMZqVTxTU6tg4EaNJJmEmEET3mMXH"
  // }

  const data = req.body;
  let saleAmount;
  let saleStatus;
  let icoId;
  let userId;
  let noOfToken;
  //Finding the sale by transaction id
  Sales.findOne({ transactionId: data.txn_id })
    .then(sale => {
      saleAmount = sale.amount;
      saleStatus = sale.status;
      icoId = sale.icoId;
      userId = sale.userId;
      noOfToken = sale.noOfToken;
    })
    .catch(err => {
      console.log(err);
    });
    
  if (data.status == 1 || data.status > 100) {
    if (data.coin == "BTC" || data.amount > SaleAmount || saleStatus == 0) {
      //find Sale and update
      Sales.findOneAndUpdate(
        { transactionId: data.txn_id },
        { $set: { status: 1 } },
        { new: true }
      )
        .then(succ => {
          console.log("sale", succ);
          //return res.status(200).json({ sale: "Sale is successfull" });
        })
        .catch(err => {
          console.log("sale error", err);
        });
      //find ICO and update its sold and quantity
      Ico.findOneAndUpdate(
        { _id: icoId },
        {
          $set: {
            noOfToken: ico.quantity - noOfToken,
            sold: ico.sold + noOfToken
          }
        },
        { new: true }
      )
        .then(succ => {
          console.log("Ico updated", succ);
        })
        .catch(err => {
          console.log("Ico error", err);
        });
    }
  } else {
    //Transaction failed
    return res.status(400).json({ message: "Transaction failed" });
  }
});

module.exports = router;
