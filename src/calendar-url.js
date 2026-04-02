"use strict";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateOnly(d) {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

function formatDateTimeLocal(d) {
  return `${formatDateOnly(d)}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
}

function buildCalendarUrl(input, options) {
  const tz = (options && options.timezone) || "Asia/Tokyo";
  const base = "https://calendar.google.com/calendar/u/0/r/eventedit";

  const params = new URLSearchParams();
  if (input.allDay) {
    params.set("dates", `${formatDateOnly(input.startDate)}/${formatDateOnly(input.endDate)}`);
  } else {
    params.set("dates", `${formatDateTimeLocal(input.startDate)}/${formatDateTimeLocal(input.endDate)}`);
    params.set("ctz", tz);
  }

  if (input.title) params.set("text", input.title);
  if (input.details) params.set("details", input.details);

  return `${base}?${params.toString()}`;
}

module.exports = {
  buildCalendarUrl,
  formatDateOnly,
  formatDateTimeLocal,
};
