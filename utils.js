const { workspace } = require('vscode');
const { Maybe, Some, Nothing } = require('monet');

/**
 * Get testdocs settings.
 *
 * @returns {WorkspaceConfiguration}
 */
const getSettings = () => {
  return workspace.getConfiguration('testdocs');
};

/**
 * Grab the description of given test block.
 * @param {String} string
 * @returns {Maybe} description of test block
 */
const pullDescriptionFrom = (string) => {
  const pattern = /[\"\'](.*)[\"\']/;
  const found = string.match(pattern);
  return found ? Some(found[1] || 'Undefined test case') : Nothing();
};

/**
 * Return the fileName without its file extension.
 * @param {String} fileName
 */
const withoutExtension = (fileName) => {
  return fileName.substring(0, fileName.lastIndexOf('.'));
};

/**
 * Try given function, and return specified values.
 * @param {() -> T} func
 * @param {U} error
 * @param {V} success
 * @returns {T | U | V}
 */
const tryReturn = async (func, error, success) => {
  try {
    return success || (await func());
  } catch (err) {
    return error;
  }
};

module.exports = {
  getSettings,
  pullDescriptionFrom,
  withoutExtension,
  tryReturn,
};
