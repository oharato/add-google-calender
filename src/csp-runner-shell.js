(function(){
  "use strict";
  /* @inject browser-core */

  var script = document.currentScript;
  var encoded = script && script.dataset ? script.dataset.gcalQuickText : "";
  var selected = decodeURIComponent(encoded || "");
  if (!selected) {
    alert("CSP版: 選択テキストが見つかりません。");
    return;
  }

  var parsed = parseDate(selected, new Date());
  if (!parsed) {
    alert("日付を認識できませんでした。\n例: 2012/06/30 10:00");
    return;
  }

  openCalendar(parsed, selected);
})();
