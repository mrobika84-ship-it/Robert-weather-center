window.RWC_RADAR = {
  mount(){
    document.getElementById("radarPanel").innerHTML=`
      <div class="radar-head"><div class="panel-title">ÉLŐ CSAPADÉKRADAR</div><button id="radarReload">↻ Frissítés</button></div>
      <iframe id="radarFrame" title="Élő csapadékradar" loading="lazy" referrerpolicy="no-referrer" src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=7&overlay=radar&product=radar&level=surface&lat=46.52&lon=11.50"></iframe>`;
    document.getElementById("radarReload").addEventListener("click",()=>{
      const f=document.getElementById("radarFrame"),s=f.src;f.src="about:blank";setTimeout(()=>f.src=s,100)
    });
  }
};
