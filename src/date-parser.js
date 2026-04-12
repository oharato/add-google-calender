"use strict";

const WEEKDAYS = {
  "日": 0,
  "月": 1,
  "火": 2,
  "水": 3,
  "木": 4,
  "金": 5,
  "土": 6,
  "sun": 0,
  "sunday": 0,
  "mon": 1,
  "monday": 1,
  "tue": 2,
  "tuesday": 2,
  "wed": 3,
  "wednesday": 3,
  "thu": 4,
  "thursday": 4,
  "fri": 5,
  "friday": 5,
  "sat": 6,
  "saturday": 6,
};

const JP_NUM = {
  "零": 0,
  "〇": 0,
  "一": 1,
  "二": 2,
  "三": 3,
  "四": 4,
  "五": 5,
  "六": 6,
  "七": 7,
  "八": 8,
  "九": 9,
  "十": 10,
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, days) {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

function normalizeFullWidth(text) {
  return text.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/　/g, " ");
}

function normalizeText(input) {
  return normalizeFullWidth(String(input || ""))
    .replace(/[〜～]/g, "~")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/[／]/g, "/")
    .replace(/[：]/g, ":")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function parseKanjiNumber(token) {
  if (!token) return null;
  if (/^\d+$/.test(token)) return Number(token);
  if (token.length === 1 && token in JP_NUM) return JP_NUM[token];
  if (/^[一二三四五六七八九]?十[一二三四五六七八九]?$/.test(token)) {
    const [a, b] = token.split("十");
    const tens = a ? JP_NUM[a] : 1;
    const ones = b ? JP_NUM[b] : 0;
    return tens * 10 + ones;
  }
  return null;
}

function to24h(hour, meridiemHint) {
  let h = hour;
  if (meridiemHint === "pm" && h < 12) h += 12;
  if (meridiemHint === "am" && h === 12) h = 0;
  return h;
}

function parseTimeToken(text) {
  const s = text.toLowerCase();
  if (/正午/.test(s)) return { hour: 12, minute: 0 };

  let m = s.match(/(午前|午後|am|pm|よる|夜)?\s*(\d{1,2}):(\d{2})/i);
  if (m) {
    const marker = m[1] || "";
    const hourRaw = Number(m[2]);
    const minute = Number(m[3]);
    let meridiem = null;
    if (/午後|pm|よる|夜/i.test(marker)) meridiem = "pm";
    if (/午前|am/i.test(marker)) meridiem = "am";
    return { hour: to24h(hourRaw, meridiem), minute };
  }

  m = s.match(/(午前|午後|am|pm|よる|夜)?\s*(\d{1,2})時(?:\s*(\d{1,2})分?)?/i);
  if (m) {
    const marker = m[1] || "";
    const hourRaw = Number(m[2]);
    const minute = Number(m[3] || 0);
    let meridiem = null;
    if (/午後|pm|よる|夜/i.test(marker)) meridiem = "pm";
    if (/午前|am/i.test(marker)) meridiem = "am";
    return { hour: to24h(hourRaw, meridiem), minute };
  }

  m = s.match(/(午前|午後|よる|夜)?\s*([一二三四五六七八九十]+)時(?:\s*([一二三四五六七八九十]+)分?)?/);
  if (m) {
    const marker = m[1] || "";
    const hourRaw = parseKanjiNumber(m[2]);
    const minute = parseKanjiNumber(m[3] || "") || 0;
    if (hourRaw == null) return null;
    let meridiem = null;
    if (/午後|よる|夜/.test(marker)) meridiem = "pm";
    if (/午前/.test(marker)) meridiem = "am";
    return { hour: to24h(hourRaw, meridiem), minute };
  }

  return null;
}

function nextWeekday(base, targetWeekday, strictNext) {
  const day = base.getDay();
  let diff = (targetWeekday - day + 7) % 7;
  if (strictNext && diff === 0) diff = 7;
  return addDays(base, diff);
}

function parseRelativeDate(text, now) {
  const s = text.toLowerCase();
  if (/明日/.test(s)) return addDays(now, 1);
  if (/今日/.test(s)) return toDateOnly(now);

  const weekdayMatch = s.match(/(?:次の|こんどの)?\s*(日|月|火|水|木|金|土)曜(?:日)?/);
  if (weekdayMatch) {
    const strictNext = /次の|こんどの/.test(s);
    return nextWeekday(now, WEEKDAYS[weekdayMatch[1]], strictNext);
  }

  const enWeekdayMatch = s.match(/\b(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?)\b/i);
  if (enWeekdayMatch) {
    return nextWeekday(now, WEEKDAYS[enWeekdayMatch[1].toLowerCase()], false);
  }

  return null;
}

function parseDateParts(text, now) {
  const s = text;

  let m = s.match(/平成\s*(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (m) return { year: 1988 + Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  m = s.match(/令和\s*(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (m) return { year: 2018 + Number(m[1]), month: Number(m[2]), day: Number(m[3]) };

  m = s.match(/\b(\d{2,4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) {
    let year = Number(m[1]);
    if (year < 100) year += 2000;
    return { year, month: Number(m[2]), day: Number(m[3]) };
  }

  m = s.match(/\b(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };

  m = s.match(/\b(\d{1,2})\/(\d{1,2})(?!\/)/);
  if (m) {
    return { year: now.getFullYear(), month: Number(m[1]), day: Number(m[2]), inferredYear: true };
  }

  m = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };

  m = s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };

  m = s.match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s*(\d{4})\b/);
  if (m) {
    const months = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    };
    const month = months[m[1].slice(0, 3).toLowerCase()];
    if (month) return { year: Number(m[3]), month, day: Number(m[2]) };
  }

  m = s.match(/(再来年|来年)?\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (m) {
    let year = now.getFullYear();
    if (m[1] === "来年") year += 1;
    if (m[1] === "再来年") year += 2;
    return { year, month: Number(m[2]), day: Number(m[3]), inferredYear: true };
  }

  m = s.match(/\b(\d{1,2})日(?:\s*\([月火水木金土日]\))?/);
  if (m) {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: Number(m[1]), inferredMonth: true, inferredYear: true };
  }

  const rel = parseRelativeDate(s, now);
  if (rel) {
    return { year: rel.getFullYear(), month: rel.getMonth() + 1, day: rel.getDate(), relative: true };
  }

  return null;
}

function makeDate(y, m, d) {
  return new Date(y, m - 1, d);
}

function adjustFutureIfInPast(dateObj, now, inferredMonth, inferredYear) {
  const nowDate = toDateOnly(now);
  let out = new Date(dateObj.getTime());
  if (out >= nowDate) return out;
  if (inferredMonth) {
    out.setMonth(out.getMonth() + 1);
    if (out < nowDate) out.setMonth(out.getMonth() + 1);
    return out;
  }
  if (inferredYear) {
    out.setFullYear(out.getFullYear() + 1);
    return out;
  }
  return out;
}

function extractDateTimeRange(text, now) {
  const s = normalizeText(text);
  const sepMatch = s.match(/(.+?)(?:\s*(?:~|-|〜|から)\s*)(.+)/);
  if (sepMatch) {
    const left = sepMatch[1].trim();
    const right = sepMatch[2].trim();
    const start = parseSingle(left, now);
    const end = parseSingle(right, now, start ? toDateOnly(start.startDate) : null);
    if (start && end) {
      return {
        startDate: start.startDate,
        endDate: end.startDate,
        allDay: false,
      };
    }
  }
  return parseSingle(s, now);
}

function parseSingle(text, now, defaultDate) {
  const dateParts = parseDateParts(text, now);
  const timeParts = parseTimeToken(text);

  let baseDate = null;
  if (dateParts) {
    baseDate = makeDate(dateParts.year, dateParts.month, dateParts.day);
    baseDate = adjustFutureIfInPast(baseDate, now, dateParts.inferredMonth, dateParts.inferredYear);
  } else if (defaultDate) {
    baseDate = new Date(defaultDate.getTime());
  } else {
    baseDate = toDateOnly(now);
  }

  if (!timeParts) {
    const startDate = toDateOnly(baseDate);
    const endDate = addDays(startDate, 1);
    return { startDate, endDate, allDay: true };
  }

  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), timeParts.hour, timeParts.minute, 0);
  const overflowDays = Math.floor(timeParts.hour / 24);
  if (overflowDays > 0) {
    startDate.setHours(timeParts.hour % 24, timeParts.minute, 0, 0);
    startDate.setDate(startDate.getDate() + overflowDays);
  }

  const endDate = new Date(startDate.getTime());
  endDate.setMinutes(endDate.getMinutes() + 60);
  return { startDate, endDate, allDay: false };
}

function extractTitle(text) {
  return normalizeText(text).slice(0, 80);
}

function parseSelectedText(text, options) {
  const now = options && options.now ? new Date(options.now) : new Date();
  const raw = normalizeText(text);
  if (!raw) {
    return { ok: false, reason: "選択テキストが空です" };
  }

  const parsed = extractDateTimeRange(raw, now);
  if (!parsed || !parsed.startDate) {
    return { ok: false, reason: "日付を認識できませんでした" };
  }

  return {
    ok: true,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    allDay: Boolean(parsed.allDay),
    title: extractTitle(raw),
    details: raw,
  };
}

module.exports = {
  normalizeText,
  parseSelectedText,
};
