// Math utility functions
const add = (a, b) => {
  return a + b;
};

const multiply = (x, y) => {
  return x * y;
};

const divide = (numerator, denominator) => {
  if (denominator === 0) {
    throw new Error("Division by zero");
  }
  return numerator / denominator;
};

const power = (base, exponent) => {
  return Math.pow(base, exponent);
};

// Export functions
module.exports = {
  add,
  multiply,
  divide,
  power
};
