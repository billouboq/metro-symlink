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

const crypto = require("crypto");

const fs = require("fs");

const path = require("path");

function transform(_x, _x2, _x3, _x4) {
  return _transform.apply(this, arguments);
}

function _transform() {
  _transform = _asyncToGenerator(function*(
    filename,
    transformOptions,
    projectRoot,
    transformerConfig
  ) {
    // eslint-disable-next-line no-useless-call
    const Transformer = require.call(null, transformerConfig.transformerPath);

    const transformFileStartLogEntry = {
      action_name: "Transforming file",
      action_phase: "start",
      file_name: filename,
      log_entry_label: "Transforming file",
      start_timestamp: process.hrtime()
    };
    const data = fs.readFileSync(path.resolve(projectRoot, filename));
    const sha1 = crypto
      .createHash("sha1")
      .update(data)
      .digest("hex");
    const result = yield Transformer.transform(
      transformerConfig.transformerConfig,
      projectRoot,
      filename,
      data,
      transformOptions
    );
    const transformFileEndLogEntry = getEndLogEntry(
      transformFileStartLogEntry,
      filename
    );
    return {
      result,
      sha1,
      transformFileStartLogEntry,
      transformFileEndLogEntry
    };
  });
  return _transform.apply(this, arguments);
}

function getEndLogEntry(startLogEntry, filename) {
  const timeDelta = process.hrtime(startLogEntry.start_timestamp);
  const duration_ms = Math.round((timeDelta[0] * 1e9 + timeDelta[1]) / 1e6);
  return {
    action_name: "Transforming file",
    action_phase: "end",
    file_name: filename,
    duration_ms,
    log_entry_label: "Transforming file"
  };
}

module.exports = {
  transform
};
