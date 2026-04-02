(function(){
  "use strict";

  function pad2(n){return String(n).padStart(2,"0");}
  function fmtDate(d){return d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate());}
  function fmtDt(d){return fmtDate(d)+"T"+pad2(d.getHours())+pad2(d.getMinutes())+"00";}

  function normalize(text){
    return String(text||"")
      .replace(/[！-～]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)-0xFEE0);})
      .replace(/　/g," ")
      .replace(/[〜～]/g,"~")
      .replace(/\s+/g," ")
      .trim();
  }

  function parse(text){
    var s = normalize(text);
    var now = new Date();

    var m = s.match(/平成\s*(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日(?:.*?)(\d{1,2}):(\d{2})?/)
      || s.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})(?:.*?)(\d{1,2}):(\d{2})?/)
      || s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日(?:.*?)(\d{1,2}):(\d{2})?/);

    if (m) {
      var year = Number(m[1]);
      if (/平成/.test(s)) year = 1988 + Number(m[1]);
      var month = Number(m[2]);
      var day = Number(m[3]);
      var hour = Number(m[4] || 0);
      var minute = Number(m[5] || 0);
      var start = new Date(year, month-1, day, hour % 24, minute, 0);
      if (hour >= 24) start.setDate(start.getDate() + Math.floor(hour/24));
      var end = new Date(start.getTime());
      if (m[4]) {
        end.setMinutes(end.getMinutes()+60);
        return {start:start,end:end,allDay:false};
      }
      end.setDate(end.getDate()+1);
      return {start:new Date(year,month-1,day),end:end,allDay:true};
    }

    var d = s.match(/平成\s*(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日/)
      || s.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
      || s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/)
      || s.match(/(\d{1,2})月\s*(\d{1,2})日/);
    if (d) {
      var y = now.getFullYear();
      var mo = 0;
      var da = 0;
      if (/平成/.test(s)) {
        y = 1988 + Number(d[1]);
        mo = Number(d[2]);
        da = Number(d[3]);
      } else if (/^\d{4}([\/年])/.test(d[0])) {
        y = Number(d[1]);
        mo = Number(d[2]);
        da = Number(d[3]);
      } else {
        mo = Number(d[1]);
        da = Number(d[2]);
      }
      var startOnly = new Date(y, mo - 1, da);
      var endOnly = new Date(startOnly.getTime());
      endOnly.setDate(endOnly.getDate() + 1);
      return {start:startOnly,end:endOnly,allDay:true};
    }

    var rel = s.match(/明日/) ? 1 : 0;
    var date = new Date(now.getFullYear(), now.getMonth(), now.getDate()+rel);
    var t = s.match(/(正午|午後\s*[一二三四五六七八九十\d]+時|午前\s*[一二三四五六七八九十\d]+時|\d{1,2}:\d{2}|\d{1,2}時)/);
    if (!t) {
      var endAll = new Date(date.getTime());
      endAll.setDate(endAll.getDate()+1);
      return {start:date,end:endAll,allDay:true};
    }

    var hour = 0;
    var minute = 0;
    if (/正午/.test(t[1])) {
      hour = 12;
    } else if (/\d{1,2}:\d{2}/.test(t[1])) {
      var mm = t[1].match(/(\d{1,2}):(\d{2})/);
      hour = Number(mm[1]); minute = Number(mm[2]);
    } else {
      var hm = t[1].match(/([一二三四五六七八九十\d]+)時/);
      var k = hm ? hm[1] : "0";
      var map = {"一":1,"二":2,"三":3,"四":4,"五":5,"六":6,"七":7,"八":8,"九":9};
      if (/^\d+$/.test(k)) hour = Number(k);
      else if (k === "十") hour = 10;
      else if (/^[一二三四五六七八九]十$/.test(k)) hour = map[k[0]] * 10;
      else if (/^十[一二三四五六七八九]$/.test(k)) hour = 10 + map[k[1]];
      else hour = map[k] || 0;
      if (/午後/.test(t[1]) && hour < 12) hour += 12;
    }

    var start2 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour % 24, minute, 0);
    if (hour >= 24) start2.setDate(start2.getDate() + Math.floor(hour / 24));
    var end2 = new Date(start2.getTime());
    end2.setMinutes(end2.getMinutes()+60);
    return {start:start2,end:end2,allDay:false};
  }

  var script = document.currentScript;
  var encoded = script && script.dataset ? script.dataset.gcalQuickText : "";
  var selected = decodeURIComponent(encoded || "");
  if (!selected) {
    alert("CSP版: 選択テキストが見つかりません。");
    return;
  }

  var parsed = parse(selected);
  var params = new URLSearchParams();
  if (parsed.allDay) {
    params.set("dates", fmtDate(parsed.start)+"/"+fmtDate(parsed.end));
  } else {
    params.set("dates", fmtDt(parsed.start)+"/"+fmtDt(parsed.end));
    params.set("ctz", "Asia/Tokyo");
  }
  var pageTitle = normalize(document.title || "");
  params.set("text", (pageTitle || normalize(selected)).slice(0,80));
  params.set("details", normalize(selected));

  var url = "https://calendar.google.com/calendar/u/0/r/eventedit?" + params.toString();
  window.open(url, "_blank", "noopener,noreferrer");
})();
