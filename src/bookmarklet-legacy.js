javascript:(function(){
  try {
    var text = String(window.getSelection ? window.getSelection() : "").trim();
    if (!text) {
      alert("テキストを選択してから実行してください。");
      return;
    }

    function pad2(n){return String(n).padStart(2,"0");}
    function fmtDate(d){return d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate());}
    function fmtDt(d){return fmtDate(d)+"T"+pad2(d.getHours())+pad2(d.getMinutes())+"00";}

    var normalized = text.replace(/[！-～]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)-0xFEE0);}).replace(/　/g," ").replace(/\s+/g," ").trim();
    var now = new Date();

    var m = normalized.match(/(\d{4})\/(\d{1,2})\/(\d{1,2}).*?(\d{1,2}):(\d{2})/)
      || normalized.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日.*?(\d{1,2}):(\d{2})/);

    var start, end, allDay;
    if (m) {
      start = new Date(Number(m[1]), Number(m[2])-1, Number(m[3]), Number(m[4]), Number(m[5]), 0);
      end = new Date(start.getTime());
      end.setMinutes(end.getMinutes()+60);
      allDay = false;
    } else {
      var m2 = normalized.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
        || normalized.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/)
        || normalized.match(/(\d{1,2})月\s*(\d{1,2})日/);
      if (!m2) {
        alert("日付を認識できませんでした。\n例: 2012/06/30 10:00");
        return;
      }
      if (m2.length === 4) {
        start = new Date(Number(m2[1]), Number(m2[2])-1, Number(m2[3]));
      } else {
        start = new Date(now.getFullYear(), Number(m2[1])-1, Number(m2[2]));
      }
      end = new Date(start.getTime());
      end.setDate(end.getDate()+1);
      allDay = true;
    }

    var params = new URLSearchParams();
    if (allDay) {
      params.set("dates", fmtDate(start)+"/"+fmtDate(end));
    } else {
      params.set("dates", fmtDt(start)+"/"+fmtDt(end));
      params.set("ctz", "Asia/Tokyo");
    }
    params.set("text", normalized.slice(0,80));
    params.set("details", normalized);

    var url = "https://calendar.google.com/calendar/u/0/r/eventedit?" + params.toString();
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    alert("Bookmarklet実行エラー: " + (e && e.message ? e.message : e));
  }
})();
