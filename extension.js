const {
  commands,
  languages,
  workspace,
  Hover,
  MarkdownString,
} = require('vscode');

const { Maybe, Some, Nothing } = require('monet');
const { isEmpty } = require('lodash');

const {
  getSettings,
  withoutExtension,
  pullDescriptionFrom,
  tryReturn,
} = require('./utils');

const { markify } = require('./markdown');

let settings;

Object.prototype.add = (key, value) => {
  const copy = Object.assign({}, this);
  copy[key] = value;
  return copy;
};

/**
 * Activates the testdoc extension.
 * @param {ExtensionContext} context
 */
function activate(context) {
  let disposable = commands.registerCommand('extension.testdocs', function() {
    languages.registerHoverProvider('javascript', {
      provideHover: async (document, position) => {
        settings = getSettings();

        try {
          const symbols = await getSymbolsMetadata(document, position);
          const testUris = await getValidTestUris(symbols);
          const testCases = await openDocuments(testUris, getTestCases);
          const markified = testCases.map(markify);
          return new Hover(new MarkdownString(markified[0]));
        } catch (error) {
          console.log(error);
        }
      },
    });
  });

  context.subscriptions.push(disposable);
}

/**
 * Get test URIs of given symbols if they exist.
 * @param {[DocumentSymbol]} symbols
 * @returns {[String]}
 */
async function getValidTestUris(symbols) {
  const maybeTestUris = await Promise.all(
    symbols.map(({ uri }) => findTestUriOf(uri.path)),
  );

  return maybeTestUris.filter((uri) => uri.isSome()).map((uri) => uri.some());
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
 * Creates a tree representation of symbols.
 * @param {[DocumentSymbol]} symbols
 * @returns {TestStructure}
 */
function treeify(symbols) {
  // const treeified = symbols.reduce((tree, { name, children }) => {
  //   const description = pullDescriptionFrom(name);
  //   return description.isNothing()
  //     ? tree
  //     : tree.add(description.some(), treeify(children));
  // }, {});

  // return isEmpty(treeified) ? Nothing() : Some(treeified);
  const tree = {};

  symbols.forEach(({ name, children }) => {
    const description = pullDescriptionFrom(name);
    if (description.isNothing()) {
      return;
    }
    tree[description.some()] = treeify(children);
  });

  return isEmpty(tree) ? Nothing() : Some(tree);
}

/**
 * Open given documents and map over them.
 *
 * @param {[String]} paths
 * @param {(TextDocument) -> T} docMapper
 * @returns {[T]}
 */
async function openDocuments(paths, docMapper) {
  const promises = paths.map(async (path) => {
    const doc = await workspace.openTextDocument(path);
    return await docMapper(doc);
  });

  return await Promise.all(promises);
}

/**
 * Find the test URI of given file.
 * @param {String} uri
 * @returns {String}
 */
async function findTestUriOf(uri) {
  const testUris = createTestUris(uri);
  return await findOneFrom(testUris);
}

/**
 * Create list of possible test URIs based on user settings.
 * @param {String} uri
 * @returns {[String]}
 */
function createTestUris(uri) {
  const sections = uri.split('/');
  const nameWithoutExtension = withoutExtension(sections.pop());

  const testUris = settings.testFileNames.map((file) =>
    sections.concat(file.replace('__name__', nameWithoutExtension)).join('/'),
  );

  return testUris;
}

/**
 * Get all the symbols in text document.
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
 * Find the first file that exists.
 * @param {[String]} filePaths
 * @returns {String}
 */
async function findOneFrom(filePaths) {
  for (const path of filePaths) {
    if (exists(path)) return Some(path);
  }

  return Nothing();
}

/**
 * Does given file exist?
 * @param {String} filePath
 * @returns {Boolean}
 */
async function exists(filePath) {
  return tryReturn(
    async () => await workspace.openTextDocument(filePath),
    false,
    true,
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
