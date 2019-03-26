const { commands, languages, workspace, Hover, MarkdownString } = require('vscode');

const { Maybe, Some, Nothing } = require('monet');
const { isEmpty } = require('lodash');

/**
 * Activates the testdocs extension.
 * @param {ExtensionContext} context
 */
function activate(context) {
  let disposable = commands.registerCommand('extension.testdocs', function() {
    // Register the hover provider
    languages.registerHoverProvider('javascript', {
      async provideHover(document, position) {
        const symbols = await getSymbolsMetadata(document, position);
        const testUris = symbols.map((symbol) => getTestUri(symbol.uri.path));
        const testCases = await openDocuments(testUris, getTestCases);
        const markified = testCases.map((cases) => markify(cases, 0));
        return new Hover(new MarkdownString(markified[0]));
      },
    });
  });

  context.subscriptions.push(disposable);
}

/**
 * Get all the symbols if the given document.
 * @param {TextDocument} document
 * @returns {[DocumentSymbol]}
 */
async function getSymbols(document) {
  const symbols = await commands.executeCommand(
    'vscode.executeDocumentSymbolProvider',
    document.uri,
  );

  return symbols || [];
}

function grabDescription(string) {
  const pattern = /[\"\'](.*)[\"\']/;
  const found = string.match(pattern);
  return found ? found[1] || 'Undefined Test Case' : '';
}

/**
 * Creates a tree representation of symbols.
 * @param {[DocumentSymbol]} symbols
 * @returns {TestStructure}
 */
function treeify(symbols) {
  const tree = {};

  symbols.forEach(({ name, children }) => {
    const description = grabDescription(name);
    if (!description) {
      return;
    }
    tree[description] = treeify(children);
  });

  return isEmpty(tree) ? Nothing() : Some(tree);
}

/**
 * Get the test descriptions and cases from
 * given text document.
 * @param {TextDocument} doc
 * @returns {TestStructure}
 */
async function getTestCases(doc) {
  const symbols = await getSymbols(doc);
  return treeify(symbols);
}

/**
 * Convert given test structure to markdown.
 *
 * @param {TestStructure} testCases
 * @param {Int} indent
 * @returns {String}
 */
function markify(testCases, indent) {
  return Object.entries(testCases.orSome({})).reduce((markdown, [testCase, children]) => {
    return markdown.concat(markifyLine(testCase, indent), '\n', markify(children, indent + 1));
  }, '');
}

/**
 * Convert line to markdown given its indent specs.
 * @param {String} string
 * @param {Int} indent
 * @returns {String}
 */
function markifyLine(string, indent) {
  if (indent === 0) {
    return `**${string}**\n`;
  }

  return `${' '.repeat(indent * 2)}- ${string}`;
}

/**
 * Open all the given documents and return the result
 * of mapping on them with the mapper
 *
 * @param {[String]} filePaths
 * @param {(TextDocument) -> T} docMapper
 * @returns {[T]}
 */
async function openDocuments(filePaths, docMapper) {
  const promises = filePaths.map(async (path) => {
    const doc = await workspace.openTextDocument(path);
    return await docMapper(doc);
  });

  return await Promise.all(promises);
}

/**
 * Get symbol definition metadata.
 * @param {TextDocument} document
 * @param {Position} position
 * @returns {[Location]}
 */
async function getSymbolsMetadata(document, position) {
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
 * @returns {String} uri of test file
 */
function getTestUri(uri) {
  const uriSections = uri.split('/');
  const withTest = uriSections.slice(0, uriSections.length - 1).concat('test.js');

  return withTest.join('/');
}

/**
 * Clean up function when extension deactivates.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
