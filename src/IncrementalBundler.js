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

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
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

const Bundler = require("./Bundler");

const DeltaBundler = require("./DeltaBundler");

const ResourceNotFoundError = require("./IncrementalBundler/ResourceNotFoundError");

const crypto = require("crypto");

const fs = require("fs");

const getGraphId = require("./lib/getGraphId");

const getPrependedScripts = require("./lib/getPrependedScripts");

const path = require("path");

const transformHelpers = require("./lib/transformHelpers");

function createRevisionId() {
  return crypto.randomBytes(8).toString("hex");
}

function revisionIdFromString(str) {
  return str;
}

class IncrementalBundler {
  constructor(config, options) {
    _defineProperty(this, "_revisionsById", new Map());

    _defineProperty(this, "_revisionsByGraphId", new Map());

    this._config = config;
    this._bundler = new Bundler(config, options);
    this._deltaBundler = new DeltaBundler(this._bundler);
  }

  end() {
    this._deltaBundler.end();

    this._bundler.end();
  }

  getBundler() {
    return this._bundler;
  }

  getDeltaBundler() {
    return this._deltaBundler;
  }

  getRevision(revisionId) {
    return this._revisionsById.get(revisionId);
  }

  getRevisionByGraphId(graphId) {
    return this._revisionsByGraphId.get(graphId);
  }

  buildGraphForEntries(entryFiles, transformOptions) {
    var _this = this;

    let otherOptions =
      arguments.length > 2 && arguments[2] !== undefined
        ? arguments[2]
        : {
            onProgress: null,
            shallow: false
          };
    return _asyncToGenerator(function*() {
      const absoluteEntryFiles = yield _this._getAbsoluteEntryFiles(entryFiles);
      const graph = yield _this._deltaBundler.buildGraph(absoluteEntryFiles, {
        resolve: yield transformHelpers.getResolveDependencyFn(
          _this._bundler,
          transformOptions.platform
        ),
        transform: yield transformHelpers.getTransformFn(
          absoluteEntryFiles,
          _this._bundler,
          _this._deltaBundler,
          _this._config,
          transformOptions
        ),
        onProgress: otherOptions.onProgress,
        experimentalImportBundleSupport:
          _this._config.transformer.experimentalImportBundleSupport,
        shallow: otherOptions.shallow
      });

      _this._config.serializer.experimentalSerializerHook(graph, {
        added: graph.dependencies,
        modified: new Map(),
        deleted: new Set(),
        reset: true
      });

      return graph;
    })();
  }

  getDependencies(entryFiles, transformOptions) {
    var _this2 = this;

    let otherOptions =
      arguments.length > 2 && arguments[2] !== undefined
        ? arguments[2]
        : {
            onProgress: null,
            shallow: false
          };
    return _asyncToGenerator(function*() {
      const absoluteEntryFiles = yield _this2._getAbsoluteEntryFiles(
        entryFiles
      );
      const dependencies = yield _this2._deltaBundler.getDependencies(
        absoluteEntryFiles,
        {
          resolve: yield transformHelpers.getResolveDependencyFn(
            _this2._bundler,
            transformOptions.platform
          ),
          transform: yield transformHelpers.getTransformFn(
            absoluteEntryFiles,
            _this2._bundler,
            _this2._deltaBundler,
            _this2._config,
            transformOptions
          ),
          onProgress: otherOptions.onProgress,
          experimentalImportBundleSupport:
            _this2._config.transformer.experimentalImportBundleSupport,
          shallow: otherOptions.shallow
        }
      );
      return dependencies;
    })();
  }

  buildGraph(entryFile, transformOptions) {
    var _this3 = this;

    let otherOptions =
      arguments.length > 2 && arguments[2] !== undefined
        ? arguments[2]
        : {
            onProgress: null,
            shallow: false
          };
    return _asyncToGenerator(function*() {
      const graph = yield _this3.buildGraphForEntries(
        [entryFile],
        transformOptions,
        otherOptions
      );

      const _ = transformOptions.type,
        transformOptionsWithoutType = _objectWithoutProperties(
          transformOptions,
          ["type"]
        );

      const prepend = yield getPrependedScripts(
        _this3._config,
        transformOptionsWithoutType,
        _this3._bundler,
        _this3._deltaBundler
      );
      return {
        prepend,
        graph
      };
    })();
  } // TODO T34760750 (alexkirsz) Eventually, I'd like to get to a point where
  // this class exposes only initializeGraph and updateGraph.

  initializeGraph(entryFile, transformOptions) {
    var _this4 = this;

    let otherOptions =
      arguments.length > 2 && arguments[2] !== undefined
        ? arguments[2]
        : {
            onProgress: null,
            shallow: false
          };
    return _asyncToGenerator(function*() {
      const graphId = getGraphId(entryFile, transformOptions, {
        shallow: otherOptions.shallow,
        experimentalImportBundleSupport:
          _this4._config.transformer.experimentalImportBundleSupport
      });
      const revisionId = createRevisionId();

      const revisionPromise = _asyncToGenerator(function*() {
        const _yield$_this4$buildGr = yield _this4.buildGraph(
            entryFile,
            transformOptions,
            otherOptions
          ),
          graph = _yield$_this4$buildGr.graph,
          prepend = _yield$_this4$buildGr.prepend;

        return {
          id: revisionId,
          date: new Date(),
          graphId,
          graph,
          prepend
        };
      })();

      _this4._revisionsById.set(revisionId, revisionPromise);

      _this4._revisionsByGraphId.set(graphId, revisionPromise);

      try {
        const revision = yield revisionPromise;
        const delta = {
          added: revision.graph.dependencies,
          modified: new Map(),
          deleted: new Set(),
          reset: true
        };
        return {
          revision,
          delta
        };
      } catch (err) {
        // Evict a bad revision from the cache since otherwise
        // we'll keep getting it even after the build is fixed.
        _this4._revisionsById.delete(revisionId);

        _this4._revisionsByGraphId.delete(graphId);

        throw err;
      }
    })();
  }

  updateGraph(revision, reset) {
    var _this5 = this;

    return _asyncToGenerator(function*() {
      const delta = yield _this5._deltaBundler.getDelta(revision.graph, {
        reset,
        shallow: false
      });

      _this5._config.serializer.experimentalSerializerHook(
        revision.graph,
        delta
      );

      if (
        delta.added.size > 0 ||
        delta.modified.size > 0 ||
        delta.deleted.size > 0
      ) {
        _this5._revisionsById.delete(revision.id);

        revision = _objectSpread(
          _objectSpread({}, revision),
          {},
          {
            // Generate a new revision id, to be used to verify the next incremental
            // request.
            id: crypto.randomBytes(8).toString("hex"),
            date: new Date()
          }
        );
        const revisionPromise = Promise.resolve(revision);

        _this5._revisionsById.set(revision.id, revisionPromise);

        _this5._revisionsByGraphId.set(revision.graphId, revisionPromise);
      }

      return {
        revision,
        delta
      };
    })();
  }

  endGraph(graphId) {
    var _this6 = this;

    return _asyncToGenerator(function*() {
      const revPromise = _this6._revisionsByGraphId.get(graphId);

      if (!revPromise) {
        return;
      }

      const revision = yield revPromise;

      _this6._deltaBundler.endGraph(revision.graph);

      _this6._revisionsByGraphId.delete(graphId);

      _this6._revisionsById.delete(revision.id);
    })();
  }

  _getAbsoluteEntryFiles(entryFiles) {
    var _this7 = this;

    return _asyncToGenerator(function*() {
      const absoluteEntryFiles = entryFiles.map(entryFile =>
        path.resolve(_this7._config.projectRoot, entryFile)
      );
      yield Promise.all(
        absoluteEntryFiles.map(
          entryFile =>
            new Promise((resolve, reject) => {
              // This should throw an error if the file doesn't exist.
              // Using this instead of fs.exists to account for SimLinks.
              fs.realpath(entryFile, err => {
                if (err) {
                  reject(new ResourceNotFoundError(entryFile));
                } else {
                  resolve();
                }
              });
            })
        )
      );
      return absoluteEntryFiles;
    })();
  }
}

_defineProperty(
  IncrementalBundler,
  "revisionIdFromString",
  revisionIdFromString
);

module.exports = IncrementalBundler;
