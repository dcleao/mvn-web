
const {execSync} = require("child_process");

module.exports = {

  compileSourceStep(builder) {
    const folder = builder.options.folder;
    const src = builder.options.src;
    const srcCompiled = builder.options.srcCompiled;
    
    compileStep(folder, src, srcCompiled);
  },

  compileTestStep(builder) {
    const folder = builder.options.folder;
    const src = builder.options.test;
    const srcCompiled = builder.options.testCompiled;
    
    compileStep(folder, src, srcCompiled);
  }
};

function compileStep(folder, src, srcCompiled) {

  execSync(`npx babel ${src} --out-dir ${srcCompiled} --source-maps true`, {
    cwd: folder,
    stdio: [0, 1, 2]
  });
}
