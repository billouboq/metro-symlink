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

const MAGIC_UNBUNDLE_NUMBER = require("../../shared/output/RamBundle/magic-number");

const MAGIC_UNBUNDLE_FILENAME = "UNBUNDLE";
const JS_MODULES = "js-modules";

const buildSourcemapWithMetadata = require("../../shared/output/RamBundle/buildSourcemapWithMetadata.js");

const path = require("path");

const _require = require("./util"),
  getModuleCodeAndMap = _require.getModuleCodeAndMap,
  partition = _require.partition,
  toModuleTransport = _require.toModuleTransport;

function asMultipleFilesRamBundle(_ref) {
  let dependencyMapReservedName = _ref.dependencyMapReservedName,
    filename = _ref.filename,
    globalPrefix = _ref.globalPrefix,
    idsForPath = _ref.idsForPath,
    modules = _ref.modules,
    requireCalls = _ref.requireCalls,
    preloadedModules = _ref.preloadedModules;

  const idForPath = x => idsForPath(x).moduleId;

  const _partition = partition(modules, preloadedModules),
    _partition2 = _slicedToArray(_partition, 2),
    startup = _partition2[0],
    deferred = _partition2[1];

  const startupModules = [].concat(
    _toConsumableArray(startup),
    _toConsumableArray(requireCalls)
  );
  const deferredModules = deferred.map(m =>
    toModuleTransport(m, idsForPath, {
      dependencyMapReservedName,
      globalPrefix
    })
  );
  const magicFileContents = Buffer.alloc(4); // Just concatenate all startup modules, one after the other.

  const code = startupModules
    .map(
      m =>
        getModuleCodeAndMap(m, idForPath, {
          dependencyMapReservedName,
          enableIDInlining: true,
          globalPrefix
        }).moduleCode
    )
    .join("\n"); // Write one file per module, wrapped with __d() call if it proceeds.

  const extraFiles = new Map();
  deferredModules.forEach(deferredModule => {
    extraFiles.set(
      path.join(JS_MODULES, deferredModule.id + ".js"),
      deferredModule.code
    );
  }); // Prepare and write magic number file.

  magicFileContents.writeUInt32LE(MAGIC_UNBUNDLE_NUMBER, 0);
  extraFiles.set(
    path.join(JS_MODULES, MAGIC_UNBUNDLE_FILENAME),
    magicFileContents
  ); // Create the source map (with no module groups, as they are ignored).

  const map = buildSourcemapWithMetadata({
    fixWrapperOffset: false,
    lazyModules: deferredModules,
    moduleGroups: null,
    startupModules: startupModules.map(m =>
      toModuleTransport(m, idsForPath, {
        dependencyMapReservedName,
        globalPrefix
      })
    )
  });
  return {
    code,
    extraFiles,
    map
  };
}

function createBuilder(preloadedModules, ramGroupHeads) {
  return x =>
    asMultipleFilesRamBundle(
      _objectSpread(
        _objectSpread({}, x),
        {},
        {
          preloadedModules,
          ramGroupHeads
        }
      )
    );
}

exports.createBuilder = createBuilder;
