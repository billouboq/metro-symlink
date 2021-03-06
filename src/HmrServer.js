/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
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

const GraphNotFoundError = require("./IncrementalBundler/GraphNotFoundError");

const IncrementalBundler = require("./IncrementalBundler");

const RevisionNotFoundError = require("./IncrementalBundler/RevisionNotFoundError");

const debounceAsyncQueue = require("./lib/debounceAsyncQueue");

const formatBundlingError = require("./lib/formatBundlingError");

const getGraphId = require("./lib/getGraphId");

const hmrJSBundle = require("./DeltaBundler/Serializers/hmrJSBundle");

const nullthrows = require("nullthrows");

const parseOptionsFromUrl = require("./lib/parseOptionsFromUrl");

const splitBundleOptions = require("./lib/splitBundleOptions");

const transformHelpers = require("./lib/transformHelpers");

const url = require("url");

const _require = require("metro-core"),
  _require$Logger = _require.Logger,
  createActionStartEntry = _require$Logger.createActionStartEntry,
  createActionEndEntry = _require$Logger.createActionEndEntry,
  log = _require$Logger.log;

const _require2 = require("metro-hermes-compiler"),
  BYTECODE_VERSION = _require2.VERSION;

function send(sendFns, message) {
  const strMessage = JSON.stringify(message);
  sendFns.forEach(sendFn => sendFn(strMessage));
}
/**
 * The HmrServer (Hot Module Reloading) implements a lightweight interface
 * to communicate easily to the logic in the React Native repository (which
 * is the one that handles the Web Socket connections).
 *
 * This interface allows the HmrServer to hook its own logic to WS clients
 * getting connected, disconnected or having errors (through the
 * `onClientConnect`, `onClientDisconnect` and `onClientError` methods).
 */

class HmrServer {
  constructor(bundler, createModuleId, config) {
    this._config = config;
    this._bundler = bundler;
    this._createModuleId = createModuleId;
    this._clientGroups = new Map();
  }

  onClientConnect(requestUrl, sendFn) {
    return _asyncToGenerator(function*() {
      return {
        sendFn,
        revisionIds: [],
        optedIntoHMR: false
      };
    })();
  }

  _registerEntryPoint(client, requestUrl, sendFn) {
    var _this = this;

    return _asyncToGenerator(function*() {
      requestUrl = _this._config.server.rewriteRequestUrl(requestUrl);
      const clientUrl = nullthrows(url.parse(requestUrl, true));
      const options = parseOptionsFromUrl(
        requestUrl,
        new Set(_this._config.resolver.platforms),
        BYTECODE_VERSION
      );

      const _splitBundleOptions = splitBundleOptions(options),
        entryFile = _splitBundleOptions.entryFile,
        transformOptions = _splitBundleOptions.transformOptions,
        graphOptions = _splitBundleOptions.graphOptions;
      /**
       * `entryFile` is relative to projectRoot, we need to use resolution function
       * to find the appropriate file with supported extensions.
       */

      const resolutionFn = yield transformHelpers.getResolveDependencyFn(
        _this._bundler.getBundler(),
        transformOptions.platform
      );
      const resolvedEntryFilePath = resolutionFn(
        _this._config.projectRoot + "/.",
        entryFile
      );
      const graphId = getGraphId(resolvedEntryFilePath, transformOptions, {
        shallow: graphOptions.shallow,
        experimentalImportBundleSupport:
          _this._config.transformer.experimentalImportBundleSupport
      });

      const revPromise = _this._bundler.getRevisionByGraphId(graphId);

      if (!revPromise) {
        send([sendFn], {
          type: "error",
          body: formatBundlingError(new GraphNotFoundError(graphId))
        });
        return;
      }

      const _yield$revPromise = yield revPromise,
        graph = _yield$revPromise.graph,
        id = _yield$revPromise.id;

      client.revisionIds.push(id);

      let clientGroup = _this._clientGroups.get(id);

      if (clientGroup != null) {
        clientGroup.clients.add(client);
      } else {
        // Prepare the clientUrl to be used as sourceUrl in HMR updates.
        clientUrl.protocol = "http";

        const _ref = clientUrl.query || {},
          dev = _ref.dev,
          minify = _ref.minify,
          runModule = _ref.runModule,
          _bundleEntry = _ref.bundleEntry,
          query = _objectWithoutProperties(_ref, [
            "dev",
            "minify",
            "runModule",
            "bundleEntry"
          ]);

        clientUrl.query = _objectSpread(
          _objectSpread({}, query),
          {},
          {
            dev: dev || "true",
            minify: minify || "false",
            modulesOnly: "true",
            runModule: runModule || "false",
            shallow: "true"
          }
        );
        clientUrl.search = "";
        clientGroup = {
          clients: new Set([client]),
          clientUrl,
          revisionId: id,
          unlisten: () => unlisten()
        };

        _this._clientGroups.set(id, clientGroup);

        const unlisten = _this._bundler.getDeltaBundler().listen(
          graph,
          debounceAsyncQueue(
            _this._handleFileChange.bind(_this, clientGroup, {
              isInitialUpdate: false
            }),
            50
          )
        );
      }

      yield _this._handleFileChange(clientGroup, {
        isInitialUpdate: true
      });
      send([sendFn], {
        type: "bundle-registered"
      });
    })();
  }

  onClientMessage(client, message, sendFn) {
    var _this2 = this;

    return _asyncToGenerator(function*() {
      let data;

      try {
        data = JSON.parse(message);
      } catch (error) {
        send([sendFn], {
          type: "error",
          body: formatBundlingError(error)
        });
        return Promise.resolve();
      }

      if (data && data.type) {
        switch (data.type) {
          case "register-entrypoints":
            return Promise.all(
              data.entryPoints.map(entryPoint =>
                _this2._registerEntryPoint(client, entryPoint, sendFn)
              )
            );

          case "log":
            _this2._config.reporter.update({
              type: "client_log",
              level: data.level,
              data: data.data
            });

            break;

          case "log-opt-in":
            client.optedIntoHMR = true;
            break;

          default:
            break;
        }
      }

      return Promise.resolve();
    })();
  }

  onClientError(client, e) {
    this._config.reporter.update({
      type: "hmr_client_error",
      error: e
    });

    this.onClientDisconnect(client);
  }

  onClientDisconnect(client) {
    client.revisionIds.forEach(revisionId => {
      const group = this._clientGroups.get(revisionId);

      if (group != null) {
        if (group.clients.size === 1) {
          this._clientGroups.delete(revisionId);

          group.unlisten();
        } else {
          group.clients.delete(client);
        }
      }
    });
  }

  _handleFileChange(group, options) {
    var _this3 = this;

    return _asyncToGenerator(function*() {
      const optedIntoHMR = _toConsumableArray(group.clients).some(
        client => client.optedIntoHMR
      );

      const processingHmrChange = log(
        createActionStartEntry({
          // Even when HMR is disabled on the client, this function still
          // runs so we can stash updates while it's off and apply them later.
          // However, this would mess up our internal analytics because we track
          // HMR as being used even for people who have it disabled.
          // As a workaround, we use a different event name for clients
          // that didn't explicitly opt into HMR.
          action_name: optedIntoHMR
            ? "Processing HMR change"
            : "Processing HMR change (no client opt-in)"
        })
      );

      const sendFns = _toConsumableArray(group.clients).map(
        client => client.sendFn
      );

      send(sendFns, {
        type: "update-start",
        body: options
      });
      const message = yield _this3._prepareMessage(group, options);
      send(sendFns, message);
      send(sendFns, {
        type: "update-done"
      });
      log(
        _objectSpread(
          _objectSpread({}, createActionEndEntry(processingHmrChange)),
          {},
          {
            outdated_modules:
              message.type === "update"
                ? message.body.added.length + message.body.modified.length
                : undefined
          }
        )
      );
    })();
  }

  _prepareMessage(group, options) {
    var _this4 = this;

    return _asyncToGenerator(function*() {
      try {
        const revPromise = _this4._bundler.getRevision(group.revisionId);

        if (!revPromise) {
          return {
            type: "error",
            body: formatBundlingError(
              new RevisionNotFoundError(group.revisionId)
            )
          };
        }

        const _yield$_this4$_bundle = yield _this4._bundler.updateGraph(
            yield revPromise,
            false
          ),
          revision = _yield$_this4$_bundle.revision,
          delta = _yield$_this4$_bundle.delta;

        _this4._clientGroups.delete(group.revisionId);

        group.revisionId = revision.id;

        for (const client of group.clients) {
          client.revisionIds = client.revisionIds.filter(
            revisionId => revisionId !== group.revisionId
          );
          client.revisionIds.push(revision.id);
        }

        _this4._clientGroups.set(group.revisionId, group);

        const hmrUpdate = hmrJSBundle(delta, revision.graph, {
          createModuleId: _this4._createModuleId,
          projectRoot: _this4._config.projectRoot,
          clientUrl: group.clientUrl
        });
        return {
          type: "update",
          body: _objectSpread(
            {
              revisionId: revision.id,
              isInitialUpdate: options.isInitialUpdate
            },
            hmrUpdate
          )
        };
      } catch (error) {
        const formattedError = formatBundlingError(error);

        _this4._config.reporter.update({
          type: "bundling_error",
          error
        });

        return {
          type: "error",
          body: formattedError
        };
      }
    })();
  }
}

module.exports = HmrServer;
