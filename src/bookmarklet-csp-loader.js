javascript:(function(){
  var RUNNER_URL = "https://oharato.github.io/add-google-calender/csp-runner.js?v=2";
  try {
    var text = String(window.getSelection ? window.getSelection() : "").trim();
    if (!text) {
      alert("テキストを選択してから実行してください。");
      return;
    }

    var script = document.createElement("script");
    script.src = RUNNER_URL;
    script.async = true;
    script.dataset.gcalQuickText = encodeURIComponent(text);
    script.onerror = function(){
      alert("CSP版ランナーの読み込みに失敗しました。");
    };
    document.head.appendChild(script);
  } catch (e) {
    alert("CSP版実行エラー: " + (e && e.message ? e.message : e));
  }
})();
