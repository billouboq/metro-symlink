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

const IncrementalBundler = require("./IncrementalBundler");

const MultipartResponse = require("./Server/MultipartResponse");

const ResourceNotFoundError = require("./IncrementalBundler/ResourceNotFoundError");

const baseBytecodeBundle = require("./DeltaBundler/Serializers/baseBytecodeBundle");

const baseJSBundle = require("./DeltaBundler/Serializers/baseJSBundle");

const bundleToBytecode = require("./lib/bundleToBytecode");

const bundleToString = require("./lib/bundleToString");

const _require = require("@babel/code-frame"),
  codeFrameColumns = _require.codeFrameColumns;

const debug = require("debug")("Metro:Server");

const formatBundlingError = require("./lib/formatBundlingError");

const fs = require("graceful-fs");

const getAllFiles = require("./DeltaBundler/Serializers/getAllFiles");

const getAssets = require("./DeltaBundler/Serializers/getAssets");

const getGraphId = require("./lib/getGraphId");

const getRamBundleInfo = require("./DeltaBundler/Serializers/getRamBundleInfo");

const mime = require("mime-types");

const parseOptionsFromUrl = require("./lib/parseOptionsFromUrl");

const parsePlatformFilePath = require("./node-haste/lib/parsePlatformFilePath");

const path = require("path");

const sourceMapString = require("./DeltaBundler/Serializers/sourceMapString");

const splitBundleOptions = require("./lib/splitBundleOptions");

const symbolicate = require("./Server/symbolicate");

const transformHelpers = require("./lib/transformHelpers");

const url = require("url");

const _require2 = require("metro-hermes-compiler"),
  BYTECODE_VERSION = _require2.VERSION;

const _require3 = require("./Assets"),
  getAsset = _require3.getAsset;

const _require4 = require("./DeltaBundler/Serializers/getExplodedSourceMap"),
  getExplodedSourceMap = _require4.getExplodedSourceMap;

const _require5 = require("metro-core"),
  Logger = _require5.Logger,
  _require5$Logger = _require5.Logger,
  createActionStartEntry = _require5$Logger.createActionStartEntry,
  createActionEndEntry = _require5$Logger.createActionEndEntry,
  log = _require5$Logger.log;

const DELTA_ID_HEADER = "X-Metro-Delta-ID";
const FILES_CHANGED_COUNT_HEADER = "X-Metro-Files-Changed-Count";

class Server {
  constructor(config, options) {
    var _this = this;

    _defineProperty(this, "processRequest", (req, res, next) => {
      this._processRequest(req, res, next).catch(next);
    });

    _defineProperty(
      this,
      "_processBundleRequest",
      this._createRequestProcessor({
        createStartEntry(context) {
          return {
            action_name: "Requesting bundle",
            bundle_url: context.req.url,
            entry_point: context.entryFile,
            bundler: "delta",
            build_id: context.buildID,
            bundle_options: context.bundleOptions,
            bundle_hash: context.graphId
          };
        },

        createEndEntry(context) {
          return {
            outdated_modules: context.result.numModifiedFiles
          };
        },

        build: (function() {
          var _ref = _asyncToGenerator(function*(_ref2) {
            let entryFile = _ref2.entryFile,
              graphId = _ref2.graphId,
              graphOptions = _ref2.graphOptions,
              onProgress = _ref2.onProgress,
              serializerOptions = _ref2.serializerOptions,
              transformOptions = _ref2.transformOptions;

            const revPromise = _this._bundler.getRevisionByGraphId(graphId);

            const _yield = yield revPromise != null
                ? _this._bundler.updateGraph(yield revPromise, false)
                : _this._bundler.initializeGraph(entryFile, transformOptions, {
                    onProgress,
                    shallow: graphOptions.shallow
                  }),
              delta = _yield.delta,
              revision = _yield.revision;

            const serializer =
              _this._config.serializer.customSerializer ||
              function() {
                return bundleToString(baseJSBundle.apply(void 0, arguments))
                  .code;
              };

            const bundle = yield serializer(
              entryFile,
              revision.prepend,
              revision.graph,
              {
                asyncRequireModulePath: yield _this._resolveRelativePath(
                  _this._config.transformer.asyncRequireModulePath,
                  {
                    transformOptions
                  }
                ),
                processModuleFilter:
                  _this._config.serializer.processModuleFilter,
                createModuleId: _this._createModuleId,
                getRunModuleStatement:
                  _this._config.serializer.getRunModuleStatement,
                dev: transformOptions.dev,
                projectRoot: _this._config.projectRoot,
                modulesOnly: serializerOptions.modulesOnly,
                runBeforeMainModule: _this._config.serializer.getModulesRunBeforeMainModule(
                  path.relative(_this._config.projectRoot, entryFile)
                ),
                runModule: serializerOptions.runModule,
                sourceMapUrl: serializerOptions.sourceMapUrl,
                sourceUrl: serializerOptions.sourceUrl,
                inlineSourceMap: serializerOptions.inlineSourceMap
              }
            );
            const bundleCode =
              typeof bundle === "string" ? bundle : bundle.code;
            return {
              numModifiedFiles: delta.reset
                ? delta.added.size + revision.prepend.length
                : delta.added.size + delta.modified.size + delta.deleted.size,
              lastModifiedDate: revision.date,
              nextRevId: revision.id,
              bundle: bundleCode
            };
          });

          return function build(_x) {
            return _ref.apply(this, arguments);
          };
        })(),

        finish(_ref3) {
          let req = _ref3.req,
            mres = _ref3.mres,
            result = _ref3.result;

          if (
            // We avoid parsing the dates since the client should never send a more
            // recent date than the one returned by the Delta Bundler (if that's the
            // case it's fine to return the whole bundle).
            req.headers["if-modified-since"] ===
            result.lastModifiedDate.toUTCString()
          ) {
            debug("Responding with 304");
            mres.writeHead(304);
            mres.end();
          } else {
            mres.setHeader(
              FILES_CHANGED_COUNT_HEADER,
              String(result.numModifiedFiles)
            );
            mres.setHeader(DELTA_ID_HEADER, String(result.nextRevId));
            mres.setHeader("Content-Type", "application/javascript");
            mres.setHeader(
              "Last-Modified",
              result.lastModifiedDate.toUTCString()
            );
            mres.setHeader(
              "Content-Length",
              String(Buffer.byteLength(result.bundle))
            );
            mres.end(result.bundle);
          }
        },

        delete: (function() {
          var _ref4 = _asyncToGenerator(function*(_ref5) {
            let graphId = _ref5.graphId,
              res = _ref5.res;
            yield _this._bundler.endGraph(graphId);
            res.statusCode = 204;
            res.end();
          });

          return function _delete(_x2) {
            return _ref4.apply(this, arguments);
          };
        })()
      })
    );

    _defineProperty(
      this,
      "_processBytecodeBundleRequest",
      this._createRequestProcessor({
        createStartEntry(context) {
          return {
            action_name: "Requesting bundle",
            bundle_url: context.req.url,
            entry_point: context.entryFile,
            bundler: "delta",
            build_id: context.buildID,
            bundle_options: context.bundleOptions,
            bundle_hash: context.graphId
          };
        },

        createEndEntry(context) {
          return {
            outdated_modules: context.result.numModifiedFiles
          };
        },

        build: (function() {
          var _ref6 = _asyncToGenerator(function*(_ref7) {
            let entryFile = _ref7.entryFile,
              graphId = _ref7.graphId,
              graphOptions = _ref7.graphOptions,
              onProgress = _ref7.onProgress,
              serializerOptions = _ref7.serializerOptions,
              transformOptions = _ref7.transformOptions;

            const revPromise = _this._bundler.getRevisionByGraphId(graphId);

            const _yield2 = yield revPromise != null
                ? _this._bundler.updateGraph(yield revPromise, false)
                : _this._bundler.initializeGraph(entryFile, transformOptions, {
                    onProgress,
                    shallow: graphOptions.shallow
                  }),
              delta = _yield2.delta,
              revision = _yield2.revision;

            const bundle = bundleToBytecode(
              baseBytecodeBundle(entryFile, revision.prepend, revision.graph, {
                asyncRequireModulePath: yield _this._resolveRelativePath(
                  _this._config.transformer.asyncRequireModulePath,
                  {
                    transformOptions
                  }
                ),
                processModuleFilter:
                  _this._config.serializer.processModuleFilter,
                createModuleId: _this._createModuleId,
                getRunModuleStatement:
                  _this._config.serializer.getRunModuleStatement,
                dev: transformOptions.dev,
                projectRoot: _this._config.projectRoot,
                modulesOnly: serializerOptions.modulesOnly,
                runBeforeMainModule: _this._config.serializer.getModulesRunBeforeMainModule(
                  path.relative(_this._config.projectRoot, entryFile)
                ),
                runModule: serializerOptions.runModule,
                sourceMapUrl: serializerOptions.sourceMapUrl,
                sourceUrl: serializerOptions.sourceUrl,
                inlineSourceMap: serializerOptions.inlineSourceMap
              })
            );
            return {
              numModifiedFiles: delta.reset
                ? delta.added.size + revision.prepend.length
                : delta.added.size + delta.modified.size + delta.deleted.size,
              lastModifiedDate: revision.date,
              nextRevId: revision.id,
              bytecode: bundle.bytecode
            };
          });

          return function build(_x3) {
            return _ref6.apply(this, arguments);
          };
        })(),

        finish(_ref8) {
          let req = _ref8.req,
            mres = _ref8.mres,
            result = _ref8.result;

          if (
            // We avoid parsing the dates since the client should never send a more
            // recent date than the one returned by the Delta Bundler (if that's the
            // case it's fine to return the whole bundle).
            req.headers["if-modified-since"] ===
            result.lastModifiedDate.toUTCString()
          ) {
            debug("Responding with 304");
            mres.writeHead(304);
            mres.end();
          } else {
            mres.setHeader(
              FILES_CHANGED_COUNT_HEADER,
              String(result.numModifiedFiles)
            );
            mres.setHeader(DELTA_ID_HEADER, String(result.nextRevId));
            mres.setHeader(
              "Content-Type",
              "application/x-metro-bytecode-bundle"
            );
            mres.setHeader(
              "Last-Modified",
              result.lastModifiedDate.toUTCString()
            );
            mres.setHeader(
              "Content-Length",
              String(Buffer.byteLength(result.bytecode))
            );
            mres.end(result.bytecode);
          }
        }
      })
    );

    _defineProperty(
      this,
      "_processSourceMapRequest",
      this._createRequestProcessor({
        createStartEntry(context) {
          return {
            action_name: "Requesting sourcemap",
            bundle_url: context.req.url,
            entry_point: context.entryFile,
            bundler: "delta"
          };
        },

        createEndEntry(context) {
          return {
            bundler: "delta"
          };
        },

        build: (function() {
          var _ref9 = _asyncToGenerator(function*(_ref10) {
            let entryFile = _ref10.entryFile,
              graphId = _ref10.graphId,
              graphOptions = _ref10.graphOptions,
              onProgress = _ref10.onProgress,
              serializerOptions = _ref10.serializerOptions,
              transformOptions = _ref10.transformOptions;
            let revision;

            const revPromise = _this._bundler.getRevisionByGraphId(graphId);

            if (revPromise == null) {
              var _yield$_this$_bundler = yield _this._bundler.initializeGraph(
                entryFile,
                transformOptions,
                {
                  onProgress,
                  shallow: graphOptions.shallow
                }
              );

              revision = _yield$_this$_bundler.revision;
            } else {
              var _yield$_this$_bundler2 = yield _this._bundler.updateGraph(
                yield revPromise,
                false
              );

              revision = _yield$_this$_bundler2.revision;
            }

            let _revision = revision,
              prepend = _revision.prepend,
              graph = _revision.graph;

            if (serializerOptions.modulesOnly) {
              prepend = [];
            }

            return sourceMapString(
              [].concat(
                _toConsumableArray(prepend),
                _toConsumableArray(_this._getSortedModules(graph))
              ),
              {
                excludeSource: serializerOptions.excludeSource,
                processModuleFilter:
                  _this._config.serializer.processModuleFilter
              }
            );
          });

          return function build(_x4) {
            return _ref9.apply(this, arguments);
          };
        })(),

        finish(_ref11) {
          let mres = _ref11.mres,
            result = _ref11.result;
          mres.setHeader("Content-Type", "application/json");
          mres.end(result.toString());
        }
      })
    );

    _defineProperty(
      this,
      "_processAssetsRequest",
      this._createRequestProcessor({
        createStartEntry(context) {
          return {
            action_name: "Requesting assets",
            bundle_url: context.req.url,
            entry_point: context.entryFile,
            bundler: "delta"
          };
        },

        createEndEntry(context) {
          return {
            bundler: "delta"
          };
        },

        build: (function() {
          var _ref12 = _asyncToGenerator(function*(_ref13) {
            let entryFile = _ref13.entryFile,
              transformOptions = _ref13.transformOptions,
              onProgress = _ref13.onProgress;
            const dependencies = yield _this._bundler.getDependencies(
              [entryFile],
              transformOptions,
              {
                onProgress,
                shallow: false
              }
            );
            return yield getAssets(dependencies, {
              processModuleFilter: _this._config.serializer.processModuleFilter,
              assetPlugins: _this._config.transformer.assetPlugins,
              platform: transformOptions.platform,
              publicPath: _this._config.transformer.publicPath,
              projectRoot: _this._config.projectRoot
            });
          });

          return function build(_x5) {
            return _ref12.apply(this, arguments);
          };
        })(),

        finish(_ref14) {
          let mres = _ref14.mres,
            result = _ref14.result;
          mres.setHeader("Content-Type", "application/json");
          mres.end(JSON.stringify(result));
        }
      })
    );

    this._config = config;
    this._serverOptions = options;

    if (this._config.resetCache) {
      this._config.cacheStores.forEach(store => store.clear());

      this._config.reporter.update({
        type: "transform_cache_reset"
      });
    }

    this._reporter = config.reporter;
    this._logger = Logger;
    this._platforms = new Set(this._config.resolver.platforms);
    this._isEnded = false; // TODO(T34760917): These two properties should eventually be instantiated
    // elsewhere and passed as parameters, since they are also needed by
    // the HmrServer.
    // The whole bundling/serializing logic should follow as well.

    this._createModuleId = config.serializer.createModuleIdFactory();
    this._bundler = new IncrementalBundler(config, {
      hasReducedPerformance: options && options.hasReducedPerformance,
      watch: options ? options.watch : undefined
    });
    this._nextBundleBuildID = 1;
  }

  end() {
    if (!this._isEnded) {
      this._bundler.end();

      this._isEnded = true;
    }
  }

  getBundler() {
    return this._bundler;
  }

  getCreateModuleId() {
    return this._createModuleId;
  }

  build(options) {
    var _this2 = this;

    return _asyncToGenerator(function*() {
      const _splitBundleOptions = splitBundleOptions(options),
        entryFile = _splitBundleOptions.entryFile,
        graphOptions = _splitBundleOptions.graphOptions,
        onProgress = _splitBundleOptions.onProgress,
        serializerOptions = _splitBundleOptions.serializerOptions,
        transformOptions = _splitBundleOptions.transformOptions;

      const _yield$_this2$_bundle = yield _this2._bundler.buildGraph(
          entryFile,
          transformOptions,
          {
            onProgress,
            shallow: graphOptions.shallow
          }
        ),
        prepend = _yield$_this2$_bundle.prepend,
        graph = _yield$_this2$_bundle.graph;

      const entryPoint = path.resolve(_this2._config.projectRoot, entryFile);
      const bundleOptions = {
        asyncRequireModulePath: yield _this2._resolveRelativePath(
          _this2._config.transformer.asyncRequireModulePath,
          {
            transformOptions
          }
        ),
        processModuleFilter: _this2._config.serializer.processModuleFilter,
        createModuleId: _this2._createModuleId,
        getRunModuleStatement: _this2._config.serializer.getRunModuleStatement,
        dev: transformOptions.dev,
        projectRoot: _this2._config.projectRoot,
        modulesOnly: serializerOptions.modulesOnly,
        runBeforeMainModule: _this2._config.serializer.getModulesRunBeforeMainModule(
          path.relative(_this2._config.projectRoot, entryPoint)
        ),
        runModule: serializerOptions.runModule,
        sourceMapUrl: serializerOptions.sourceMapUrl,
        sourceUrl: serializerOptions.sourceUrl,
        inlineSourceMap: serializerOptions.inlineSourceMap
      };
      let bundleCode = null;
      let bundleMap = null;

      if (_this2._config.serializer.customSerializer) {
        const bundle = yield _this2._config.serializer.customSerializer(
          entryPoint,
          prepend,
          graph,
          bundleOptions
        );

        if (typeof bundle === "string") {
          bundleCode = bundle;
        } else {
          bundleCode = bundle.code;
          bundleMap = bundle.map;
        }
      } else {
        bundleCode = bundleToString(
          baseJSBundle(entryPoint, prepend, graph, bundleOptions)
        ).code;
      }

      if (!bundleMap) {
        bundleMap = sourceMapString(
          [].concat(
            _toConsumableArray(prepend),
            _toConsumableArray(_this2._getSortedModules(graph))
          ),
          {
            excludeSource: serializerOptions.excludeSource,
            processModuleFilter: _this2._config.serializer.processModuleFilter
          }
        );
      }

      return {
        code: bundleCode,
        map: bundleMap
      };
    })();
  }

  getRamBundleInfo(options) {
    var _this3 = this;

    return _asyncToGenerator(function*() {
      const _splitBundleOptions2 = splitBundleOptions(options),
        entryFile = _splitBundleOptions2.entryFile,
        graphOptions = _splitBundleOptions2.graphOptions,
        onProgress = _splitBundleOptions2.onProgress,
        serializerOptions = _splitBundleOptions2.serializerOptions,
        transformOptions = _splitBundleOptions2.transformOptions;

      const _yield$_this3$_bundle = yield _this3._bundler.buildGraph(
          entryFile,
          transformOptions,
          {
            onProgress,
            shallow: graphOptions.shallow
          }
        ),
        prepend = _yield$_this3$_bundle.prepend,
        graph = _yield$_this3$_bundle.graph;

      const entryPoint = path.resolve(_this3._config.projectRoot, entryFile);
      return yield getRamBundleInfo(entryPoint, prepend, graph, {
        asyncRequireModulePath: yield _this3._resolveRelativePath(
          _this3._config.transformer.asyncRequireModulePath,
          {
            transformOptions
          }
        ),
        processModuleFilter: _this3._config.serializer.processModuleFilter,
        createModuleId: _this3._createModuleId,
        dev: transformOptions.dev,
        excludeSource: serializerOptions.excludeSource,
        getRunModuleStatement: _this3._config.serializer.getRunModuleStatement,
        getTransformOptions: _this3._config.transformer.getTransformOptions,
        platform: transformOptions.platform,
        projectRoot: _this3._config.projectRoot,
        modulesOnly: serializerOptions.modulesOnly,
        runBeforeMainModule: _this3._config.serializer.getModulesRunBeforeMainModule(
          path.relative(_this3._config.projectRoot, entryPoint)
        ),
        runModule: serializerOptions.runModule,
        sourceMapUrl: serializerOptions.sourceMapUrl,
        sourceUrl: serializerOptions.sourceUrl,
        inlineSourceMap: serializerOptions.inlineSourceMap
      });
    })();
  }

  getAssets(options) {
    var _this4 = this;

    return _asyncToGenerator(function*() {
      const _splitBundleOptions3 = splitBundleOptions(options),
        entryFile = _splitBundleOptions3.entryFile,
        transformOptions = _splitBundleOptions3.transformOptions,
        onProgress = _splitBundleOptions3.onProgress;

      const dependencies = yield _this4._bundler.getDependencies(
        [entryFile],
        transformOptions,
        {
          onProgress,
          shallow: false
        }
      );
      return yield getAssets(dependencies, {
        processModuleFilter: _this4._config.serializer.processModuleFilter,
        assetPlugins: _this4._config.transformer.assetPlugins,
        platform: transformOptions.platform,
        projectRoot: _this4._config.projectRoot,
        publicPath: _this4._config.transformer.publicPath
      });
    })();
  }

  getOrderedDependencyPaths(options) {
    var _this5 = this;

    return _asyncToGenerator(function*() {
      /* $FlowFixMe(>=0.122.0 site=react_native_fb) This comment suppresses an
       * error found when Flow v0.122.0 was deployed. To see the error, delete
       * this comment and run Flow. */
      const _splitBundleOptions4 = splitBundleOptions(
          _objectSpread(
            _objectSpread(
              _objectSpread({}, Server.DEFAULT_BUNDLE_OPTIONS),
              options
            ),
            {},
            {
              bundleType: "bundle"
            }
          )
        ),
        entryFile = _splitBundleOptions4.entryFile,
        transformOptions = _splitBundleOptions4.transformOptions,
        onProgress = _splitBundleOptions4.onProgress;

      const _yield$_this5$_bundle = yield _this5._bundler.buildGraph(
          entryFile,
          transformOptions,
          {
            onProgress,
            shallow: false
          }
        ),
        prepend = _yield$_this5$_bundle.prepend,
        graph = _yield$_this5$_bundle.graph;

      const platform =
        transformOptions.platform ||
        parsePlatformFilePath(entryFile, _this5._platforms).platform;
      return yield getAllFiles(prepend, graph, {
        platform,
        processModuleFilter: _this5._config.serializer.processModuleFilter
      });
    })();
  }

  _rangeRequestMiddleware(req, res, data, assetPath) {
    if (req.headers && req.headers.range) {
      const _req$headers$range$re = req.headers.range
          .replace(/bytes=/, "")
          .split("-"),
        _req$headers$range$re2 = _slicedToArray(_req$headers$range$re, 2),
        rangeStart = _req$headers$range$re2[0],
        rangeEnd = _req$headers$range$re2[1];

      const dataStart = parseInt(rangeStart, 10);
      const dataEnd = rangeEnd ? parseInt(rangeEnd, 10) : data.length - 1;
      const chunksize = dataEnd - dataStart + 1;
      res.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Range": `bytes ${dataStart}-${dataEnd}/${data.length}`,
        "Content-Type": mime.lookup(path.basename(assetPath))
      });
      return data.slice(dataStart, dataEnd + 1);
    }

    return data;
  }

  _processSingleAssetRequest(req, res) {
    var _this6 = this;

    return _asyncToGenerator(function*() {
      const urlObj = url.parse(decodeURI(req.url), true);
      const assetPath =
        urlObj && urlObj.pathname && urlObj.pathname.match(/^\/assets\/(.+)$/);

      if (!assetPath) {
        throw new Error("Could not extract asset path from URL");
      }

      const processingAssetRequestLogEntry = log(
        createActionStartEntry({
          action_name: "Processing asset request",
          asset: assetPath[1]
        })
      );

      try {
        const data = yield getAsset(
          assetPath[1],
          _this6._config.projectRoot,
          _this6._config.watchFolders,
          urlObj.query.platform,
          _this6._config.resolver.assetExts
        ); // Tell clients to cache this for 1 year.
        // This is safe as the asset url contains a hash of the asset.

        if (process.env.REACT_NATIVE_ENABLE_ASSET_CACHING === true) {
          res.setHeader("Cache-Control", "max-age=31536000");
        }

        res.end(_this6._rangeRequestMiddleware(req, res, data, assetPath[1]));
        process.nextTick(() => {
          log(createActionEndEntry(processingAssetRequestLogEntry));
        });
      } catch (error) {
        console.error(error.stack);
        res.writeHead(404);
        res.end("Asset not found");
      }
    })();
  }

  _parseOptions(url) {
    return parseOptionsFromUrl(
      url,
      new Set(this._config.resolver.platforms),
      BYTECODE_VERSION
    );
  }

  _processRequest(req, res, next) {
    var _this7 = this;

    return _asyncToGenerator(function*() {
      const originalUrl = req.url;
      req.url = _this7._config.server.rewriteRequestUrl(req.url);
      const urlObj = url.parse(req.url, true);
      const host = req.headers.host;
      debug(
        `Handling request: ${host ? "http://" + host : ""}${req.url}` +
          (originalUrl !== req.url ? ` (rewritten from ${originalUrl})` : "")
      );
      const formattedUrl = url.format(
        _objectSpread(
          _objectSpread({}, urlObj),
          {},
          {
            host,
            protocol: "http"
          }
        )
      );
      const pathname = urlObj.pathname || "";

      if (pathname.endsWith(".bundle")) {
        const options = _this7._parseOptions(formattedUrl);

        if (options.runtimeBytecodeVersion) {
          yield _this7._processBytecodeBundleRequest(req, res, options);
        } else {
          yield _this7._processBundleRequest(req, res, options);
        }

        if (_this7._serverOptions && _this7._serverOptions.onBundleBuilt) {
          _this7._serverOptions.onBundleBuilt(pathname);
        }
      } else if (pathname.endsWith(".map")) {
        // Chrome dev tools may need to access the source maps.
        res.setHeader("Access-Control-Allow-Origin", "devtools://devtools");
        yield _this7._processSourceMapRequest(
          req,
          res,
          _this7._parseOptions(formattedUrl)
        );
      } else if (pathname.endsWith(".assets")) {
        yield _this7._processAssetsRequest(
          req,
          res,
          _this7._parseOptions(formattedUrl)
        );
      } else if (pathname.startsWith("/assets/")) {
        yield _this7._processSingleAssetRequest(req, res);
      } else if (pathname === "/symbolicate") {
        yield _this7._symbolicate(req, res);
      } else {
        next();
      }
    })();
  }

  _createRequestProcessor(_ref15) {
    let createStartEntry = _ref15.createStartEntry,
      createEndEntry = _ref15.createEndEntry,
      build = _ref15.build,
      deleteFn = _ref15.delete,
      finish = _ref15.finish;
    return /*#__PURE__*/ (function() {
      var _requestProcessor = _asyncToGenerator(function*(
        req,
        res,
        bundleOptions
      ) {
        const _splitBundleOptions5 = splitBundleOptions(bundleOptions),
          entryFile = _splitBundleOptions5.entryFile,
          graphOptions = _splitBundleOptions5.graphOptions,
          transformOptions = _splitBundleOptions5.transformOptions,
          serializerOptions = _splitBundleOptions5.serializerOptions;
        /**
         * `entryFile` is relative to projectRoot, we need to use resolution function
         * to find the appropriate file with supported extensions.
         */

        const resolvedEntryFilePath = yield this._resolveRelativePath(
          entryFile,
          {
            transformOptions
          }
        );
        const graphId = getGraphId(resolvedEntryFilePath, transformOptions, {
          shallow: graphOptions.shallow,
          experimentalImportBundleSupport: this._config.transformer
            .experimentalImportBundleSupport
        }); // For resources that support deletion, handle the DELETE method.

        if (deleteFn && req.method === "DELETE") {
          const deleteContext = {
            graphId,
            req,
            res
          };

          try {
            yield deleteFn(deleteContext);
          } catch (error) {
            const formattedError = formatBundlingError(error);
            const status = error instanceof ResourceNotFoundError ? 404 : 500;
            res.writeHead(status, {
              "Content-Type": "application/json; charset=UTF-8"
            });
            res.end(JSON.stringify(formattedError));
          }

          return;
        }

        const mres = MultipartResponse.wrap(req, res);
        const buildID = this.getNewBuildID();
        let onProgress = null;
        let lastProgress = -1;

        if (this._config.reporter) {
          onProgress = (transformedFileCount, totalFileCount) => {
            const currentProgress = parseInt(
              (transformedFileCount / totalFileCount) * 100,
              10
            ); // We want to throttle the updates so that we only show meaningful
            // UI updates slow enough for the client to actually handle them. For
            // that, we check the percentage, and only send percentages that are
            // actually different and that have increased from the last one we sent.

            if (currentProgress > lastProgress || totalFileCount < 10) {
              mres.writeChunk(
                {
                  "Content-Type": "application/json"
                },
                JSON.stringify({
                  done: transformedFileCount,
                  total: totalFileCount
                })
              ); // The `uncork` called internally in Node via `promise.nextTick()` may not fire
              // until all of the Promises are resolved because the microtask queue we're
              // in could be starving the event loop. This can cause a bug where the progress
              // is not actually sent in the response until after bundling is complete. This
              // would defeat the purpose of sending progress, so we `uncork` the stream now
              // which will force the response to flush to the client immediately.

              if (res.socket != null && res.socket.uncork != null) {
                res.socket.uncork();
              }

              lastProgress = currentProgress;
            }

            this._reporter.update({
              buildID,
              type: "bundle_transform_progressed",
              transformedFileCount,
              totalFileCount
            });
          };
        }

        this._reporter.update({
          buildID,
          bundleDetails: {
            bundleType: bundleOptions.bundleType,
            dev: transformOptions.dev,
            entryFile: resolvedEntryFilePath,
            minify: transformOptions.minify,
            platform: transformOptions.platform,
            runtimeBytecodeVersion: transformOptions.runtimeBytecodeVersion
          },
          type: "bundle_build_started"
        });

        const startContext = {
          buildID,
          bundleOptions,
          entryFile: resolvedEntryFilePath,
          graphId,
          graphOptions,
          mres,
          onProgress,
          req,
          serializerOptions,
          transformOptions
        };
        const logEntry = log(
          createActionStartEntry(createStartEntry(startContext))
        );
        let result;

        try {
          result = yield build(startContext);
        } catch (error) {
          const formattedError = formatBundlingError(error);
          const status = error instanceof ResourceNotFoundError ? 404 : 500;
          mres.writeHead(status, {
            "Content-Type": "application/json; charset=UTF-8"
          });
          mres.end(JSON.stringify(formattedError));

          this._reporter.update({
            buildID,
            type: "bundle_build_failed",
            bundleOptions
          });

          this._reporter.update({
            error,
            type: "bundling_error"
          });

          log({
            action_name: "bundling_error",
            error_type: formattedError.type,
            log_entry_label: "bundling_error",
            bundle_id: graphId,
            build_id: buildID,
            stack: formattedError.message
          });
          return;
        }

        const endContext = _objectSpread(
          _objectSpread({}, startContext),
          {},
          {
            result
          }
        );

        finish(endContext);

        this._reporter.update({
          buildID,
          type: "bundle_build_done"
        });

        log(
          /* $FlowFixMe(>=0.122.0 site=react_native_fb) This comment suppresses
           * an error found when Flow v0.122.0 was deployed. To see the error,
           * delete this comment and run Flow. */
          createActionEndEntry(
            _objectSpread(
              _objectSpread({}, logEntry),
              createEndEntry(endContext)
            )
          )
        );
      });

      function requestProcessor(_x6, _x7, _x8) {
        return _requestProcessor.apply(this, arguments);
      }

      return requestProcessor;
    })();
  }

  // This function ensures that modules in source maps are sorted in the same
  // order as in a plain JS bundle.
  _getSortedModules(graph) {
    const modules = _toConsumableArray(graph.dependencies.values()); // Assign IDs to modules in a consistent order

    for (const module of modules) {
      this._createModuleId(module.path);
    } // Sort by IDs

    return modules.sort(
      (a, b) => this._createModuleId(a.path) - this._createModuleId(b.path)
    );
  }

  _symbolicate(req, res) {
    var _this8 = this;

    return _asyncToGenerator(function*() {
      const getCodeFrame = (urls, symbolicatedStack) => {
        for (let i = 0; i < symbolicatedStack.length; i++) {
          const _symbolicatedStack$i = symbolicatedStack[i],
            collapse = _symbolicatedStack$i.collapse,
            column = _symbolicatedStack$i.column,
            file = _symbolicatedStack$i.file,
            lineNumber = _symbolicatedStack$i.lineNumber;

          if (collapse || lineNumber == null || urls.has(file)) {
            continue;
          }

          return {
            content: codeFrameColumns(
              fs.readFileSync(file, "utf8"),
              {
                // Metro returns 0 based columns but codeFrameColumns expects 1-based columns
                start: {
                  column: column + 1,
                  line: lineNumber
                }
              },
              {
                forceColor: true
              }
            ),
            location: {
              row: lineNumber,
              column
            },
            fileName: file
          };
        }

        return null;
      };

      try {
        const symbolicatingLogEntry = log(
          createActionStartEntry("Symbolicating")
        );
        debug("Start symbolication");
        /* $FlowFixMe: where is `rawBody` defined? Is it added by the `connect` framework? */

        const body = yield req.rawBody;
        const stack = JSON.parse(body).stack.map(frame => {
          if (frame.file && frame.file.includes("://")) {
            return _objectSpread(
              _objectSpread({}, frame),
              {},
              {
                file: _this8._config.server.rewriteRequestUrl(frame.file)
              }
            );
          }

          return frame;
        }); // In case of multiple bundles / HMR, some stack frames can have different URLs from others

        const urls = new Set();
        stack.forEach(frame => {
          const sourceUrl = frame.file; // Skip `/debuggerWorker.js` which does not need symbolication.

          if (
            sourceUrl != null &&
            !urls.has(sourceUrl) &&
            !sourceUrl.endsWith("/debuggerWorker.js") &&
            sourceUrl.startsWith("http")
          ) {
            urls.add(sourceUrl);
          }
        });
        debug("Getting source maps for symbolication");
        const sourceMaps = yield Promise.all(
          Array.from(urls.values()).map(_this8._explodedSourceMapForURL, _this8)
        );
        debug("Performing fast symbolication");
        const symbolicatedStack = yield symbolicate(
          stack,
          zip(urls.values(), sourceMaps),
          _this8._config
        );
        debug("Symbolication done");
        res.end(
          JSON.stringify({
            codeFrame: getCodeFrame(urls, symbolicatedStack),
            stack: symbolicatedStack
          })
        );
        process.nextTick(() => {
          log(createActionEndEntry(symbolicatingLogEntry));
        });
      } catch (error) {
        console.error(error.stack || error);
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            error: error.message
          })
        );
      }
    })();
  }

  _explodedSourceMapForURL(reqUrl) {
    var _this9 = this;

    return _asyncToGenerator(function*() {
      const options = parseOptionsFromUrl(
        reqUrl,
        new Set(_this9._config.resolver.platforms),
        BYTECODE_VERSION
      );

      const _splitBundleOptions6 = splitBundleOptions(options),
        entryFile = _splitBundleOptions6.entryFile,
        transformOptions = _splitBundleOptions6.transformOptions,
        serializerOptions = _splitBundleOptions6.serializerOptions,
        graphOptions = _splitBundleOptions6.graphOptions,
        onProgress = _splitBundleOptions6.onProgress;
      /**
       * `entryFile` is relative to projectRoot, we need to use resolution function
       * to find the appropriate file with supported extensions.
       */

      const resolvedEntryFilePath = yield _this9._resolveRelativePath(
        entryFile,
        {
          transformOptions
        }
      );
      const graphId = getGraphId(resolvedEntryFilePath, transformOptions, {
        shallow: graphOptions.shallow,
        experimentalImportBundleSupport:
          _this9._config.transformer.experimentalImportBundleSupport
      });
      let revision;

      const revPromise = _this9._bundler.getRevisionByGraphId(graphId);

      if (revPromise == null) {
        var _yield$_this9$_bundle = yield _this9._bundler.initializeGraph(
          resolvedEntryFilePath,
          transformOptions,
          {
            onProgress,
            shallow: graphOptions.shallow
          }
        );

        revision = _yield$_this9$_bundle.revision;
      } else {
        var _yield$_this9$_bundle2 = yield _this9._bundler.updateGraph(
          yield revPromise,
          false
        );

        revision = _yield$_this9$_bundle2.revision;
      }

      let _revision2 = revision,
        prepend = _revision2.prepend,
        graph = _revision2.graph;

      if (serializerOptions.modulesOnly) {
        prepend = [];
      }

      return getExplodedSourceMap(
        [].concat(
          _toConsumableArray(prepend),
          _toConsumableArray(_this9._getSortedModules(graph))
        ),
        {
          processModuleFilter: _this9._config.serializer.processModuleFilter
        }
      );
    })();
  }

  _resolveRelativePath(filePath, _ref16) {
    var _this10 = this;

    let transformOptions = _ref16.transformOptions;
    return _asyncToGenerator(function*() {
      const resolutionFn = yield transformHelpers.getResolveDependencyFn(
        _this10._bundler.getBundler(),
        transformOptions.platform
      );
      return resolutionFn(`${_this10._config.projectRoot}/.`, filePath);
    })();
  }

  getNewBuildID() {
    return (this._nextBundleBuildID++).toString(36);
  }

  getPlatforms() {
    return this._config.resolver.platforms;
  }

  getWatchFolders() {
    return this._config.watchFolders;
  }
}

_defineProperty(Server, "DEFAULT_GRAPH_OPTIONS", {
  customTransformOptions: Object.create(null),
  dev: true,
  hot: false,
  minify: false,
  runtimeBytecodeVersion: null,
  unstable_transformProfile: "default"
});

_defineProperty(
  Server,
  "DEFAULT_BUNDLE_OPTIONS",
  _objectSpread(
    _objectSpread({}, Server.DEFAULT_GRAPH_OPTIONS),
    {},
    {
      excludeSource: false,
      inlineSourceMap: false,
      modulesOnly: false,
      onProgress: null,
      runModule: true,
      shallow: false,
      sourceMapUrl: null,
      sourceUrl: null
    }
  )
);

function* zip(xs, ys) {
  //$FlowIssue #9324959
  const ysIter = ys[Symbol.iterator]();

  for (const x of xs) {
    const y = ysIter.next();

    if (y.done) {
      return;
    }

    yield [x, y.value];
  }
}

module.exports = Server;
