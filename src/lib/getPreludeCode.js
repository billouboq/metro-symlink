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

function getPreludeCode(_ref) {
  let extraVars = _ref.extraVars,
    isDev = _ref.isDev,
    globalPrefix = _ref.globalPrefix;
  const vars = [
    "__BUNDLE_START_TIME__=this.nativePerformanceNow?nativePerformanceNow():Date.now()",
    `__DEV__=${String(isDev)}`
  ].concat(_toConsumableArray(formatExtraVars(extraVars)), [
    "process=this.process||{}",
    `__METRO_GLOBAL_PREFIX__='${globalPrefix}'`
  ]);
  return `var ${vars.join(",")};${processEnv(
    isDev ? "development" : "production"
  )}`;
}

const excluded = new Set(["__BUNDLE_START_TIME__", "__DEV__", "process"]);

function formatExtraVars(extraVars) {
  const assignments = [];

  for (const key in extraVars) {
    if (extraVars.hasOwnProperty(key) && !excluded.has(key)) {
      /* $FlowFixMe(>=0.95.0 site=react_native_fb) This comment suppresses an
       * error found when Flow v0.95 was deployed. To see the error, delete
       * this comment and run Flow. */
      assignments.push(`${key}=${JSON.stringify(extraVars[key])}`);
    }
  }

  return assignments;
}

function processEnv(nodeEnv) {
  return `process.env=process.env||{};process.env.NODE_ENV=process.env.NODE_ENV||${JSON.stringify(
    nodeEnv
  )};`;
}

module.exports = getPreludeCode;
