
"use strict";

const fs = require("fs");
const path = require("path");

module.exports = function getPackageJson(folder) {
  // TODO: Could, simply, require be used to load the file?
  const packagePath = path.resolve(folder || process.cwd(), "package.json");
  
  return JSON.parse(fs.readFileSync(path.resolve(packagePath)));
};