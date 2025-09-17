let errors = [];

function reportError(message, node) {
  errors.push({ message, node });
}

function getErrors() {
  return errors;
}

module.exports = { reportError, getErrors };
