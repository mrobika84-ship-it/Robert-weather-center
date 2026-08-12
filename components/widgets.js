window.RWC_WIDGETS = {
  mountHeader(){
    document.getElementById("appHeader").className="topbar";
    document.getElementById("appHeader").innerHTML=`
      <div class="clock-zone"><div id="clock">--:--</div><div id="date">Betöltés…</div></div>
      <div class="edition-zone"><div id="headerWeatherIcon" class="header-weather-icon">☾</div><div><div class="edition-title">Dolomites Edition · V8.8 Dynamic</div><div class="v8-badge">RESPONSIVE PRO</div><div id="headerCondition" class="edition-subtitle">Időjárás betöltése…</div></div></div>
      <div class="brand-zone"><div class="mountain-mark" aria-hidden="true"><svg viewBox="0 0 120 42" role="img"><path d="M4 35 L28 12 L43 27 L58 7 L77 30 L91 18 L116 35" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 35 L31 23 L39 31 M49 35 L59 20 L70 34 M82 35 L92 26 L101 35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/></svg></div><div><div class="brand-title">ROBERT WEATHER CENTER</div><div class="brand-subtitle">RÓBERT IDŐJÁRÁS KÖZPONT</div></div></div>
      <div class="status-zone"><div id="connection" class="status waiting">● Kapcsolódás…</div><div id="updatedTop">Frissítve: --</div><div id="nextRefresh">Következő frissítés: --</div></div>`;
  },
  mountFooter(){
    document.getElementById("appFooter").innerHTML=`
      <div><span>📍 Helyszín</span><strong>Dolomitok, Dél-Tirol, Olaszország</strong></div>
      <div><span>⏱ Frissítési intervallum</span><strong>2 perc</strong></div>
      <div><span>☁️ Adatforrások</span><strong>Netatmo · Open-Meteo · Windy</strong></div>
      <div><span>📡 Oldal üzemideje</span><strong id="uptime">--</strong></div>
      <div><span>💚</span><strong>Robert Weather Center V8.8</strong></div>`;
  }
};
