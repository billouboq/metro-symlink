/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
 */

/* eslint-disable no-console */
"use strict";

const chalk = require("chalk");

const groupStack = [];
let collapsedGuardTimer;

module.exports = function(terminal, level) {
  const logFunction = console[level] && level !== "trace" ? level : "log";
  const color =
    level === "error"
      ? chalk.inverse.red
      : level === "warn"
      ? chalk.inverse.yellow
      : chalk.inverse.white;

  if (level === "group") {
    groupStack.push(level);
  } else if (level === "groupCollapsed") {
    groupStack.push(level);
    clearTimeout(collapsedGuardTimer); // Inform users that logs get swallowed if they forget to call `groupEnd`.

    collapsedGuardTimer = setTimeout(() => {
      if (groupStack.includes("groupCollapsed")) {
        terminal.log(
          chalk.inverse.yellow.bold(" WARN "),
          "Expected `console.groupEnd` to be called after `console.groupCollapsed`."
        );
        groupStack.length = 0;
      }
    }, 3000);
    return;
  } else if (level === "groupEnd") {
    groupStack.pop();

    if (!groupStack.length) {
      clearTimeout(collapsedGuardTimer);
    }

    return;
  }

  if (!groupStack.includes("groupCollapsed")) {
    for (
      var _len = arguments.length,
        data = new Array(_len > 2 ? _len - 2 : 0),
        _key = 2;
      _key < _len;
      _key++
    ) {
      data[_key - 2] = arguments[_key];
    }

    // Remove excess whitespace at the end of a log message, if possible.
    const lastItem = data[data.length - 1];

    if (typeof lastItem === "string") {
      data[data.length - 1] = lastItem.trimEnd();
    }

    terminal.log.apply(
      terminal,
      [
        color.bold(` ${logFunction.toUpperCase()} `) +
          "".padEnd(groupStack.length * 2, " ")
      ].concat(data)
    );
  }
};
