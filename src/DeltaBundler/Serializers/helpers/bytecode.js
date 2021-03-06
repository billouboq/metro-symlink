/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */
"use strict";

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

const invariant = require("invariant");

const path = require("path");

const _require = require("metro-hermes-compiler"),
  compile = _require.compile;

function wrapModule(module, options) {
  const output = getBytecodeOutput(module);

  if (output.type.startsWith("bytecode/script")) {
    return [output.data.bytecode];
  }

  const params = [
    options.createModuleId(module.path),
    "[" +
      Array.from(module.dependencies.values())
        .map(dependency => options.createModuleId(dependency.absolutePath))
        .join(",") +
      "]"
  ];

  if (options.dev) {
    // Add the relative path of the module to make debugging easier.
    // This is mapped to `module.verboseName` in `require.js`.
    params.push(
      JSON.stringify(path.relative(options.projectRoot, module.path))
    );
  }

  const headerCode = `globalThis.$$METRO_D=[${params.join(",")}];`;
  return [
    compile(headerCode, {
      sourceURL: module.path + "-virtual.js"
    }).bytecode,
    output.data.bytecode
  ];
}

function getBytecodeOutput(module) {
  const output = module.output
    .filter(_ref => {
      let type = _ref.type;
      return type.startsWith("bytecode/");
    })
    .map(output =>
      output.data.bytecode instanceof Buffer
        ? output // Re-create buffers after losing the Buffer instance when sending data over workers.
        : _objectSpread(
            _objectSpread({}, output),
            {},
            {
              data: _objectSpread(
                _objectSpread({}, output.data),
                {},
                {
                  bytecode: Buffer.from(output.data.bytecode.data)
                }
              )
            }
          )
    );
  invariant(
    output.length === 1,
    `Modules must have exactly one bytecode output, but ${module.path} has ${output.length} bytecode outputs.`
  );
  return output[0];
}

function isBytecodeModule(module) {
  return (
    module.output.filter(_ref2 => {
      let type = _ref2.type;
      return type.startsWith("bytecode/");
    }).length > 0
  );
}

module.exports = {
  getBytecodeOutput,
  isBytecodeModule,
  wrapModule
};
