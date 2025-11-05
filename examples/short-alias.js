/**
 * Short alias (PLG) example
 *
 * This example demonstrates using the PLG alias for less typing.
 * Perfect when you have many progress updates throughout your code.
 */

const { PLG } = require('../dist/cjs/index.js');

// Use PLG instead of ProgressLogger - saves typing!
PLG('data-processing').setTotal(500);

console.log('Processing data with PLG alias...\n');

let current = 0;
const interval = setInterval(() => {
  current++;
  PLG('data-processing').increment();

  if (current >= 500) {
    clearInterval(interval);
    console.log('\n✅ Processing complete!');
  }
}, 20);
