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

const { Maybe, Just, Nothing } = require('monet');

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  console.log('activated');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('extension.testdocs', function() {
    // Register the hover provider
    languages.registerHoverProvider('javascript', {
      async provideHover(document, position) {
        const symbols = await getSymbolMetadata(document, position);
        const indexUri = symbols[0].uri.path;
        const testUri = await getTestUri(indexUri);
        return new Hover('HERE');
      },
    });
  });

  context.subscriptions.push(disposable);
}

/**
 * Get symbol definition metadata.
 * @param {TextDocument} document
 * @param {Position} position
 * @returns {[Location]}
 */
async function getSymbolMetadata(document, position) {
  const symbolMetadata = await commands.executeCommand(
    'vscode.executeDefinitionProvider',
    document.uri,
    position,
  );
  return symbolMetadata || [];
}

/**
 * Get the test file Uri given hovered symbol.
 * @param {String} uri uri of hovered symbol
 * @returns {Maybe} uri of test file
 */
async function getTestUri(uri) {
  const uriSections = uri.split('/');
  const withTest = uriSections.slice(0, uriSections.length - 1).concat('index.test.js');
  const testUri = withTest.join('/');

  workspace.openTextDocument(testUri);

  const foundFiles = workspace.findFiles(testUri);
  console.log(foundFiles);

  return foundFiles;
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
