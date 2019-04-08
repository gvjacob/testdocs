# JS TestDocs

## Features

Tests as documentation! Hovering over a Javascript symbol gives you a top down overview of its tests. File name convention and considered test blocks can be configured.

<img src="./assets/example.gif" styles="width: 100%">

## Requirements

- [Lodash](https://lodash.com/)
- [Monet](https://monet.github.io/monet.js/)

## Extension Settings

This extension contributes the following settings:

- `testdocs.testFileNames`: prioritized list of files to scan for tests
- `testdocs.ignoredBlocks`: ignored test blocks
- `testdocs.flattenBlocks`: flattened test blocks

> Definition: **test block** includes _describe_, _suite_, _context_, etc.
