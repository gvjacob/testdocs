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

suite('tryReturn', () => {
  const value = 'value';
  const passingFunc = () => value;
  const failingFunc = () => {
    throw new Error('failed');
  };

  suite('successful', () => {
    test('returns result of function if success is not given', async () => {
      assert.equal(await tryReturn(passingFunc, false), value);
    });

    test('returns given success value', async () => {
      assert.equal(await tryReturn(passingFunc, false, true), true);
    });
  });

  suite('failed', () => {
    test('returns failure case', async () => {
      assert.equal(await tryReturn(failingFunc, false), false);
    });

    test('returns failure case regardless of success case', async () => {
      assert.equal(await tryReturn(failingFunc, false, true), false);
    });
  });
});

suite('add', () => {
  const value = 'value';
  const value2 = 'value2';
  const obj = { key: value };
  const obj2 = { key2: value2 };

  test('add to given object', () => {
    assert.deepEqual(add(obj, 'key2', value2), { ...obj, ...obj2 });
  });

  test('add to empty object', () => {
    assert.deepEqual(add({}, 'key2', value2), obj2);
  });
});

suite('fromEmpty', () => {
  suite('empty value', () => {
    test('returns Nothing if empty', () => {
      assert.ok(fromEmpty({}).isNothing());
      assert.ok(fromEmpty([]).isNothing());
      assert.ok(fromEmpty('').isNothing());
    });
  });

  suite('non empty value', () => {
    test('returns Just of value if not empty', () => {
      assert.ok(fromEmpty({ key: 1 }).isSome());
      assert.ok(fromEmpty([1]).isSome());
      assert.ok(fromEmpty('not empty').isSome());
    });
  });
});
