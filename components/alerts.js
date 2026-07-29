window.RWC_ALERTS = {
  mount(){
    document.getElementById("alertsPanel").innerHTML=`
      <div class="panel-title">OKOS FIGYELMEZTETÉSEK</div>
      <div class="alerts-grid">
        <div class="alert-card green"><span>🙂</span><div><strong id="alertAirTitle">Levegőminőség</strong><em id="alertAirText">Betöltés…</em></div></div>
        <div class="alert-card yellow"><span>🪟</span><div><strong id="alertVentTitle">Szellőztetés</strong><em id="alertVentText">Betöltés…</em></div></div>
        <div class="alert-card orange"><span>🌧️</span><div><strong id="alertRainTitle">Csapadék</strong><em id="alertRainText">Betöltés…</em></div></div>
        <div class="alert-card red"><span>⚠️</span><div><strong id="alertUvTitle">UV-index</strong><em id="alertUvText">Betöltés…</em></div></div>
        <div class="alert-card blue"><span>🌡️</span><div><strong id="alertNightTitle">Éjszakai hőmérséklet</strong><em id="alertNightText">Betöltés…</em></div></div>
        <div class="alert-card cyan"><span>🔋</span><div><strong id="alertBatteryTitle">Kültéri modul</strong><em id="alertBatteryText">Betöltés…</em></div></div>
      </div>`;
  }
};
