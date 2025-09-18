const { add, multiply, divide, power } = require('../utils/math');
const { formatName } = require('../utils/string');

// Calculator class
class Calculator {
  constructor(name) {
    this.name = name;
    this.history = [];
  }

  calculate(operation, a, b) {
    let result;
    
    switch (operation) {
      case 'add':
        result = add(a, b);
        break;
      case 'multiply':
        result = multiply(a, b);
        break;
      case 'divide':
        result = divide(a, b);
        break;
      case 'power':
        result = power(a, b);
        break;
      default:
        throw new Error('Unknown operation: ' + operation);
    }
    
    // Add to history
    this.history.push({
      operation,
      operands: [a, b],
      result,
      timestamp: new Date()
    });
    
    return result;
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  getDisplayName() {
    return formatName(this.name, 'Calculator');
  }
}

// Create and export a default calculator
const defaultCalculator = new Calculator('Basic');

module.exports = {
  Calculator,
  defaultCalculator
};
