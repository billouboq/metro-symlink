/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
 */
"use strict"; // $FlowExpectedError: TODO(t67543266): `source-map` is hard to type.

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

const sourceMap = require("source-map");

function mergeSourceMaps(file, originalMap, secondMap) {
  const merged = new sourceMap.SourceMapGenerator();
  const inputMap = new sourceMap.SourceMapConsumer(originalMap);
  new sourceMap.SourceMapConsumer(secondMap).eachMapping(mapping => {
    const original = inputMap.originalPositionFor({
      line: mapping.originalLine,
      column: mapping.originalColumn
    });

    if (original.line == null) {
      return;
    }

    merged.addMapping({
      generated: {
        line: mapping.generatedLine,
        column: mapping.generatedColumn
      },
      original: {
        line: original.line,
        column: original.column || 0
      },
      source: file,
      name: original.name || mapping.name
    });
  });
  return _objectSpread(
    _objectSpread({}, merged.toJSON()),
    {},
    {
      sources: inputMap.sources
    }
  );
}

module.exports = mergeSourceMaps;
