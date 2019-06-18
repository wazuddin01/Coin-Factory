const Validator = require("validator");
const isEmpty = require("../Validations/is-empty");

module.exports = data => {
  let errors = {};

  data.publicKey = !isEmpty(data.publicKey) ? data.publicKey : "";
  data.privateKey = !isEmpty(data.privateKey) ? data.privateKey : "";
  data.minAmount = !isEmpty(data.minAmount) ? data.minAmount : "";
  data.maxAmount = !isEmpty(data.maxAmount) ? data.maxAmount : "";
  data.name = !isEmpty(data.name) ? data.name : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name of coin cannot be empty";
  }
  if (Validator.isEmpty(data.publicKey)) {
    errors.publicKey = "Please enter coin Public Key";
  }

  if (Validator.isEmpty(data.privateKey)) {
    errors.privateKey = "Private Key cannot be empty";
  }

  if (Validator.isEmpty(data.minAmount)) {
    errors.minAmount = "Minimum Amount date cannot be empty";
  }
  if (Validator.isEmpty(data.maxAmount)) {
    errors.maxAmount = "Maximum Amount date cannot be empty";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
