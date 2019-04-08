const assert = require('assert');
const {
  getSettings,
  pullDescriptionFrom,
  withoutExtension,
  tryReturn,
  add,
  fromEmpty,
} = require('../utils');

suite('getSettings', () => {
  test('returns the correct setting fields', () => {
    const settings = getSettings();

    assert.ok(settings.testFileNames);
    assert.ok(settings.ignoredBlocks);
    assert.ok(settings.flattenBlocks);
  });
});

suite('pullDescriptionFrom', () => {
  test('pulls string from text with doubel quotes as a Just', () => {
    const quoted = '"quotes"';
    const text = `This has ${quoted}`;

    assert.equal(pullDescriptionFrom(text).some(), 'quotes');
  });

  test('pulls string from text with single quotes as a Just', () => {
    const quoted = "'quotes'";
    const text = `This has single ${quoted}`;

    assert.equal(pullDescriptionFrom(text).some(), 'quotes');
  });

  test('returns Nothing if quoted is not found', () => {
    const text = 'This has no quoted';

    assert(pullDescriptionFrom(text).isNothing());
  });

  test('returns Nothing if empty string is given', () => {
    assert(pullDescriptionFrom('').isNothing());
  });
});

suite('withoutExtension', () => {
  test('grabs file name without extension', () => {
    const fileNameWithoutExtension = 'nameOfFile';
    const fileName = `${fileNameWithoutExtension}.js`;

    assert.equal(withoutExtension(fileName), fileNameWithoutExtension);
  });
});
