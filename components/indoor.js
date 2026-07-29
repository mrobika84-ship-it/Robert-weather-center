window.RWC_INDOOR = {
  mount(){
    document.getElementById("indoorPanel").innerHTML=`
      <div class="panel-title">BELTÉRI LEVEGŐ (NETATMO)</div>
      <div class="indoor-grid">
        <div class="indoor-temp-card"><span>BELTÉRI HŐMÉRSÉKLET</span><strong><span id="inTemp">--</span><small>°C</small></strong><em id="comfortText">● Kellemes hőmérséklet</em></div>
        <div class="indoor-small"><span>PÁRATARTALOM</span><strong id="inHum">--%</strong><div class="meter"><i id="humidityBar"></i></div></div>
        <div class="indoor-small"><span>CO₂</span><strong><span id="co2">--</span> ppm</strong><em id="co2Text">● Nincs adat</em></div>
        <div class="indoor-small"><span>LÉGNYOMÁS</span><strong id="pressure">-- mbar</strong></div>
        <div class="indoor-small"><span>MODUL ELEM</span><strong id="battery">--%</strong></div>
        <div class="micro-card"><span>HARMATPONT</span><strong id="dewPoint">-- °C</strong></div>
        <div class="micro-card"><span>ABSZ. PÁRATARTALOM</span><strong id="absoluteHumidity">-- g/m³</strong></div>
        <div class="micro-card"><span>KOMFORT INDEX</span><strong id="comfortIndex">--</strong></div>
        <div class="micro-card ventilation-micro"><span>SZELLŐZTETÉSI JAVASLAT</span><strong id="ventRecommendation">--</strong></div>
      </div>
      <div class="last-netatmo"><span>UTOLSÓ NETATMO ADAT</span><strong id="updated">--</strong></div>`;
  }
};
