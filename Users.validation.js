const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateUser(data) {
  const errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.familyName = !isEmpty(data.familyName) ? data.familyName : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.role = !isEmpty(data.role) ? data.role : "";
  data.CIN = !isEmpty(data.CIN) ? data.CIN : "";
  data.fonction = !isEmpty(data.fonction) ? data.fonction : "";
  data.etablissement = !isEmpty(data.etablissement) ? data.etablissement : "";

  if (validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (validator.isEmpty(data.familyName)) {
    errors.familyName = "Family Name field is required";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (validator.isEmpty(data.role)) {
    errors.role = "Role field is required";
  }

  if (validator.isEmpty(data.CIN)) {
    errors.CIN = "CIN field is required";
  } else if (!validator.isNumeric(data.CIN)) {
    errors.CIN = "CIN must be a number";
  } else if (data.CIN.length !== 8) {
    errors.CIN = "CIN must be 8 digits long";
  } else if (data.CIN[0] !== "1" && data.CIN[0] !== "0") {
    errors.CIN = "CIN must start with 1 or 0";
  }

  if (validator.isEmpty(data.fonction)) {
    errors.fonction = "Fonction field is required";
  }

  if (validator.isEmpty(data.etablissement)) {
    errors.etablissement = "Etablissement field is required";
  }

  if (data.image === null) {
    errors.image = "Image field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
