# TestDocs

Tests as documentation! This is a VSCode extension that gives you a convenient lens to the tests of your Javascript symbols. Hovering over a symbol gives you a top down overview of its tests. File name convention and considered test blocks can be configured through the extension's settings.

<img src="https://raw.githubusercontent.com/gvjacob/testdocs/master/assets/example.png" styles="width: 100%">

## Extension Settings

This extension contributes the following settings:

* `testdocs.testFileNames`: prioritized list of files to scan for tests
* `testdocs.ignoredBlocks`: ignored test blocks
* `testdocs.flattenBlocks`: flattened test blocks


> **Definition**: A **test block** includes _describe_, _suite_, _context_, etc.
> **Conventions**: Use _\_\_filename\_\__ to denote file name of hovered symbol, _\_\_symbol\_\__, for name of symbol, or _\_\_root\_\__ for path to project's root directory when specifying _testFileNames_.
