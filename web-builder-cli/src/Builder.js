
"use strict";

const path = require("path");
const {execSync} = require("child_process");
const getPackageJson = require("./getPackageJson.js");
const getRegisteredPlugins = require("./getRegisteredPlugins.js");

// npm install should have been performed.
// Could check existence of node_modules.

class Builder {

  constructor(options = {}) {

    this.options = {
      folder: options.folder || process.cwd(),
      plugins: this._initPlugins(options.plugins),
    };

    console.log(`registered plugins: ${this.options.plugins.map(pluginInfo => pluginInfo.id)}`);

    const resolvePathOption = (name, defaultValue) => {
      return this._resolveFolderPath(readConfigOption(options, name, defaultValue)); 
    };

    Object.assign(this.options, {
      src: resolvePathOption("src", "src"),
      srcCompiled: resolvePathOption("srcCompiled", "target/src-compiled"),
      srcBundled: resolvePathOption("srcBundled", "target/src-bundled"),
      srcLintReport: resolvePathOption("srcLintReport", "target/src-lint-report.json"),
      test: resolvePathOption("test", "test"),
      testCompiled: resolvePathOption("testCompiled", "target/test-compiled"),
      testLintReport: resolvePathOption("testLintReport", "target/test-lint-report.json"),
      testRunReport: resolvePathOption("testRunReport", "target/test-run-report.json"),
      testCoverageReport: resolvePathOption("testCoverageReport", "target/test-coverage-report.json")
    });

    Object.freeze(this.options);

    this._targetScripts = getPackageJson(this.options.folder).scripts;
    
    // Really need this? How should these be named? After npm_config_pwb_?
    this._defaultScriptEnvExtra = Object.freeze({
      "pwb_src": this.options.src,
      "pwb_srcCompiled": this.options.srcCompiled,
      "pwb_srcBundled": this.options.srcBundled,
      "pwb_srcLintReport": this.options.srcLintReport,
      "pwb_test": this.options.test,
      "pwb_testCompiled": this.options.testCompiled,
      "pwb_testLintReport": this.options.testLintReport,
      "pwb_testRunReport": this.options.testRunReport,
      "pwb_testCoverageReport": this.options.testCoverageReport
    });
  }

  _initPlugins(pluginsSpec) {
    
    if(Array.isArray(pluginsSpec)) {
      const plugins = [];
      pluginsSpec.filter((pluginSpec) => {

        const [id, steps = null] = Array.isArray(pluginSpec) ? pluginSpec : [pluginSpec];
        if(id) {
          // TODO: alias -> id
          const plugin = require(id);
          if(plugin != null && typeof plugin === "object") {
            
            steps = Array.isArray(steps) ? steps.slice() : null;

            plugins.push({id, plugin, steps});
          }
        }
      });

      return plugins;
    }

    // Default to globally registered plugins.
    return getRegisteredPlugins();
  }

  // ---

  // region Clean Life-cycle Phase methods
  clean() {
    this.cleanSourceStep();
    this.cleanTestStep();
    this.cleanBundleStep();
  }
  // endregion

  // region Docs Life-cycle Phase methods
  generateDocs() {
    this.generateDocsStep();
  }
  // endregion

  // region Main Life-cycle Phase methods

  // Main life-cycle phases:
  //   lint, compile, test, bundle, verify, install, publish
  //
  //   lintSourceStep
  //         compileSourceStep
  //
  //                  lintTestStep
  //                  compileTestStep
  //                  runTestStep
  //
  //                        bundleStep
  //                                verifyStep

  lint() {
    this.lintSourceStep();
  }

  compile() {
    this.lint();

    this.compileSourceStep();
  }

  test() {
    this.compile();

    this.lintTestStep();
    this.compileTestStep();
    
    this.runTestStep();
  }

  bundle() {
    this.test();

    this.bundleStep();
  }
  
  verify() {
    this.bundle();
    
    this.verifyStep();
  }

  install() {
    this.verify();

    this.installStep();
  }

  publish() {
    this.install();

    this.publishStep();
  }
  // endregion

  // region Step Methods
  lintSourceStep() {
    return this._doStep("lintSource");
  }

  compileSourceStep() {
    return this._doStep("compileSource");
  }

  lintTestStep() {
    return this._doStep("lintTest");
  }

  compileTestStep() {
    return this._doStep("compileTest");
  }

  runTestStep() {
    return this._doStep("runTest");
  }

  bundleStep() {
    return this._doStep("bundle");
  }

  verifyStep() {
    return this._doStep("verify");
  }

  installStep() {
    return this._doStep("install");
  }

  publishStep() {
    return this._doStep("publish");
  }

  generateDocsStep() {
    return this._doStep("generateDocs");
  }

  cleanSourceStep() {
    return this._doStep("cleanSource");
  }

  cleanTestStep() {
    return this._doStep("cleanTest");
  }

  cleanBundleStep() {
    return this._doStep("cleanBundle");
  }
  // endregion

  _doStep(stepName) {
    return this._runScriptIfDefined(stepName) || this._runPluginIfDefined(stepName);
  }

  _runScriptIfDefined(stepName, {envExtra = this._defaultScriptEnvExtra} = {}) {
  
    const scriptName = `pwb:${stepName}`;
    
    if(typeof this._targetScripts[scriptName] === "string") {
      
      console.log(`will run script ${scriptName}`);
      
      const scriptEnv = Object.assign({}, process.env, envExtra);
  
      execSync(`npm run ${scriptName}`, {cwd: this.options.folder, env: scriptEnv, stdio: [0, 1, 2]});
  
      console.log(`did run script ${scriptName}`);
  
      return true;
    }
  
    console.log(`script ${scriptName} is not defined`);
    return false;
  }

  _runPluginIfDefined(stepName) {

    const fullStepName = `${stepName}Step`;

    return this.options.plugins.some(pluginInfo => {
      if(typeof pluginInfo.plugin[fullStepName] === "function" && 
         (pluginInfo.steps === null || pluginInfo.steps.includes(stepName))) {
        
        // Stop unless the plugin returns `false`.
        console.log(`running plugin ${pluginInfo.id} step ${stepName}`);
        if(pluginInfo.plugin[fullStepName](this) !== false) {
          return true;
        }
      }

      return false;
    });
  }
  
  _resolveFolderPath(part) {
    return path.resolve(this.options.folder, part);
  }
}

function readConfigOption(options, name, defaultValue) {
  let value = options[name];
  if(value == null) {
    value = process.env[`npm_config_pwb_${name}`];
  }
  
  return value == null ? defaultValue : value;
}

module.exports = Builder;