const { Calculator } = require('./components/calculator');
const { capitalize, reverse } = require('./utils/string');

// Main application
function main() {
  console.log('Starting JScriptor Example App');
  
  // Create a calculator
  const calc = new Calculator('Advanced');
  console.log('Created: ' + calc.getDisplayName());
  
  // Perform some calculations
  const sum = calc.calculate('add', 10, 5);
  const product = calc.calculate('multiply', 3, 4);
  const quotient = calc.calculate('divide', 20, 4);
  
  console.log('Sum: ' + sum);
  console.log('Product: ' + product);
  console.log('Quotient: ' + quotient);
  
  // String operations
  const greeting = capitalize('hello world');
  const reversed = reverse('JScriptor');
  
  console.log('Greeting: ' + greeting);
  console.log('Reversed: ' + reversed);
  
  // Show calculation history
  console.log('\nCalculation History:');
  const history = calc.getHistory();
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    console.log((i + 1) + '. ' + entry.operation + '(' + entry.operands.join(', ') + ') = ' + entry.result);
  }
  
  console.log('\nApp completed successfully!');
}

// Run the app
main();
