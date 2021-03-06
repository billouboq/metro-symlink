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

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) ||
    _iterableToArrayLimit(arr, i) ||
    _unsupportedIterableToArray(arr, i) ||
    _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError(
    "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr)))
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
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

const getAppendScripts = require("../../lib/getAppendScripts");

const processBytecodeModules = require("./helpers/processBytecodeModules");

const _require = require("./helpers/js"),
  getJsOutput = _require.getJsOutput;

const _require2 = require("metro-hermes-compiler"),
  compile = _require2.compile;

function baseBytecodeBundle(entryPoint, preModules, graph, options) {
  for (const module of graph.dependencies.values()) {
    options.createModuleId(module.path);
  }

  const processModulesOptions = {
    filter: options.processModuleFilter,
    createModuleId: options.createModuleId,
    dev: options.dev,
    projectRoot: options.projectRoot
  }; // Do not prepend polyfills or the require runtime when only modules are requested

  if (options.modulesOnly) {
    preModules = [];
  }

  const modules = _toConsumableArray(graph.dependencies.values()).sort(
    (a, b) => options.createModuleId(a.path) - options.createModuleId(b.path)
  );

  const post = processBytecodeModules(
    getAppendScripts(
      entryPoint,
      [].concat(_toConsumableArray(preModules), _toConsumableArray(modules)),
      graph.importBundleNames,
      {
        asyncRequireModulePath: options.asyncRequireModulePath,
        createModuleId: options.createModuleId,
        getRunModuleStatement: options.getRunModuleStatement,
        inlineSourceMap: options.inlineSourceMap,
        projectRoot: options.projectRoot,
        runBeforeMainModule: options.runBeforeMainModule,
        runModule: options.runModule,
        sourceMapUrl: options.sourceMapUrl,
        sourceUrl: options.sourceUrl
      }
    ).map(module => {
      return _objectSpread(
        _objectSpread({}, module),
        {},
        {
          output: [].concat(_toConsumableArray(module.output), [
            {
              type: "bytecode/script/virtual",
              data: {
                bytecode: compile(getJsOutput(module).data.code, {
                  sourceURL: module.path
                }).bytecode
              }
            }
          ])
        }
      );
    }),
    processModulesOptions
  ).flatMap(_ref => {
    let _ref2 = _slicedToArray(_ref, 2),
      module = _ref2[0],
      bytecodeBundle = _ref2[1];

    return bytecodeBundle;
  });
  const processedModules = processBytecodeModules(
    _toConsumableArray(graph.dependencies.values()),
    processModulesOptions
  ).map(_ref3 => {
    let _ref4 = _slicedToArray(_ref3, 2),
      module = _ref4[0],
      bytecodeBundle = _ref4[1];

    return [options.createModuleId(module.path), bytecodeBundle];
  });
  return {
    pre: processBytecodeModules(preModules, processModulesOptions).flatMap(
      _ref5 => {
        let _ref6 = _slicedToArray(_ref5, 2),
          _ = _ref6[0],
          bytecodeBundle = _ref6[1];

        return bytecodeBundle;
      }
    ),
    post,
    modules: processedModules
  };
}

module.exports = baseBytecodeBundle;
