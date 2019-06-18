const Validator = require("validator");
const isEmpty = require("../Validations/is-empty");

module.exports = data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.quantity = !isEmpty(data.quantity) ? data.quantity : "";
  data.end = !isEmpty(data.end) ? data.end : "";
  data.minimum = !isEmpty(data.minimum) ? data.minimum : "";
  data.maximum = !isEmpty(data.maximum) ? data.maximum : "";

  if (Validator.isEmpty(data.price)) {
    errors.price = "Price cannot be empty";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "Please enter coin name";
  }
  if (Validator.isEmpty(data.maximum)) {
    errors.minimum = "Please enter Maximum amount of coin an user can buy";
  }
  if (Validator.isEmpty(data.minimum)) {
    errors.maximum = "Please enter Minimum amount of coin an user can buy";
  }

  if (Validator.isEmpty(data.quantity)) {
    errors.quantity = "Quantity cannot be empty";
  }

  if (Validator.isEmpty(data.end)) {
    errors.end = "End date cannot be empty";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
