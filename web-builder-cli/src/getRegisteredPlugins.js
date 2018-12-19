
"use strict";

const getPackageJson = require("./getPackageJson.js");

const patterns = [
  // Own plugins.
  /^@hitachivantara\/web-builder-plugin-(?:.*)$/,

  // Third-party plugins.
  /hitachivantara-web-builder-plugin-(?:.*)$/,
  /@(?:.+?)\/hitachivantara-web-builder-plugin-(?:.*)$/
];

module.exports = function getRegisteredPlugins(folder) {
  
  // Search for PentahoWebBuilder plugins in devDependencies.
  const devDependencies = getPackageJson(folder).devDependencies;
  
  if(devDependencies == null) {
    return [];
  }
  
  return Object.keys(devDependencies)
    .filter(id => patterns.some(pattern => pattern.test(id)))
    .map(id => {
      return {
        id,
        plugin: require(id),
        steps: null
      };
    });
};
