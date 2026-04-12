// browser-core.js — shared browser-compatible parsing and calendar URL logic.
// This file is inlined by build-bookmarklets.js into both the legacy bookmarklet and csp-runner.js.
// Do NOT use require/module.exports or ES modules here.

function pad2(n) { return String(n).padStart(2, "0"); }
function fmtDate(d) { return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()); }
function fmtDt(d) { return fmtDate(d) + "T" + pad2(d.getHours()) + pad2(d.getMinutes()) + "00"; }

function normalize(text) {
  return String(text || "")
    .replace(/[！-～]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); })
    .replace(/　/g, " ")
    .replace(/[〜～]/g, "~")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns {start:Date, end:Date, allDay:bool} or null if no date/time found.
function parseDate(rawText, now) {
  var s = normalize(rawText);
  now = now || new Date();

  function dateOnly(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function ensureFutureYear(y, mo, da) {
    var candidate = new Date(y, mo - 1, da);
    if (dateOnly(candidate) < dateOnly(now)) return y + 1;
    return y;
  }

  // 1. Full year + date with time (check before short mm/dd to avoid false matches)
  var m = s.match(/平成\s*(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日(?:.*?)(\d{1,2}):(\d{2})/)
    || s.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})(?:.*?)(\d{1,2}):(\d{2})/)
    || s.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})(?:.*?)(\d{1,2}):(\d{2})/)
    || s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日(?:.*?)(\d{1,2}):(\d{2})/);
  if (m) {
    var year = /平成/.test(s) ? 1988 + Number(m[1]) : Number(m[1]);
    var month = Number(m[2]);
    var day = Number(m[3]);
    var hour = Number(m[4]);
    var min = Number(m[5]);
    var s1 = new Date(year, month - 1, day, hour % 24, min, 0);
    if (hour >= 24) s1.setDate(s1.getDate() + Math.floor(hour / 24));
    var e1 = new Date(s1.getTime());
    e1.setMinutes(e1.getMinutes() + 60);
    return { start: s1, end: e1, allDay: false };
  }

  // 2. Short mm/dd (weekday) with time
  var mdt = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\s*\([月火水木金土日]\))?(?:.*?)(\d{1,2}):(\d{2})/);
  if (mdt) {
    var y0 = ensureFutureYear(now.getFullYear(), Number(mdt[1]), Number(mdt[2]));
    var h0 = Number(mdt[3]);
    var min0 = Number(mdt[4]);
    var s0 = new Date(y0, Number(mdt[1]) - 1, Number(mdt[2]), h0 % 24, min0, 0);
    if (h0 >= 24) s0.setDate(s0.getDate() + Math.floor(h0 / 24));
    var e0 = new Date(s0.getTime());
    e0.setMinutes(e0.getMinutes() + 60);
    return { start: s0, end: e0, allDay: false };
  }

  // 3. Full year + date only
  var d = s.match(/平成\s*(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日/)
    || s.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
    || s.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/)
    || s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/)
    || s.match(/\b(\d{1,2})\/(\d{1,2})(?!\/)/)
    || s.match(/(\d{1,2})月\s*(\d{1,2})日/);
  if (d) {
    var dy = now.getFullYear(), dmo, dda;
    if (/平成/.test(s)) {
      dy = 1988 + Number(d[1]); dmo = Number(d[2]); dda = Number(d[3]);
    } else if (/^\d{4}([\/\.年])/.test(d[0])) {
      dy = Number(d[1]); dmo = Number(d[2]); dda = Number(d[3]);
    } else if (/^\d{1,2}\/\d{1,2}$/.test(d[0])) {
      dmo = Number(d[1]); dda = Number(d[2]); dy = ensureFutureYear(dy, dmo, dda);
    } else {
      dmo = Number(d[1]); dda = Number(d[2]);
    }
    var sd = new Date(dy, dmo - 1, dda);
    var ed = new Date(sd.getTime()); ed.setDate(ed.getDate() + 1);
    return { start: sd, end: ed, allDay: true };
  }

  // 4. Relative date keywords (明日/今日)
  var relOffset = /明日/.test(s) ? 1 : 0;
  var hasRelKeyword = /明日|今日/.test(s);
  var relDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + relOffset);

  // 5. Time pattern (with or without date)
  var t = s.match(/(正午|午後\s*[一二三四五六七八九十\d]+時|午前\s*[一二三四五六七八九十\d]+時|\d{1,2}:\d{2}|\d{1,2}時)/);
  if (!t) {
    if (!hasRelKeyword) return null;
    var re = new Date(relDate.getTime()); re.setDate(re.getDate() + 1);
    return { start: relDate, end: re, allDay: true };
  }

  var th = 0, tm = 0;
  if (/正午/.test(t[1])) {
    th = 12;
  } else if (/\d{1,2}:\d{2}/.test(t[1])) {
    var tc = t[1].match(/(\d{1,2}):(\d{2})/);
    th = Number(tc[1]); tm = Number(tc[2]);
  } else {
    var hm = t[1].match(/([一二三四五六七八九十\d]+)時/);
    var tk = hm ? hm[1] : "0";
    var kmap = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9 };
    if (/^\d+$/.test(tk)) th = Number(tk);
    else if (tk === "十") th = 10;
    else if (/^[一二三四五六七八九]十$/.test(tk)) th = kmap[tk[0]] * 10;
    else if (/^十[一二三四五六七八九]$/.test(tk)) th = 10 + kmap[tk[1]];
    else th = kmap[tk] || 0;
    if (/午後/.test(t[1]) && th < 12) th += 12;
  }

  var st = new Date(relDate.getFullYear(), relDate.getMonth(), relDate.getDate(), th % 24, tm, 0);
  if (th >= 24) st.setDate(st.getDate() + Math.floor(th / 24));
  var et = new Date(st.getTime()); et.setMinutes(et.getMinutes() + 60);
  return { start: st, end: et, allDay: false };
}

function openCalendar(parsed, selectedText) {
  var nText = normalize(selectedText);
  var params = new URLSearchParams();
  if (parsed.allDay) {
    params.set("dates", fmtDate(parsed.start) + "/" + fmtDate(parsed.end));
  } else {
    params.set("dates", fmtDt(parsed.start) + "/" + fmtDt(parsed.end));
    params.set("ctz", "Asia/Tokyo");
  }
  var pageTitle = normalize(String(document.title || ""));
  var pageUrl = String(location && location.href ? location.href : "");
  var details = nText;
  if (pageUrl) details += "\n\nURL: " + pageUrl;
  params.set("text", (pageTitle || nText).slice(0, 80));
  params.set("details", details);
  var url = "https://calendar.google.com/calendar/u/0/r/eventedit?" + params.toString();
  window.open(url, "_blank", "noopener,noreferrer");
}
