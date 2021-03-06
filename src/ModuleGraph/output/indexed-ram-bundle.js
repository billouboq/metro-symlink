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

const buildSourcemapWithMetadata = require("../../shared/output/RamBundle/buildSourcemapWithMetadata.js");

const invariant = require("invariant");

const _require = require("../../Bundler/util"),
  createRamBundleGroups = _require.createRamBundleGroups;

const _require2 = require("../../shared/output/RamBundle/as-indexed-file"),
  buildTableAndContents = _require2.buildTableAndContents,
  createModuleGroups = _require2.createModuleGroups;

const _require3 = require("./util"),
  getModuleCodeAndMap = _require3.getModuleCodeAndMap,
  partition = _require3.partition,
  toModuleTransport = _require3.toModuleTransport;

function asIndexedRamBundle(_ref) {
  let dependencyMapReservedName = _ref.dependencyMapReservedName,
    filename = _ref.filename,
    globalPrefix = _ref.globalPrefix,
    idsForPath = _ref.idsForPath,
    modules = _ref.modules,
    preloadedModules = _ref.preloadedModules,
    ramGroupHeads = _ref.ramGroupHeads,
    requireCalls = _ref.requireCalls;

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

  for (const m of deferredModules) {
    invariant(
      m.id >= 0,
      "A script (non-module) cannot be part of the deferred modules of a RAM bundle " +
        `(\`${m.sourcePath}\`, id=${m.id})`
    );
  }

  const ramGroups = createRamBundleGroups(
    ramGroupHeads || [],
    deferredModules,
    subtree
  );
  const moduleGroups = createModuleGroups(ramGroups, deferredModules);
  const tableAndContents = buildTableAndContents(
    startupModules
      .map(
        m =>
          getModuleCodeAndMap(m, idForPath, {
            dependencyMapReservedName,
            enableIDInlining: true,
            globalPrefix
          }).moduleCode
      )
      .join("\n"),
    deferredModules,
    moduleGroups,
    "utf8"
  );
  return {
    code: Buffer.concat(tableAndContents),
    map: buildSourcemapWithMetadata({
      fixWrapperOffset: false,
      lazyModules: deferredModules,
      moduleGroups,
      startupModules: startupModules.map(m =>
        toModuleTransport(m, idsForPath, {
          dependencyMapReservedName,
          globalPrefix
        })
      )
    })
  };
}

function* subtree(moduleTransport, moduleTransportsByPath) {
  let seen =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : new Set();
  seen.add(moduleTransport.id);

  for (const _ref2 of moduleTransport.dependencies) {
    const path = _ref2.path;
    const dependency = moduleTransportsByPath.get(path);

    if (dependency && !seen.has(dependency.id)) {
      yield dependency.id;
      yield* subtree(dependency, moduleTransportsByPath, seen);
    }
  }
}

function createBuilder(preloadedModules, ramGroupHeads) {
  return x =>
    asIndexedRamBundle(
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
