const { commands, languages, window, Hover } = require('vscode');
const { ExtensionContext } = require('vscode');

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "testdocs" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('extension.helloWorld', function() {
    // The code you place here will be executed every time your command is executed
    languages.registerHoverProvider('javascript', {
      provideHover(document, position, token) {
        console.log(document, position, token);
        return new Hover([
          document.fileName,
          position.line.toString(),
          position.character.toString(),
        ]);
      },
    });
    // Display a message box to the user
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
