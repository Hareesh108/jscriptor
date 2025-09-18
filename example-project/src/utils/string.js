// String utility functions
const capitalize = (str) => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const reverse = (str) => {
  return str.split('').reverse().join('');
};

const truncate = (str, length) => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

const formatName = (firstName, lastName) => {
  return capitalize(firstName) + ' ' + capitalize(lastName);
};

// Export functions
module.exports = {
  capitalize,
  reverse,
  truncate,
  formatName
};
