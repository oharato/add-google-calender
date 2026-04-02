# Bookmarklets

## Legacy

```text
javascript:!function(){try{var e=String(window.getSelection?window.getSelection():"").trim();if(!e)return void alert("\u30c6\u30ad\u30b9\u30c8\u3092\u9078\u629e\u3057\u3066\u304b\u3089\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002");function t(e){return String(e).padStart(2,"0")}function r(e){return e.getFullYear()+t(e.getMonth()+1)+t(e.getDate())}function a(e){return r(e)+"T"+t(e.getHours())+t(e.getMinutes())+"00"}var n,d,i,o=e.replace(/[\uff01-\uff5e]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)}).replace(/\u3000/g," ").replace(/\s+/g," ").trim(),s=new Date,u=o.match(/(\d{4})\/(\d{1,2})\/(\d{1,2}).*?(\d{1,2}):(\d{2})/)||o.match(/(\d{4})\u5e74\s*(\d{1,2})\u6708\s*(\d{1,2})\u65e5.*?(\d{1,2}):(\d{2})/);if(u)n=new Date(Number(u[1]),Number(u[2])-1,Number(u[3]),Number(u[4]),Number(u[5]),0),(d=new Date(n.getTime())).setMinutes(d.getMinutes()+60),i=!1;else{var m=o.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)||o.match(/(\d{4})\u5e74\s*(\d{1,2})\u6708\s*(\d{1,2})\u65e5/)||o.match(/(\d{1,2})\u6708\s*(\d{1,2})\u65e5/);if(!m)return void alert("\u65e5\u4ed8\u3092\u8a8d\u8b58\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\n\u4f8b: 2012/06/30 10:00");n=4===m.length?new Date(Number(m[1]),Number(m[2])-1,Number(m[3])):new Date(s.getFullYear(),Number(m[1])-1,Number(m[2])),(d=new Date(n.getTime())).setDate(d.getDate()+1),i=!0}var c=new URLSearchParams;i?c.set("dates",r(n)+"/"+r(d)):(c.set("dates",a(n)+"/"+a(d)),c.set("ctz","Asia/Tokyo"));var g=String(document.title||"").replace(/\s+/g," ").trim();c.set("text",(g||o).slice(0,80)),c.set("details",o);var l="https://calendar.google.com/calendar/u/0/r/eventedit?"+c.toString();window.open(l,"_blank","noopener,noreferrer")}catch(w){alert("Bookmarklet\u5b9f\u884c\u30a8\u30e9\u30fc: "+(w&&w.message?w.message:w))}}();
```

## CSP

```text
javascript:!function(){try{var e=String(window.getSelection?window.getSelection():"").trim();if(!e)return void alert("\u30c6\u30ad\u30b9\u30c8\u3092\u9078\u629e\u3057\u3066\u304b\u3089\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002");var t=document.createElement("script");t.src="https://oharato.github.io/add-google-calender/csp-runner.js?v=1",t.async=!0,t.dataset.gcalQuickText=encodeURIComponent(e),t.onerror=function(){alert("CSP\u7248\u30e9\u30f3\u30ca\u30fc\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002")},document.head.appendChild(t)}catch(e){alert("CSP\u7248\u5b9f\u884c\u30a8\u30e9\u30fc: "+(e&&e.message?e.message:e))}}();
```
