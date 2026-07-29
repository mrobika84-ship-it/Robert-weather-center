window.RWC_OUTDOOR = {
  mount(){
    document.getElementById("outdoorPanel").innerHTML=`
      <div class="panel-title">KÜLTÉRI IDŐJÁRÁS</div>
      <div class="outdoor-main">
        <div class="weather-visual"><div id="weatherIcon" class="weather-icon">🌤️</div></div>
        <div class="outdoor-summary">
          <div class="outdoor-temp"><span id="outTemp">--</span><small> °C</small></div>
          <div id="weatherLabel" class="weather-label">--</div>
          <div class="feels"><span>🌡 HŐÉRZET</span><strong id="feelsLike">-- °C</strong></div>
        </div>
      </div>
      <div class="outdoor-stats">
        <div class="stat"><span>MIN.</span><strong id="tempMin">-- °C</strong></div>
        <div class="stat"><span>MAX.</span><strong id="tempMax">-- °C</strong></div>
        <div class="stat"><span>SZÉL</span><strong id="windSpeed">-- km/h</strong><em id="windDirection">--</em></div>
        <div class="stat"><span>SZÉLLÖKÉS</span><strong id="windGust">-- km/h</strong></div>
        <div class="stat"><span>ESŐ ESÉLYE</span><strong id="rainChance">--%</strong></div>
        <div class="stat"><span>UV-INDEX</span><strong id="uvIndex">--</strong><em id="uvText">--</em></div>
        <div class="stat"><span>FELHŐZET</span><strong id="cloudCover">--%</strong></div>
      </div>
      <div class="astro-row">
        <div><span>🌅 NAPFELKELTE</span><strong id="sunrise">--:--</strong></div>
        <div><span>🌇 NAPNYUGTA</span><strong id="sunset">--:--</strong></div>
        <div><span>🌙 HOLD FÁZIS</span><strong id="moonPhase">--</strong></div>
        <div><span>☀️ FÉNYERŐ</span><strong id="brightness">--%</strong></div>
        <div><span>👁 LÁTHATÓSÁG</span><strong id="visibility">-- km</strong></div>
        <div><span>🍃 LÉGMINŐSÉG</span><strong id="airQuality">--</strong></div>
      </div>`;
  }
};
