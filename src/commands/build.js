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

const MetroApi = require("../index");

const TerminalReporter = require("../lib/TerminalReporter");

const _require = require("../cli-utils"),
  makeAsyncCommand = _require.makeAsyncCommand;

const _require2 = require("metro-config"),
  loadConfig = _require2.loadConfig;

const _require3 = require("metro-core"),
  Terminal = _require3.Terminal;

const term = new Terminal(process.stdout);
const updateReporter = new TerminalReporter(term);

module.exports = () => ({
  command: "build <entry>",
  description:
    "Generates a JavaScript bundle containing the specified entrypoint and its descendants",
  // $FlowFixMe[value-as-type]
  builder: yargs => {
    yargs.option("project-roots", {
      alias: "P",
      type: "string",
      array: true
    });
    yargs.option("out", {
      alias: "O",
      type: "string",
      demandOption: true
    });
    yargs.option("platform", {
      alias: "p",
      type: "string"
    });
    yargs.option("output-type", {
      alias: "t",
      type: "string"
    });
    yargs.option("max-workers", {
      alias: "j",
      type: "number"
    });
    yargs.option("minify", {
      alias: "z",
      type: "boolean"
    });
    yargs.option("dev", {
      alias: "g",
      type: "boolean"
    });
    yargs.option("source-map", {
      type: "boolean"
    });
    yargs.option("source-map-url", {
      type: "string"
    });
    yargs.option("legacy-bundler", {
      type: "boolean"
    });
    yargs.option("config", {
      alias: "c",
      type: "string"
    }); // Deprecated

    yargs.option("reset-cache", {
      type: "boolean"
    });
  },
  handler: makeAsyncCommand(
    /*#__PURE__*/ (function() {
      var _ref = _asyncToGenerator(function*(argv) {
        const config = yield loadConfig(argv); // $FlowExpectedError YargArguments and RunBuildOptions are used interchangeable but their types are not yet compatible

        const options = argv;
        yield MetroApi.runBuild(
          config,
          _objectSpread(
            _objectSpread({}, options),
            {},
            {
              onBegin: () => {
                updateReporter.update({
                  buildID: "$",
                  type: "bundle_build_started",
                  bundleDetails: {
                    bundleType: "Bundle",
                    dev: !!options.dev,
                    entryFile: options.entry,
                    minify: !!options.minify,
                    platform: options.platform,
                    // Bytecode bundles in Metro are not meant for production use. Instead,
                    // the Hermes Bytecode Compiler should be invoked on the resulting JS bundle from Metro.
                    runtimeBytecodeVersion: null
                  }
                });
              },
              onProgress: (transformedFileCount, totalFileCount) => {
                updateReporter.update({
                  buildID: "$",
                  type: "bundle_transform_progressed_throttled",
                  transformedFileCount,
                  totalFileCount
                });
              },
              onComplete: () => {
                updateReporter.update({
                  buildID: "$",
                  type: "bundle_build_done"
                });
              }
            }
          )
        );
      });

      return function(_x) {
        return _ref.apply(this, arguments);
      };
    })()
  )
});
