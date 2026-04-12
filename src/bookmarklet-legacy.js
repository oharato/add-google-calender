javascript:(function(){
  /* @inject browser-core */
  try {
    var text = String(window.getSelection ? window.getSelection() : "").trim();
    if (!text) {
      alert("テキストを選択してから実行してください。");
      return;
    }
    var parsed = parseDate(text, new Date());
    if (!parsed) {
      alert("日付を認識できませんでした。\n例: 2012/06/30 10:00");
      return;
    }
    openCalendar(parsed, text);
  } catch (e) {
    alert("Bookmarklet実行エラー: " + (e && e.message ? e.message : e));
  }
})();
