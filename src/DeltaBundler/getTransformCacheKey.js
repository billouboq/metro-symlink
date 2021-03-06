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

const crypto = require("crypto");

const getCacheKey = require("metro-cache-key");

const path = require("path");

const VERSION = require("../../package.json").version;

/**
 * Returns a function that will return the transform cache key based on some
 * passed transform options.
 */
function getTransformCacheKey(opts) {
  const _opts$transformerConf = opts.transformerConfig,
    transformerPath = _opts$transformerConf.transformerPath,
    transformerConfig = _opts$transformerConf.transformerConfig; // eslint-disable-next-line no-useless-call

  const Transformer = require.call(null, transformerPath);

  const transformerKey = Transformer.getCacheKey
    ? Transformer.getCacheKey(transformerConfig)
    : "";
  return crypto
    .createHash("sha1")
    .update(
      [
        "metro-cache",
        VERSION,
        opts.cacheVersion,
        path.relative(path.join(__dirname, "../../.."), opts.projectRoot),
        getCacheKey([require.resolve(transformerPath)]),
        transformerKey,
        transformerConfig.globalPrefix
      ].join("$")
    )
    .digest("hex");
}

module.exports = getTransformCacheKey;
