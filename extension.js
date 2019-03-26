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

const { Maybe, Some, Nothing } = require('monet');

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
        const symbols = await getSymbolsMetadata(document, position);
        const testUris = symbols.map((symbol) => getTestUri(symbol.uri.path));
        const testCases = await openDocuments(testUris, getTestCases);
        const markified = testCases.map((cases) => markify(cases, 0));
        console.log(markified[0]);
        return new Hover(new MarkdownString(markified[0]));
      },
    });
  });

  context.subscriptions.push(disposable);
}

/**
 * Get the test descriptions and cases from
 * given text document.
 * @param {TextDocument} doc
 * @returns {TestStructure}
 */
function getTestCases(doc) {
  return Some({
    ['Module Name']: Some({
      ['test case 1']: Nothing(),
      ['context']: Some({
        ['test case 2']: Nothing(),
      }),
    }),
  });
}

function markify(testCases, indent) {
  return Object.entries(testCases.orSome({})).reduce(
    (markdown, [testCase, children]) => {
      return markdown.concat(
        markifyLine(testCase, indent),
        '\n',
        markify(children, indent + 2),
      );
    },
    '',
  );
}

/**
 * Convert line to markdown given its indent specs.
 * @param {String} string
 * @param {Int} indent
 * @returns {String}
 */
function markifyLine(string, indent) {
  if (indent === 0) {
    return `#### ${string} ####`;
  }

  return `${' '.repeat(indent)}- ${string}`;
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
    return docMapper(doc);
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
  const withTest = uriSections
    .slice(0, uriSections.length - 1)
    .concat('index.test.js');

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
