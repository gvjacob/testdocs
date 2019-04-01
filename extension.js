const {
  commands,
  languages,
  workspace,
  Hover,
  MarkdownString,
} = require('vscode');

const { Maybe, Some, Nothing } = require('monet');
const { isEmpty } = require('lodash');

const { getSettings } = require('./utils');

let settings;

/**
 * Activates the testdocs extension.
 * @param {ExtensionContext} context
 */
function activate(context) {
  let disposable = commands.registerCommand('extension.testdocs', function() {
    // Register the hover provider
    languages.registerHoverProvider('javascript', {
      async provideHover(document, position) {
        settings = getSettings();

        try {
          const symbols = await getSymbolsMetadata(document, position);
          const testUris = await Promise.all(
            symbols.map((symbol) => getTestUri(symbol.uri.path)),
          );
          const testCases = await openDocuments(testUris, getTestCases);
          const markified = testCases.map((cases) => markify(cases, 0));
          return new Hover(new MarkdownString(markified[0]));
        } catch (error) {
          console.log('ERROR', error);
        }
      },
    });
  });

  context.subscriptions.push(disposable);
}

/**
 * Get all the symbols of the given document.
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

/**
 * Grab the description of given test block.
 * @param {String} string
 * @returns {Maybe} description of test block
 */
function grabDescription(string) {
  const pattern = /[\"\'](.*)[\"\']/;
  const found = string.match(pattern);
  return found ? Some(found[1] || 'Undefined test case') : Nothing();
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
    if (description.isNothing()) {
      return;
    }
    tree[description.some()] = treeify(children);
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
  return Object.entries(testCases.orSome({})).reduce(
    (markdown, [testCase, children]) => {
      return markdown.concat(
        markifyLine(testCase, indent),
        '\n',
        markify(children, indent + 1),
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
async function getTestUri(uri) {
  const uriSections = uri.split('/');
  const fileName = extractFileName(uriSections[uriSections.length - 1]);

  const testUris = settings.testFileNames.map((file) => {
    return uriSections
      .slice(0, uriSections.length - 1)
      .concat(file)
      .join('/')
      .replace('__name__', fileName);
  });

  const foundFile = await getFoundFile(testUris);
  console.log('FOUND', foundFile);

  return foundFile;
}

/**
 *
 * @param {Array<String>} filePaths
 */
async function getFoundFile(filePaths) {
  for (const path of filePaths) {
    try {
      const doc = await workspace.openTextDocument(path);
      return path;
    } catch (error) {
      console.log(error);
    }
  }

  return '';
}

/**
 *
 * @param {String} fileName
 */
function extractFileName(fileName) {
  return fileName.substring(0, fileName.lastIndexOf('.'));
}

/**
 * Clean up function when extension deactivates.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
