"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { parseSelectedText } = require("../src/date-parser");

const fixedNow = new Date("2026-04-02T09:00:00+09:00");

function run(input) {
  return parseSelectedText(input, { now: fixedNow });
}

test("平成24年6月27日（水）21:00〜22:30", () => {
  const r = run("平成24年6月27日（水）21:00〜22:30、メンテナンスを実施");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2012);
  assert.equal(r.startDate.getMonth() + 1, 6);
  assert.equal(r.startDate.getDate(), 27);
  assert.equal(r.startDate.getHours(), 21);
});

test("次の土曜", () => {
  const r = run("次の土曜はカレー");
  assert.equal(r.ok, true);
  assert.equal(r.allDay, true);
});

test("11時に会議", () => {
  const r = run("11時に会議");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 11);
  assert.equal(r.allDay, false);
});

test("15/4/2", () => {
  const r = run("１５／４／２");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2015);
  assert.equal(r.startDate.getMonth() + 1, 4);
  assert.equal(r.startDate.getDate(), 2);
});

test("明日正午", () => {
  const r = run("明日正午より、発売されるゲームの新情報");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 12);
});

test("26:00", () => {
  const r = run("26:00から26:30まで");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 2);
});

test("午後五時", () => {
  const r = run("午後五時");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 17);
});

test("英語日付", () => {
  const r = run("Apr 2, 2026 release");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2026);
  assert.equal(r.startDate.getMonth() + 1, 4);
  assert.equal(r.startDate.getDate(), 2);
});
