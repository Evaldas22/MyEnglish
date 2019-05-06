const validator = require("validator");
const isEmpty = require("is-empty");

const validateNewGroup = newGroup => {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  newGroup.groupName = !isEmpty(newGroup.groupName) ? newGroup.groupName.trim() : "";
  newGroup.teacherId = !isEmpty(newGroup.teacherId) ? newGroup.teacherId : "";

  // Group name check
  if (validator.isEmpty(newGroup.groupName)) {
    errors.groupName = "Gropup name field is required";
  }

  // TeacherId check
  if (validator.isEmpty(newGroup.teacherId)) {
    errors.teacherId = "TeacherId is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateNewGroup;