#!/usr/bin/env node

const Builder = require("../src/Builder.js");

const command = process.argv[2];

console.log(`pentaho-web-build ${command}`);

const folder = process.cwd();
const builder = new Builder({folder});

if(command && command[0] !== "_" && typeof builder[command] === "function") {
  builder[command]();
} else {
  console.warn(`Unknown command ${command}.`);
}