let errors = [];

function reportError(message, node) {
  errors.push({ message, node });
}

function resetErrors() {
  errors = [];
}

function getErrors() {
  return errors;
}

module.exports = {
  reportError,
  resetErrors,
  getErrors,
};


