//
// mdn-bcd-collector: unittest/unit/add-new-bcd.ts
// Unittest for the script to add new features to BCD
//
// © Google LLC, Gooborg Studios
// See LICENSE.txt for copyright details
//

import {assert} from 'chai';

import {getFilePath} from '../../add-new-bcd.js';

describe('add-new-bcd', () => {
  describe('API', () => {
    it('New interface', () => {
      assert.strictEqual(
        getFilePath(['api', 'NewInterface']),
        'api/NewInterface.json'
      );
    });

    it('New property on interface', () => {
      assert.strictEqual(
        getFilePath(['api', 'OldInterface', 'prop']),
        'api/OldInterface.json'
      );
    });

    it('New global', () => {
      assert.strictEqual(
        getFilePath(['api', 'newGlobal']),
        'api/_globals/newGlobal.json'
      );
    });
  });

  describe('CSS', () => {
    it('new property', () => {
      assert.strictEqual(
        getFilePath(['css', 'properties', 'new-property']),
        'css/properties/new-property.json'
      );
    });

    it('new property value', () => {
      assert.strictEqual(
        getFilePath(['css', 'properties', 'old-property', 'auto']),
        'css/properties/old-property.json'
      );
    });

    it('new at-rule', () => {
      assert.strictEqual(
        getFilePath(['css', 'at-rules', 'new-rule']),
        'css/at-rules/new-rule.json'
      );
    });

    it('new at-rule descriptor', () => {
      assert.strictEqual(
        getFilePath(['css', 'at-rules', 'old-rule', 'src']),
        'css/at-rules/old-rule.json'
      );
    });
  });

  describe('JS', () => {
    it('new class', () => {
      assert.strictEqual(
        getFilePath(['javascript', 'builtins', 'Thing']),
        'javascript/builtins/Thing.json'
      );
    });

    it('new global', () => {
      assert.strictEqual(
        getFilePath(['javascript', 'builtins', 'createMagic']),
        'javascript/builtins/globals.json'
      );
    });

    it('Array constructor', () => {
      assert.strictEqual(
        getFilePath(['javascript', 'builtins', 'Array', 'Array']),
        'javascript/builtins/Array.json'
      );
    });

    it('Array method', () => {
      assert.strictEqual(
        getFilePath(['javascript', 'builtins', 'Array', 'sort']),
        'javascript/builtins/Array.json'
      );
    });

    it('Intl method', () => {
      assert.strictEqual(
        getFilePath(['javascript', 'builtins', 'Intl', 'getCanonicalLocales']),
        'javascript/builtins/Intl.json'
      );
    });

    it('Intl.Collator method', () => {
      assert.strictEqual(
        getFilePath(['javascript', 'builtins', 'Intl', 'Collator', 'maximize']),
        'javascript/builtins/Intl/Collator.json'
      );
    });
  });

  it('Unknown part of BCD', () => {
    assert.throws(() => getFilePath(['lol', 'no']));
  });
});
