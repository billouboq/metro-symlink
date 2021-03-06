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

const nullthrows = require("nullthrows");

const parseCustomTransformOptions = require("./parseCustomTransformOptions");

const parsePlatformFilePath = require("../node-haste/lib/parsePlatformFilePath");

const path = require("path");

const url = require("url");

const getBoolean = (query, opt, defaultValue) =>
  query[opt] == null
    ? defaultValue
    : query[opt] === "true" || query[opt] === "1";

const getNumber = (query, opt, defaultValue) => {
  const number = parseInt(query[opt], 10);
  return Number.isNaN(number) ? defaultValue : number;
};

const getBundleType = bundleType =>
  bundleType === "map" ? bundleType : "bundle";

const getTransformProfile = transformProfile =>
  transformProfile === "hermes-stable" || transformProfile === "hermes-canary"
    ? transformProfile
    : "default";

module.exports = function parseOptionsFromUrl(
  requestUrl,
  platforms,
  bytecodeVersion
) {
  const parsedURL = nullthrows(url.parse(requestUrl, true)); // `true` to parse the query param as an object.

  const query = nullthrows(parsedURL.query);
  const pathname =
    query.bundleEntry ||
    (parsedURL.pathname != null ? decodeURIComponent(parsedURL.pathname) : "");
  const platform =
    query.platform || parsePlatformFilePath(pathname, platforms).platform;
  const bundleType = getBundleType(path.extname(pathname).substr(1));
  const runtimeBytecodeVersion = getNumber(
    query,
    "runtimeBytecodeVersion",
    null
  );
  return {
    bundleType,
    runtimeBytecodeVersion:
      bytecodeVersion === runtimeBytecodeVersion ? bytecodeVersion : null,
    customTransformOptions: parseCustomTransformOptions(parsedURL),
    dev: getBoolean(query, "dev", true),
    entryFile: pathname.replace(/^(?:\.?\/)?/, "./").replace(/\.[^/.]+$/, ""),
    excludeSource: getBoolean(query, "excludeSource", false),
    hot: true,
    inlineSourceMap: getBoolean(query, "inlineSourceMap", false),
    minify: getBoolean(query, "minify", false),
    modulesOnly: getBoolean(query, "modulesOnly", false),
    onProgress: null,
    platform,
    runModule: getBoolean(query, "runModule", true),
    shallow: getBoolean(query, "shallow", false),
    sourceMapUrl: url.format(
      _objectSpread(
        _objectSpread({}, parsedURL),
        {},
        {
          // The Chrome Debugger loads bundles via Blob urls, whose
          // protocol is blob:http. This breaks loading source maps through
          // protocol-relative URLs, which is why we must force the HTTP protocol
          // when loading the bundle for either Android or iOS.
          protocol:
            platform != null && platform.match(/^(android|ios)$/) ? "http" : "",
          pathname: pathname.replace(/\.(bundle|delta)$/, ".map")
        }
      )
    ),
    sourceUrl: requestUrl,
    unstable_transformProfile: getTransformProfile(
      query.unstable_transformProfile
    )
  };
};
