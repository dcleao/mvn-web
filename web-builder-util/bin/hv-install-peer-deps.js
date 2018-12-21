#!/usr/bin/env node

const {execSync} = require("child_process");

// The host package has:
// postinstall: "hv-install-peer-deps".
const hostFolder = process.cwd();

// The package in which the peerDependencies of host will be installed.
const rootHostFolder = process.env.INIT_CWD;

// When the host package is installing itself, locally, INIT_CWD === PWD.
// On the contrary, when the host package is installing as a dependency of another root host package,
// then these are different. Specifically, INIT_CWD is the root package folder.
if (rootHostFolder === hostFolder) {
  return;
}

const getPackageJson = require("../getPackageJson.js");

const hostPackageJson = getPackageJson(hostFolder);
const peerDependencies = hostPackageJson.peerDependencies;
const peerDependenciesSaveAs = hostPackageJson.peerDependenciesSaveAs || {};

let rootHostPackageJson;

if (peerDependencies !== undefined) {
  rootHostPackageJson = getPackageJson(rootHostFolder);

  const notInstalledDependencyIds = Object.keys(peerDependencies).filter(
    depId => !hasDeclaredDependency(depId)
  );
  const saveAsProdDepIds = notInstalledDependencyIds.filter(depId =>
    isSaveAsProd(depId)
  );
  const otherDepIds = notInstalledDependencyIds.filter(
    depId => !isSaveAsProd(depId)
  );

  if (saveAsProdDepIds.length > 0) {
    installDependency(buildPackagesInstallText(saveAsProdDepIds), true);
  }

  if (otherDepIds.length > 0) {
    installDependency(buildPackagesInstallText(otherDepIds), false);
  }
}

function hasDeclaredDependency(depId) {
  return (
    hasProp(rootHostPackageJson.dependencies, depId) ||
    hasProp(rootHostPackageJson.devDependencies, depId) ||
    hasProp(rootHostPackageJson.optionalDependencies, depId)
  );
}

function hasProp(obj, prop) {
  return obj != null && obj[prop] !== undefined;
}

function isSaveAsProd(depId) {
  switch (peerDependenciesSaveAs[depId]) {
    case "prod":
    case "production":
      return true;
  }

  return false;
}

function buildPackagesInstallText(depIds) {
  return depIds.map(depId => `${depId}@${peerDependencies[depId]}`).join(" ");
}

function installDependency(packages, saveAsProdDep) {
  execSync(
    `npm install ${packages} --no-package-lock --silent ${
      saveAsProdDep ? "--save" : "--no-save"
    }`,
    {
      cwd: rootHostFolder,
      stdio: [0, 1, 2]
    }
  );
}
