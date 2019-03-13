const {
  commands,
  languages,
  workspace,
  extensions,
  window,
  Hover,
  MarkdownString,
} = require('vscode');
const { ExtensionContext } = require('vscode');

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  console.log(workspace.name, workspace.rootPath);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('extension.testdocs', function() {
    // Register the hover provider
    languages.registerHoverProvider('javascript', {
      provideHover({ fileName }, { line, character }) {
        const markdown = getMarkdown(fileName, line, character);
        return new Hover(markdown);
      },
    });
  });

  context.subscriptions.push(disposable);
}

/**
 * Get the markdown test documentation from hovered
 * word in the given document.
 *
 * @param {string} fileName path to file with hover
 * @param {int} line line number
 * @param {int} character character number
 * @returns {string} markdown string
 */
function getMarkdown(fileName, line, character) {
  // const hoveredModule = getHoveredModule(fileName, line, character);
  // const moduleDirectory = getModuleDirectory(hoveredModule);
  // const testFileName = getTestFileName(moduleDirectory);
  // const { moduleName, testSuites } = getTestFileStructure(testFileName);
  return new MarkdownString(
    '### Module ### \n' + 'should return a string\n' + '\nshould only take in a string \n',
  );
}

/**
 * Get the module of the hovered item in file.
 *
 * @param {string} fileName
 * @param {int} line
 * @param {int} character
 * @returns {string}
 */
function getHoveredModule(fileName, line, character) {}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
