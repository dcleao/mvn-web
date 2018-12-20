
const fs = require("fs");
const path = require("path");

module.exports = {

  lintSourceStep(builder) {
    const src = builder.options.src;
    const lintReport = builder.options.srcLintReport;

    lintStep(src, lintReport);
  },

  lintTestStep(builder) {
    const src = builder.options.test;
    const lintReport = builder.options.testLintReport;

    lintStep(src, lintReport);
  }
};

function lintStep(src, lintReport) {
  
  const CLIEngine = require("eslint").CLIEngine;
  
  const cli = new CLIEngine();

  const report = cli.executeOnFiles([src]);

  const formatter = cli.getFormatter("json");

  const jsonReport = formatter(report.results);

  writeFileSync(lintReport, jsonReport);

  if(report.errorCount > 0) {
    throw new Error("There are linting errors.");
  }
}

function writeFileSync(file, data) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, data, {flag: "w"});
}
