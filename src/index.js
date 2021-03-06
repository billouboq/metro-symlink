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

const IncrementalBundler = require("./IncrementalBundler");

const MetroHmrServer = require("./HmrServer");

const MetroServer = require("./Server");

const attachWebsocketServer = require("./lib/attachWebsocketServer");

const chalk = require("chalk");

const fs = require("fs");

const http = require("http");

const https = require("https");

const makeBuildCommand = require("./commands/build");

const makeDependenciesCommand = require("./commands/dependencies");

const makeServeCommand = require("./commands/serve");

const outputBundle = require("./shared/output/bundle");

const _require = require("metro-config"),
  loadConfig = _require.loadConfig,
  mergeConfig = _require.mergeConfig,
  getDefaultConfig = _require.getDefaultConfig;

const _require2 = require("metro-inspector-proxy"),
  InspectorProxy = _require2.InspectorProxy;

function getConfig(_x) {
  return _getConfig.apply(this, arguments);
}

function _getConfig() {
  _getConfig = _asyncToGenerator(function*(config) {
    const defaultConfig = yield getDefaultConfig(config.projectRoot);
    return mergeConfig(defaultConfig, config);
  });
  return _getConfig.apply(this, arguments);
}

function runMetro(_x2, _x3) {
  return _runMetro.apply(this, arguments);
}

function _runMetro() {
  _runMetro = _asyncToGenerator(function*(config, options) {
    const mergedConfig = yield getConfig(config);
    mergedConfig.reporter.update({
      hasReducedPerformance: options
        ? Boolean(options.hasReducedPerformance)
        : false,
      port: mergedConfig.server.port,
      type: "initialize_started"
    });
    return new MetroServer(mergedConfig, options);
  });
  return _runMetro.apply(this, arguments);
}

exports.runMetro = runMetro;
exports.loadConfig = loadConfig;

exports.createConnectMiddleware = /*#__PURE__*/ (function() {
  var _ref = _asyncToGenerator(function*(config, options) {
    const metroServer = yield runMetro(config, options);
    let enhancedMiddleware = metroServer.processRequest; // Enhance the resulting middleware using the config options

    if (config.server.enhanceMiddleware) {
      enhancedMiddleware = config.server.enhanceMiddleware(
        enhancedMiddleware,
        metroServer
      );
    }

    return {
      attachHmrServer(httpServer) {
        attachWebsocketServer({
          httpServer,
          path: "/hot",
          websocketServer: new MetroHmrServer(
            metroServer.getBundler(),
            metroServer.getCreateModuleId(),
            config
          )
        });
      },

      metroServer,
      middleware: enhancedMiddleware,

      end() {
        metroServer.end();
      }
    };
  });

  return function(_x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();

exports.runServer = /*#__PURE__*/ (function() {
  var _ref2 = _asyncToGenerator(function*(config, _ref3) {
    let _ref3$hasReducedPerfo = _ref3.hasReducedPerformance,
      hasReducedPerformance =
        _ref3$hasReducedPerfo === void 0 ? false : _ref3$hasReducedPerfo,
      host = _ref3.host,
      onError = _ref3.onError,
      onReady = _ref3.onReady,
      secureServerOptions = _ref3.secureServerOptions,
      secure = _ref3.secure,
      secureCert = _ref3.secureCert,
      secureKey = _ref3.secureKey;

    if (secure != null || secureCert != null || secureKey != null) {
      // eslint-disable-next-line no-console
      console.warn(
        chalk.inverse.yellow.bold(" DEPRECATED "),
        "The `secure`, `secureCert`, and `secureKey` options are now deprecated. " +
          "Please use the `secureServerOptions` object instead to pass options to " +
          "Metro's https development server."
      );
    } // Lazy require

    const connect = require("connect");

    const serverApp = connect();

    const _yield$exports$create = yield exports.createConnectMiddleware(
        config,
        {
          hasReducedPerformance
        }
      ),
      attachHmrServer = _yield$exports$create.attachHmrServer,
      middleware = _yield$exports$create.middleware,
      end = _yield$exports$create.end;

    serverApp.use(middleware);
    let inspectorProxy = null;

    if (config.server.runInspectorProxy) {
      inspectorProxy = new InspectorProxy(config.projectRoot);
    }

    let httpServer;

    if (secure || secureServerOptions != null) {
      let options = secureServerOptions;

      if (typeof secureKey === "string" && typeof secureCert === "string") {
        options = Object.assign(
          {
            key: fs.readFileSync(secureKey),
            cert: fs.readFileSync(secureCert)
          },
          secureServerOptions
        );
      }

      httpServer = https.createServer(options, serverApp);
    } else {
      httpServer = http.createServer(serverApp);
    }

    httpServer.on("error", error => {
      if (onError) {
        onError(error);
      }

      end();
    });
    return new Promise((resolve, reject) => {
      httpServer.listen(config.server.port, host, () => {
        if (onReady) {
          onReady(httpServer);
        }

        attachHmrServer(httpServer);

        if (inspectorProxy) {
          inspectorProxy.addWebSocketListener(httpServer); // TODO(hypuk): Refactor inspectorProxy.processRequest into separate request handlers
          // so that we could provide routes (/json/list and /json/version) here.
          // Currently this causes Metro to give warning about T31407894.

          serverApp.use(inspectorProxy.processRequest.bind(inspectorProxy));
        }

        resolve(httpServer);
      }); // Disable any kind of automatic timeout behavior for incoming
      // requests in case it takes the packager more than the default
      // timeout of 120 seconds to respond to a request.

      httpServer.timeout = 0;
      httpServer.on("error", error => {
        end();
        reject(error);
      });
      httpServer.on("close", () => {
        end();
      });
    });
  });

  return function(_x6, _x7) {
    return _ref2.apply(this, arguments);
  };
})();

exports.runBuild = /*#__PURE__*/ (function() {
  var _ref4 = _asyncToGenerator(function*(config, _ref5) {
    let _ref5$dev = _ref5.dev,
      dev = _ref5$dev === void 0 ? false : _ref5$dev,
      entry = _ref5.entry,
      onBegin = _ref5.onBegin,
      onComplete = _ref5.onComplete,
      onProgress = _ref5.onProgress,
      _ref5$minify = _ref5.minify,
      minify = _ref5$minify === void 0 ? true : _ref5$minify,
      _ref5$output = _ref5.output,
      output = _ref5$output === void 0 ? outputBundle : _ref5$output,
      out = _ref5.out,
      _ref5$platform = _ref5.platform,
      platform = _ref5$platform === void 0 ? "web" : _ref5$platform,
      _ref5$sourceMap = _ref5.sourceMap,
      sourceMap = _ref5$sourceMap === void 0 ? false : _ref5$sourceMap,
      sourceMapUrl = _ref5.sourceMapUrl;
    const metroServer = yield runMetro(config, {
      watch: false
    });

    try {
      const requestOptions = {
        dev,
        entryFile: entry,
        inlineSourceMap: sourceMap && !sourceMapUrl,
        minify,
        platform,
        sourceMapUrl: sourceMap === false ? undefined : sourceMapUrl,
        createModuleIdFactory: config.serializer.createModuleIdFactory,
        onProgress
      };

      if (onBegin) {
        onBegin();
      }

      const metroBundle = yield output.build(metroServer, requestOptions);

      if (onComplete) {
        onComplete();
      }

      if (out) {
        const bundleOutput = out.replace(/(\.js)?$/, ".js");
        const sourcemapOutput =
          sourceMap === false ? undefined : out.replace(/(\.js)?$/, ".map");
        const outputOptions = {
          bundleOutput,
          sourcemapOutput,
          dev,
          platform
        }; // eslint-disable-next-line no-console

        yield output.save(metroBundle, outputOptions, console.log);
      }

      return metroBundle;
    } finally {
      yield metroServer.end();
    }
  });

  return function(_x8, _x9) {
    return _ref4.apply(this, arguments);
  };
})();

exports.buildGraph = /*#__PURE__*/ (function() {
  var _ref6 = _asyncToGenerator(function*(config, _ref7) {
    let _ref7$customTransform = _ref7.customTransformOptions,
      customTransformOptions =
        _ref7$customTransform === void 0
          ? Object.create(null)
          : _ref7$customTransform,
      _ref7$dev = _ref7.dev,
      dev = _ref7$dev === void 0 ? false : _ref7$dev,
      entries = _ref7.entries,
      _ref7$minify = _ref7.minify,
      minify = _ref7$minify === void 0 ? false : _ref7$minify,
      onProgress = _ref7.onProgress,
      _ref7$platform = _ref7.platform,
      platform = _ref7$platform === void 0 ? "web" : _ref7$platform,
      _ref7$type = _ref7.type,
      type = _ref7$type === void 0 ? "module" : _ref7$type;
    const mergedConfig = yield getConfig(config);
    const bundler = new IncrementalBundler(mergedConfig);

    try {
      return yield bundler.buildGraphForEntries(
        entries,
        _objectSpread(
          _objectSpread({}, MetroServer.DEFAULT_GRAPH_OPTIONS),
          {},
          {
            customTransformOptions,
            dev,
            minify,
            platform,
            type
          }
        )
      );
    } finally {
      bundler.end();
    }
  });

  return function(_x10, _x11) {
    return _ref6.apply(this, arguments);
  };
})();

exports.attachMetroCli = function(
  // $FlowFixMe[value-as-type]
  yargs
) {
  let _ref8 =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref8$build = _ref8.build,
    build = _ref8$build === void 0 ? {} : _ref8$build,
    _ref8$serve = _ref8.serve,
    serve = _ref8$serve === void 0 ? {} : _ref8$serve,
    _ref8$dependencies = _ref8.dependencies,
    dependencies = _ref8$dependencies === void 0 ? {} : _ref8$dependencies;

  if (build) {
    const _makeBuildCommand = makeBuildCommand(),
      command = _makeBuildCommand.command,
      description = _makeBuildCommand.description,
      builder = _makeBuildCommand.builder,
      handler = _makeBuildCommand.handler;

    yargs.command(command, description, builder, handler);
  }

  if (serve) {
    const _makeServeCommand = makeServeCommand(),
      command = _makeServeCommand.command,
      description = _makeServeCommand.description,
      builder = _makeServeCommand.builder,
      handler = _makeServeCommand.handler;

    yargs.command(command, description, builder, handler);
  }

  if (dependencies) {
    const _makeDependenciesComm = makeDependenciesCommand(),
      command = _makeDependenciesComm.command,
      description = _makeDependenciesComm.description,
      builder = _makeDependenciesComm.builder,
      handler = _makeDependenciesComm.handler;

    yargs.command(command, description, builder, handler);
  }

  return yargs;
};
