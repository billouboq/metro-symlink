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

const _require = require("metro-core"),
  AmbiguousModuleResolutionError = _require.AmbiguousModuleResolutionError;

const DuplicateHasteCandidatesError = require("jest-haste-map").ModuleMap
  .DuplicateHasteCandidatesError;

const _require2 = require("metro-resolver"),
  InvalidPackageError = _require2.InvalidPackageError;

const _require3 = require("metro-core"),
  PackageResolutionError = _require3.PackageResolutionError;

const JestHasteMap = require("jest-haste-map");

const Module = require("./Module");

const ModuleCache = require("./ModuleCache");

const ci = require("ci-info");

const fs = require("fs");

const path = require("path");

const _require4 = require("./DependencyGraph/ModuleResolution"),
  ModuleResolver = _require4.ModuleResolver;

const _require5 = require("events"),
  EventEmitter = _require5.EventEmitter;

const _require6 = require("metro-core"),
  _require6$Logger = _require6.Logger,
  createActionStartEntry = _require6$Logger.createActionStartEntry,
  createActionEndEntry = _require6$Logger.createActionEndEntry,
  log = _require6$Logger.log;

const JEST_HASTE_MAP_CACHE_BREAKER = 5;

function getOrCreate(map, field) {
  let subMap = map.get(field);

  if (!subMap) {
    subMap = new Map();
    map.set(field, subMap);
  }

  return subMap;
}

class DependencyGraph extends EventEmitter {
  // $FlowFixMe[value-as-type]
  constructor(_ref) {
    let config = _ref.config,
      haste = _ref.haste,
      initialHasteFS = _ref.initialHasteFS,
      initialModuleMap = _ref.initialModuleMap;
    super();

    _defineProperty(this, "_doesFileExist", filePath => {
      return this._hasteFS.exists(filePath);
    });

    this._config = config;
    this._haste = haste;
    this._hasteFS = initialHasteFS;
    this._moduleMap = initialModuleMap;
    this._assetExtensions = new Set(
      config.resolver.assetExts.map(asset => "." + asset)
    );

    this._haste.on("change", this._onHasteChange.bind(this));

    this._resolutionCache = new Map();
    this._moduleCache = this._createModuleCache();

    this._createModuleResolver();
  }

  static _getIgnorePattern(config) {
    /*
      For now we support both blockList and blacklistRE options
    */
    const _config$resolver = config.resolver,
      blockList = _config$resolver.blockList,
      blacklistRE = _config$resolver.blacklistRE;

    const combine = regexes =>
      new RegExp(
        regexes
          .map(regex => "(" + regex.source.replace(/\//g, path.sep) + ")")
          .join("|")
      ); // If `blacklistRE` is set - use it,
    // if `blockList` is set - use it

    const ignorePattern = blacklistRE || blockList; // If neither option has been set, use default pattern

    if (!ignorePattern) {
      return / ^/;
    } // If ignorePattern is an array, merge it into one

    if (Array.isArray(ignorePattern)) {
      return combine(ignorePattern);
    }

    return ignorePattern;
  } // $FlowFixMe[value-as-type]

  static _createHaste(config, watch) {
    const haste = new JestHasteMap({
      cacheDirectory: config.hasteMapCacheDirectory,
      dependencyExtractor: config.resolver.dependencyExtractor,
      computeSha1: true,
      extensions: config.resolver.sourceExts.concat(config.resolver.assetExts),
      forceNodeFilesystemAPI: !config.resolver.useWatchman,
      hasteImplModulePath: config.resolver.hasteImplModulePath,
      ignorePattern: this._getIgnorePattern(config),
      maxWorkers: config.maxWorkers,
      mocksPattern: "",
      name: "metro-" + JEST_HASTE_MAP_CACHE_BREAKER,
      platforms: config.resolver.platforms,
      retainAllFiles: true,
      resetCache: config.resetCache,
      rootDir: config.projectRoot,
      roots: config.watchFolders,
      throwOnModuleCollision: true,
      useWatchman: config.resolver.useWatchman,
      watch: watch == null ? !ci.isCI : watch
    }); // We can have a lot of graphs listening to Haste for changes.
    // Bump this up to silence the max listeners EventEmitter warning.

    haste.setMaxListeners(1000);
    return haste;
  }

  static load(config, options) {
    return _asyncToGenerator(function*() {
      const initializingMetroLogEntry = log(
        createActionStartEntry("Initializing Metro")
      );
      config.reporter.update({
        type: "dep_graph_loading",
        hasReducedPerformance: options
          ? Boolean(options.hasReducedPerformance)
          : false
      });

      const haste = DependencyGraph._createHaste(
        config,
        options && options.watch
      );

      const _yield$haste$build = yield haste.build(),
        hasteFS = _yield$haste$build.hasteFS,
        moduleMap = _yield$haste$build.moduleMap;

      log(createActionEndEntry(initializingMetroLogEntry));
      config.reporter.update({
        type: "dep_graph_loaded"
      });
      return new DependencyGraph({
        haste,
        initialHasteFS: hasteFS,
        initialModuleMap: moduleMap,
        config
      });
    })();
  }

  _getClosestPackage(filePath) {
    const _path$parse = path.parse(filePath),
      root = _path$parse.root; // The `filePath` may be a directory.

    let dir = filePath;

    do {
      const candidate = path.join(dir, "package.json");

      if (this._hasteFS.exists(candidate)) {
        return candidate;
      }

      dir = path.dirname(dir);
    } while (dir !== "." && dir !== root);

    return null;
  }

  _onHasteChange(_ref2) {
    let eventsQueue = _ref2.eventsQueue,
      hasteFS = _ref2.hasteFS,
      moduleMap = _ref2.moduleMap;
    this._hasteFS = hasteFS;
    this._resolutionCache = new Map();
    this._moduleMap = moduleMap;
    eventsQueue.forEach(_ref3 => {
      let type = _ref3.type,
        filePath = _ref3.filePath;
      return this._moduleCache.processFileChange(type, filePath);
    });

    this._createModuleResolver();

    this.emit("change");
  }

  _createModuleResolver() {
    this._moduleResolver = new ModuleResolver({
      follow: filePath => this._hasteFS.follow(filePath),
      dirExists: filePath => {
        try {
          return fs.lstatSync(filePath).isDirectory();
        } catch (e) {}

        return false;
      },
      doesFileExist: this._doesFileExist,
      extraNodeModules: this._config.resolver.extraNodeModules,
      isAssetFile: file => this._assetExtensions.has(path.extname(file)),
      mainFields: this._config.resolver.resolverMainFields,
      moduleCache: this._moduleCache,
      moduleMap: this._moduleMap,
      nodeModulesPaths: this._config.resolver.nodeModulesPaths,
      preferNativePlatform: true,
      projectRoot: this._config.projectRoot,
      resolveAsset: (dirPath, assetName, extension) => {
        const basePath = dirPath + path.sep + assetName;
        const assets = [basePath + extension]
          .concat(
            _toConsumableArray(
              this._config.resolver.assetResolutions.map(
                resolution => basePath + "@" + resolution + "x" + extension
              )
            )
          )
          .filter(candidate => this._hasteFS.exists(candidate));
        return assets.length ? assets : null;
      },
      resolveRequest: this._config.resolver.resolveRequest,
      sourceExts: this._config.resolver.sourceExts
    });
  }

  _createModuleCache() {
    return new ModuleCache({
      getClosestPackage: this._getClosestPackage.bind(this)
    });
  }

  getSha1(filename) {
    // TODO If it looks like we're trying to get the sha1 from a file located
    // within a Zip archive, then we instead compute the sha1 for what looks
    // like the Zip archive itself.
    const splitIndex = filename.indexOf(".zip/");
    const containerName =
      splitIndex !== -1 ? filename.slice(0, splitIndex + 4) : filename; // TODO Calling realpath allows us to get a hash for a given path even when
    // it's a symlink to a file, which prevents Metro from crashing in such a
    // case. However, it doesn't allow Metro to track changes to the target file
    // of the symlink. We should fix this by implementing a symlink map into
    // Metro (or maybe by implementing those "extra transformation sources" we've
    // been talking about for stuff like CSS or WASM).

    const resolvedPath = fs.realpathSync(containerName);

    const sha1 = this._hasteFS.getSha1(resolvedPath);

    if (!sha1) {
      throw new ReferenceError(`SHA-1 for file ${filename} (${resolvedPath}) is not computed.
         Potential causes:
           1) You have symlinks in your project - watchman does not follow symlinks.
           2) Check \`blockList\` in your metro.config.js and make sure it isn't excluding the file path.`);
    }

    return sha1;
  } // $FlowFixMe[value-as-type]

  getWatcher() {
    return this._haste;
  }

  end() {
    this._haste.end();
  }

  resolveDependency(from, to, platform) {
    let _ref4 =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : {
              assumeFlatNodeModules: false
            },
      assumeFlatNodeModules = _ref4.assumeFlatNodeModules;

    const isPath =
      to.includes("/") ||
      to === "." ||
      to === ".." ||
      from.includes(path.sep + "node_modules" + path.sep);
    const mapByDirectory = getOrCreate(
      this._resolutionCache,
      isPath ? path.dirname(from) : ""
    );
    let mapByPlatform = getOrCreate(mapByDirectory, to);
    let modulePath = mapByPlatform.get(platform);

    if (!modulePath) {
      modulePath = this._moduleMap.getModule(to, platform, true);
    }

    if (!modulePath) {
      try {
        modulePath = this._moduleResolver.resolveDependency(
          this._moduleCache.getModule(from),
          to,
          true,
          platform
        ).path; // If we cannot assume that only one node_modules folder exists in the project,
        // we need to cache packages by directory instead of globally.

        if (
          !assumeFlatNodeModules &&
          modulePath.includes(path.sep + "node_modules" + path.sep)
        ) {
          mapByPlatform = getOrCreate(
            getOrCreate(this._resolutionCache, path.dirname(from)),
            to
          );
        }
      } catch (error) {
        if (error instanceof DuplicateHasteCandidatesError) {
          throw new AmbiguousModuleResolutionError(from, error);
        }

        if (error instanceof InvalidPackageError) {
          throw new PackageResolutionError({
            packageError: error,
            originModulePath: from,
            targetModuleName: to
          });
        }

        throw error;
      }
    }

    mapByPlatform.set(platform, modulePath);
    return modulePath;
  }

  getHasteName(filePath) {
    const hasteName = this._hasteFS.getModuleName(filePath);

    if (hasteName) {
      return hasteName;
    }

    return path.relative(this._config.projectRoot, filePath);
  }

  getDependencies(filePath) {
    return this._hasteFS.getDependencies(filePath);
  }
}

module.exports = DependencyGraph;
