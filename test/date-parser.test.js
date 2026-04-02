"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { parseSelectedText } = require("../src/date-parser");

const fixedNow = new Date("2026-04-02T09:00:00+09:00");

function run(input) {
  return parseSelectedText(input, { now: fixedNow });
}

test("TC-01 平成24年6月27日（水）21:00〜22:30", () => {
  const r = run("平成24年6月27日（水）21:00〜22:30、メンテナンスを実施");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2012);
  assert.equal(r.startDate.getMonth() + 1, 6);
  assert.equal(r.startDate.getDate(), 27);
  assert.equal(r.startDate.getHours(), 21);
});

test("TC-02 次の土曜はカレー", () => {
  const r = run("次の土曜はカレー");
  assert.equal(r.ok, true);
  assert.equal(r.allDay, true);
});

test("TC-03 11時に会議", () => {
  const r = run("11時に会議");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 11);
  assert.equal(r.allDay, false);
});

test("TC-04 09/1/24(土)10:00〜09/3/26(木)18:00", () => {
  const r = run("09/1/24(土)10:00〜09/3/26(木)18:00");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2009);
  assert.equal(r.startDate.getMonth() + 1, 1);
  assert.equal(r.startDate.getDate(), 24);
  assert.equal(r.startDate.getHours(), 10);
});

test("TC-05 １５／４／２", () => {
  const r = run("１５／４／２");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2015);
  assert.equal(r.startDate.getMonth() + 1, 4);
  assert.equal(r.startDate.getDate(), 2);
});

test("TC-06 2012/06/30 10:00", () => {
  const r = run("2012/06/30 10:00");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2012);
  assert.equal(r.startDate.getMonth() + 1, 6);
  assert.equal(r.startDate.getDate(), 30);
  assert.equal(r.startDate.getHours(), 10);
});

test("TC-07 明日正午より、発売されるゲームの新情報", () => {
  const r = run("明日正午より、発売されるゲームの新情報");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 12);
});

test("TC-08 26:00から26:30まで", () => {
  const r = run("26:00から26:30まで");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 2);
});

test("TC-09 2012/7/7 10:00〜26:00", () => {
  const r = run("2012/7/7 10:00〜26:00");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2012);
  assert.equal(r.startDate.getMonth() + 1, 7);
  assert.equal(r.startDate.getDate(), 7);
});

test("TC-10 日曜日に山登り", () => {
  const r = run("日曜日に山登り");
  assert.equal(r.ok, true);
  assert.equal(r.allDay, true);
});

test("TC-11 午後五時", () => {
  const r = run("午後五時");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getHours(), 17);
});

test("TC-12 ニンテンドー3DS LLは、7月28日に発売。", () => {
  const r = run("ニンテンドー3DS LLは、7月28日に発売。");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getMonth() + 1, 7);
  assert.equal(r.startDate.getDate(), 28);
  assert.equal(r.allDay, true);
});

test("TC-13 2012年8月1日から、現在20分遅れで表示されている株価がリアルタイムになります", () => {
  const r = run("2012年8月1日から、現在20分遅れで表示されている株価がリアルタイムになります");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2012);
  assert.equal(r.startDate.getMonth() + 1, 8);
  assert.equal(r.startDate.getDate(), 1);
});

test("TC-14 再来年３月１０日〜４月１２日", () => {
  const r = run("再来年３月１０日〜４月１２日");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2028);
  assert.equal(r.startDate.getMonth() + 1, 3);
  assert.equal(r.startDate.getDate(), 10);
});

test("TC-15 14日（月）よる8時から「ブルガリア」", () => {
  const r = run("14日（月）よる8時から「ブルガリア」");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getDate(), 14);
  assert.equal(r.startDate.getHours(), 20);
});

test("英語日付 Apr 2, 2026", () => {
  const r = run("Apr 2, 2026 release");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2026);
  assert.equal(r.startDate.getMonth() + 1, 4);
  assert.equal(r.startDate.getDate(), 2);
});

test("年なしスラッシュ日付 4/3 (金) 18:00", () => {
  const r = run("4/3 (金) 18:00");
  assert.equal(r.ok, true);
  assert.equal(r.startDate.getFullYear(), 2026);
  assert.equal(r.startDate.getMonth() + 1, 4);
  assert.equal(r.startDate.getDate(), 3);
  assert.equal(r.startDate.getHours(), 18);
  assert.equal(r.startDate.getMinutes(), 0);
});
