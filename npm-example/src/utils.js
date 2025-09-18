// Utility functions for the example
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const reverse = (str) => str.split('').reverse().join('');

const isEven = (num) => num === 2;
const isOdd = (num) => num === 1;

module.exports = {
  add,
  multiply,
  subtract,
  divide,
  capitalize,
  reverse,
  isEven,
  isOdd
};
