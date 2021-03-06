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

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}

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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

const countLines = require("./countLines");

const defaults = require("metro-config/src/defaults/defaults");

const getPreludeCode = require("./getPreludeCode");

const transformHelpers = require("./transformHelpers");

const _require = require("metro-hermes-compiler"),
  compile = _require.compile;

function getPrependedScripts(_x, _x2, _x3, _x4) {
  return _getPrependedScripts.apply(this, arguments);
}

function _getPrependedScripts() {
  _getPrependedScripts = _asyncToGenerator(function*(
    config,
    options,
    bundler,
    deltaBundler
  ) {
    // Get all the polyfills from the relevant option params (the
    // `getPolyfills()` method and the `polyfillModuleNames` variable).
    const polyfillModuleNames = config.serializer
      .getPolyfills({
        platform: options.platform
      })
      .concat(config.serializer.polyfillModuleNames);

    const transformOptions = _objectSpread(
      _objectSpread({}, options),
      {},
      {
        type: "script"
      }
    );

    const dependencies = yield deltaBundler.getDependencies(
      [defaults.moduleSystem].concat(_toConsumableArray(polyfillModuleNames)),
      {
        resolve: yield transformHelpers.getResolveDependencyFn(
          bundler,
          options.platform
        ),
        transform: yield transformHelpers.getTransformFn(
          [defaults.moduleSystem].concat(
            _toConsumableArray(polyfillModuleNames)
          ),
          bundler,
          deltaBundler,
          config,
          transformOptions
        ),
        onProgress: null,
        experimentalImportBundleSupport:
          config.transformer.experimentalImportBundleSupport,
        shallow: false
      }
    );
    return [
      _getPrelude({
        dev: options.dev,
        globalPrefix: config.transformer.globalPrefix
      })
    ].concat(_toConsumableArray(dependencies.values()));
  });
  return _getPrependedScripts.apply(this, arguments);
}

function _getPrelude(_ref) {
  let dev = _ref.dev,
    globalPrefix = _ref.globalPrefix;
  const code = getPreludeCode({
    isDev: dev,
    globalPrefix
  });
  const name = "__prelude__";
  return {
    dependencies: new Map(),
    getSource: () => Buffer.from(code),
    inverseDependencies: new Set(),
    path: name,
    output: [
      {
        type: "js/script/virtual",
        data: {
          code,
          lineCount: countLines(code),
          map: []
        }
      },
      {
        type: "bytecode/script/virtual",
        data: {
          bytecode: compile(code, {
            sourceURL: "__prelude__.virtual.js"
          }).bytecode
        }
      }
    ]
  };
}

module.exports = getPrependedScripts;
