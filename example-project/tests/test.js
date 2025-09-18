// This file should be excluded by the config
const assert = require('assert');

function testMath() {
  assert.equal(2 + 2, 4);
  console.log('Math test passed');
}

function testString() {
  assert.equal('hello'.toUpperCase(), 'HELLO');
  console.log('String test passed');
}

// Run tests
testMath();
testString();
