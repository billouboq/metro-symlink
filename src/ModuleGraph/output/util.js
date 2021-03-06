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

const generate = require("../worker/generate");

const mergeSourceMaps = require("../worker/mergeSourceMaps");

const nullthrows = require("nullthrows");

const reverseDependencyMapReferences = require("./reverse-dependency-map-references");

const _require = require("metro-transform-plugins"),
  addParamsToDefineCall = _require.addParamsToDefineCall;

const virtualModule = require("../module").virtual; // flowlint-next-line untyped-import:off

const _require2 = require("metro-react-native-babel-preset"),
  passthroughSyntaxPlugins = _require2.passthroughSyntaxPlugins;

const _require3 = require("@babel/core"),
  transformSync = _require3.transformSync;

// Transformed modules have the form
//   __d(function(require, module, global, exports, dependencyMap) {
//       /* code */
//   });
//
// This function adds the numeric module ID, and an array with dependencies of
// the dependencies of the module before the closing parenthesis.
function addModuleIdsToModuleWrapper(module, idForPath) {
  const dependencies = module.dependencies,
    file = module.file;
  const code = file.code; // calling `idForPath` on the module itself first gives us a lower module id
  // for the file itself than for its dependencies. That reflects their order
  // in the bundle.

  const fileId = idForPath(file);
  const paramsToAdd = [fileId];

  if (dependencies.length) {
    paramsToAdd.push(dependencies.map(idForPath));
  }

  return addParamsToDefineCall.apply(void 0, [code].concat(paramsToAdd));
}

exports.addModuleIdsToModuleWrapper = addModuleIdsToModuleWrapper;

function inlineModuleIds(module, idForPath, _ref) {
  let _ref$dependencyMapRes = _ref.dependencyMapReservedName,
    dependencyMapReservedName =
      _ref$dependencyMapRes === void 0 ? undefined : _ref$dependencyMapRes,
    globalPrefix = _ref.globalPrefix,
    _ref$ignoreMissingDep = _ref.ignoreMissingDependencyMapReference,
    ignoreMissingDependencyMapReference =
      _ref$ignoreMissingDep === void 0 ? false : _ref$ignoreMissingDep;
  const dependencies = module.dependencies,
    file = module.file;
  const code = file.code,
    map = file.map,
    path = file.path; // calling `idForPath` on the module itself first gives us a lower module id
  // for the file itself than for its dependencies. That reflects their order
  // in the bundle.

  const fileId = idForPath(file);
  const dependencyIds = dependencies.map(idForPath);

  if (!dependencyIds.length) {
    // Nothing to inline in this module.
    return {
      fileId,
      moduleCode: code,
      moduleMap: map
    };
  }

  if (dependencyMapReservedName != null) {
    /**
     * Fast path for inlining module IDs as a cheap string operation, requiring
     * neither parsing nor any adjustment to the source map.
     *
     * Assumptions:
     * 1. `dependencyMapReservedName` is a globally reserved string; there are
     *    no false positives.
     * 2. The longest module ID in the bundle does not exceed a length of
     *    `dependencyMapReservedName.length + 3`. (We assert this below.)
     * 3. False negatives (failing to inline occasionally if an assumption
     *    isn't met) are rare to nonexistent, but safe if they do occur.
     *
     * Syntax definitions:
     * 1. A dependency map reference is a member expression which, if parsed,
     *    would have the form:
     *      MemberExpression
     *      ├──object: Identifier (name = dependencyMapReservedName)
     *      ├──property: NumericLiteral (value = some integer)
     *      └──computed: true
     * 2. The concrete form of a dependency map reference may contain embedded
     *    tabs or spaces, but no newlines (which would complicate source maps),
     *    parens (which would complicate detection) or comments (likewise).
     * 3. The numeric literal in a dependency map reference is a base-10
     *    integer printed as a simple sequence of digits.
     */
    if (!code.includes(dependencyMapReservedName)) {
      if (ignoreMissingDependencyMapReference) {
        return {
          fileId,
          moduleCode: code,
          moduleMap: map
        };
      } // If we're here, the module was probably generated by some code that
      // doesn't make the dependency map name externally configurable, or a
      // mock that needs to be updated.

      throw new Error(
        `Module has dependencies but does not use the preconfigured dependency map name '${dependencyMapReservedName}': ${file.path}\n` +
          "This is an internal error in Metro."
      );
    }

    const WS = "[\t ]*";
    const depMapReferenceRegex = new RegExp(
      escapeRegex(dependencyMapReservedName) + `${WS}\\[${WS}([0-9]+)${WS}\\]`,
      "g"
    );
    const inlinedCode = code.replace(
      depMapReferenceRegex,
      (match, depIndex) => {
        const idStr = dependencyIds[Number.parseInt(depIndex, 10)].toString();

        if (idStr.length > match.length) {
          // Stop the build rather than silently emit an incorrect source map.
          throw new Error(
            `Module ID doesn't fit in available space; add ${idStr.length -
              match.length} more characters to 'dependencyMapReservedName'.`
          );
        }

        return idStr.padEnd(match.length);
      }
    );
    return {
      fileId,
      moduleCode: inlinedCode,
      moduleMap: map
    };
  }

  const ast = nullthrows(
    transformSync(code, {
      ast: true,
      babelrc: false,
      code: false,
      configFile: false,
      plugins: [].concat(_toConsumableArray(passthroughSyntaxPlugins), [
        [
          reverseDependencyMapReferences,
          {
            dependencyIds,
            globalPrefix
          }
        ]
      ])
    }).ast
  );

  const _generate = generate(ast, path, ""),
    generatedCode = _generate.code,
    generatedMap = _generate.map;

  return {
    fileId,
    moduleCode: generatedCode,
    moduleMap: map && generatedMap && mergeSourceMaps(path, map, generatedMap)
  };
}

function inlineModuleIdsAndAddParamsToDefineCall(module, idForPath, options) {
  const _inlineModuleIds = inlineModuleIds(module, idForPath, options),
    fileId = _inlineModuleIds.fileId,
    moduleCode = _inlineModuleIds.moduleCode,
    moduleMap = _inlineModuleIds.moduleMap;

  return {
    moduleCode: addParamsToDefineCall(moduleCode, fileId),
    moduleMap
  };
}

exports.inlineModuleIds = inlineModuleIds;
exports.inlineModuleIdsAndAddParamsToDefineCall = inlineModuleIdsAndAddParamsToDefineCall;

function escapeRegex(str) {
  // From http://stackoverflow.com/questions/14076210/
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

/**
 * 1. Adds the module ids to a file if the file is a module. If it's not (e.g.
 *    a script) it just keeps it as-is.
 * 2. Packs the function map into the file's source map, if one exists.
 */
function getModuleCodeAndMap(module, idForPath, options) {
  const file = module.file;
  let moduleCode, moduleMap;

  if (file.type !== "module") {
    moduleCode = file.code;
    moduleMap = file.map;
  } else if (!options.enableIDInlining) {
    moduleCode = addModuleIdsToModuleWrapper(module, idForPath);
    moduleMap = file.map;
  } else {
    var _inlineModuleIdsAndAd = inlineModuleIdsAndAddParamsToDefineCall(
      module,
      idForPath,
      {
        dependencyMapReservedName: options.dependencyMapReservedName,
        globalPrefix: options.globalPrefix
      }
    );

    moduleCode = _inlineModuleIdsAndAd.moduleCode;
    moduleMap = _inlineModuleIdsAndAd.moduleMap;
  }

  if (moduleMap && moduleMap.sources) {
    const x_facebook_sources = [];

    if (moduleMap.sources.length >= 1) {
      x_facebook_sources.push([module.file.functionMap]);
    }

    moduleMap = _objectSpread(
      _objectSpread({}, moduleMap),
      {},
      {
        x_facebook_sources
      }
    );
  }

  return {
    moduleCode,
    moduleMap
  };
}

exports.getModuleCodeAndMap = getModuleCodeAndMap; // Concatenates many iterables, by calling them sequentially.

exports.concat = function* concat() {
  for (
    var _len = arguments.length, iterables = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    iterables[_key] = arguments[_key];
  }

  for (const it of iterables) {
    yield* it;
  }
}; // Creates an idempotent function that returns numeric IDs for objects based
// on their `path` property.

exports.createIdForPathFn = () => {
  const seen = new Map();
  let next = 0;
  return _ref2 => {
    let path = _ref2.path;
    let id = seen.get(path);

    if (id == null) {
      id = next++;
      seen.set(path, id);
    }

    return id;
  };
}; // creates a series of virtual modules with require calls to the passed-in
// modules.

exports.requireCallsTo = function*(modules, idForPath, getRunModuleStatement) {
  for (const module of modules) {
    const id = idForPath(module.file);
    yield virtualModule(
      getRunModuleStatement(id),
      `/<generated>/require-${id}.js`
    );
  }
}; // Divides the modules into two types: the ones that are loaded at startup, and
// the ones loaded deferredly (lazy loaded).

exports.partition = (modules, preloadedModules) => {
  const startup = [];
  const deferred = [];

  for (const module of modules) {
    (preloadedModules.has(module.file.path) ? startup : deferred).push(module);
  }

  return [startup, deferred];
}; // Transforms a new Module object into an old one, so that it can be passed
// around code.
// NOTE: Used only for RAM bundle serialization.

function toModuleTransport(module, idsForPath, _ref3) {
  let dependencyMapReservedName = _ref3.dependencyMapReservedName,
    globalPrefix = _ref3.globalPrefix;
  const dependencies = module.dependencies,
    file = module.file;

  const _getModuleCodeAndMap = getModuleCodeAndMap(
      module,
      x => idsForPath(x).moduleId,
      {
        dependencyMapReservedName,
        enableIDInlining: true,
        globalPrefix
      }
    ),
    moduleCode = _getModuleCodeAndMap.moduleCode,
    moduleMap = _getModuleCodeAndMap.moduleMap;

  return {
    code: moduleCode,
    dependencies,
    // ID is required but we provide an invalid one for "script"s.
    id: file.type === "module" ? nullthrows(idsForPath(file).localId) : -1,
    map: moduleMap,
    name: file.path,
    sourcePath: file.path
  };
}

exports.toModuleTransport = toModuleTransport;
