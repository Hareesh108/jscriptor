// test-utils.ts

const failedTests: string[] = [];

export const PASS = "✅";
export const FAIL = "❌";

export function assert(condition: boolean, message: string = "Assertion failed"): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual<T>(actual: T, expected: T, message: string = "Values are not equal"): void {
  if (typeof expected === "object" && expected !== null) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(
        `${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`
      );
    }
  } else if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

let hasPrintedStartMessage = false;

export function test(name: string, testFn: () => void): boolean {
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
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Unknown error: ${error}`);
    }
    failedTests.push(name);
    return false;
  }
}

export function summarize(): boolean {
  console.log("\n=== Test Summary ===\n");
  if (failedTests.length === 0) {
    console.log(`${PASS} All tests passed!`);
    return true;
  } else {
    console.log(`${FAIL} Some tests failed:`);
    failedTests.forEach((test) => {
      console.log(`  - ${test}`);
    });
    process.exitCode = 1;
    return false;
  }
}
