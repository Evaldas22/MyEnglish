const validator = require("validator");
const isEmpty = require("is-empty");

const validateRegisterInput = teacher => {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  teacher.name = !isEmpty(teacher.name) ? teacher.name : "";
  teacher.password = !isEmpty(teacher.password) ? teacher.password : "";
  teacher.password2 = !isEmpty(teacher.password2) ? teacher.password2 : "";

  // Name checks
  if (validator.isEmpty(teacher.name)) {
    errors.name = "Name field is required";
  }
  
  // Password checks
  if (validator.isEmpty(teacher.password)) {
    errors.password = "Password field is required";
  }
  if (validator.isEmpty(teacher.password2)) {
    errors.password2 = "Confirm password field is required";
  }
  if (!validator.isLength(teacher.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
  if (!validator.equals(teacher.password, teacher.password2)) {
    errors.password2 = "Passwords must match";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateRegisterInput;