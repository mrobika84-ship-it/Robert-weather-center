window.RWC_WIDGETS = {
  mountHeader(){
    document.getElementById("appHeader").className="topbar";
    document.getElementById("appHeader").innerHTML=`
      <div class="clock-zone"><div id="clock">--:--</div><div id="date">Betöltés…</div></div>
      <div class="edition-zone"><div id="headerWeatherIcon" class="header-weather-icon">☀️</div><div><div class="edition-title">Dolomites Edition · V8 Ultimate</div><div class="v8-badge">TABLET PRO</div><div id="headerCondition" class="edition-subtitle">Időjárás betöltése…</div></div></div>
      <div class="brand-zone"><div class="mountain-mark">⌁▲⌁▲⌁</div><div><div class="brand-title">ROBERT WEATHER CENTER</div><div class="brand-subtitle">RÓBERT IDŐJÁRÁS KÖZPONT</div></div></div>
      <div class="status-zone"><div id="connection" class="status waiting">● Kapcsolódás…</div><div id="updatedTop">Frissítve: --</div><div id="nextRefresh">Következő frissítés: --</div></div>`;
  },
  mountFooter(){
    document.getElementById("appFooter").innerHTML=`
      <div><span>📍 Helyszín</span><strong>Dolomitok, Dél-Tirol, Olaszország</strong></div>
      <div><span>⏱ Frissítési intervallum</span><strong>2 perc</strong></div>
      <div><span>☁️ Adatforrások</span><strong>Netatmo · Open-Meteo · Windy</strong></div>
      <div><span>📡 Oldal üzemideje</span><strong id="uptime">--</strong></div>
      <div><span>💚</span><strong>Robert Weather Center V8</strong></div>`;
  }
};
