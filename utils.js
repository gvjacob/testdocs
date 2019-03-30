const { workspace } = require('vscode');

/**
 * Get testdocs settings.
 *
 * @returns {WorkspaceConfiguration}
 */
const getSettings = () => {
  return workspace.getConfiguration('testdocs');
};

module.exports = {
  getSettings,
};
