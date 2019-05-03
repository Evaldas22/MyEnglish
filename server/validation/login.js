const validator = require("validator");
const isEmpty = require("is-empty");

const validateLoginInput = teacher => {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  teacher.name = !isEmpty(teacher.name) ? teacher.name : "";
  teacher.password = !isEmpty(teacher.password) ? teacher.password : "";

  // Name checks
  if (validator.isEmpty(teacher.name)) {
    errors.name = "Name field is required";
  }

  // Password checks
  if (validator.isEmpty(teacher.password)) {
    errors.password = "Password field is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateLoginInput;