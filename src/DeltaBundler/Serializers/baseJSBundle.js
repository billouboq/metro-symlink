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

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

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

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
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

const getAppendScripts = require("../../lib/getAppendScripts");

const processModules = require("./helpers/processModules");

function baseJSBundle(entryPoint, preModules, graph, options) {
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

  const preCode = processModules(preModules, processModulesOptions)
    .map(_ref => {
      let _ref2 = _slicedToArray(_ref, 2),
        _ = _ref2[0],
        code = _ref2[1];

      return code;
    })
    .join("\n");

  const modules = _toConsumableArray(graph.dependencies.values()).sort(
    (a, b) => options.createModuleId(a.path) - options.createModuleId(b.path)
  );

  const postCode = processModules(
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
    ),
    processModulesOptions
  )
    .map(_ref3 => {
      let _ref4 = _slicedToArray(_ref3, 2),
        _ = _ref4[0],
        code = _ref4[1];

      return code;
    })
    .join("\n");
  return {
    pre: preCode,
    post: postCode,
    modules: processModules(
      _toConsumableArray(graph.dependencies.values()),
      processModulesOptions
    ).map(_ref5 => {
      let _ref6 = _slicedToArray(_ref5, 2),
        module = _ref6[0],
        code = _ref6[1];

      return [options.createModuleId(module.path), code];
    })
  };
}

module.exports = baseJSBundle;
