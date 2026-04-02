"use strict";

const { parseSelectedText } = require("./date-parser");
const { buildCalendarUrl } = require("./calendar-url");

function createCalendarUrlFromSelection(selectedText, options) {
  const parsed = parseSelectedText(selectedText, options);
  if (!parsed.ok) {
    return parsed;
  }

  return {
    ok: true,
    url: buildCalendarUrl(parsed, options),
    parsed,
  };
}

module.exports = {
  createCalendarUrlFromSelection,
};
