let failedTests = [];

const PASS = "✅";
const FAIL = "❌";

function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message = "Values are not equal") {
  if (typeof expected === "object" && expected !== null) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(
        `${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`,
      );
    }
  } else if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

let hasPrintedStartMessage = false;

function test(name, testFn) {
  if (!hasPrintedStartMessage) {
    console.log("Running tests...");
    hasPrintedStartMessage = true;
  }

  try {
    testFn();
    console.log(`${PASS} ${name}`);
    return true;
  } catch (error) {
    console.log(`${FAIL} ${name}`);
    // Hide the stack trace but print the error message.
    console.error(`   Error: ${error.message}`);
    failedTests.push(name);
    return false;
  }
}

function summarize() {
  console.log("\n=== Test Summary ===\n");
  if (failedTests.length === 0) {
    console.log(`${PASS} All tests passed!`);
    return true;
  } else {
    console.log(`${FAIL} Some tests failed:`);
    failedTests.forEach((test) => {
      console.log(`  - ${test}`);
    });
    // Exit with a non-zero code when tests fail
    process.exitCode = 1;
    return false;
  }
}

// Export functions and constants for use in other files
module.exports = {
  test,
  assert,
  assertEqual,
  summarize,
  PASS,
  FAIL,
};
