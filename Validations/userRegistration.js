const Validator = require("validator");
const isEmpty = require("../Validations/is-empty");

module.exports = data => {
  let errors = {};

  // data.email = !isEmpty(data.email) ? data.email : "";
  // data.userId = !isEmpty(data.userId) ? data.userId : "";
  // data.username = !isEmpty(data.username) ? data.username : "";
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.houseNo = !isEmpty(data.houseNo) ? data.houseNo : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.state = !isEmpty(data.state) ? data.state : "";
  data.pincode = !isEmpty(data.pincode) ? data.pincode : "";
  data.mobile = !isEmpty(data.mobile) ? data.mobile : "";
  data.countryCode = !isEmpty(data.countryCode) ? data.countryCode : "";

  if (Validator.isEmpty(data.countryCode)) {
    errors.countryCode = "Country code should not be empty";
  }
  // if (Validator.isEmpty(data.email)) {
  //   errors.email = "Email could not be empty";
  // }

  // if (!Validator.isEmail(data.email)) {
  //   errors.email = "Format your email correctly";
  // }
  if (!Validator.isLength(data.firstName, { min: 2, max: 10 })) {
    errors.firstName = "Check firstname length";
  }
  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First Name Required";
  }
  // if (Validator.isEmpty(data.userId)) {
  //   errors.userId = "User Id Required";
  // }

  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last Name Required";
  }

  // if (Validator.isEmpty(data.username)) {
  //   errors.username = "User Name should not be empty";
  // }

  if (Validator.isEmpty(data.houseNo)) {
    errors.houseNo = "House number should not be empty";
  }
  if (Validator.isEmpty(data.city)) {
    errors.city = "City should not be empty";
  }
  if (Validator.isEmpty(data.state)) {
    errors.state = "State should not be empty";
  }
  if (Validator.isEmpty(data.pincode)) {
    errors.pincode = "Pincode should not be empty";
  }
  if (!Validator.isLength(data.mobile, { min: 10, max: 10 })) {
    errors.mobile = "Check Mobile number length";
  }

  if (Validator.isEmpty(data.mobile)) {
    errors.mobile = "mobile should not be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
