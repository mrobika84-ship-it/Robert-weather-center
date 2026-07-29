window.RWC_FORECAST = {
  mount(){
    document.getElementById("forecastPanel").innerHTML=`<div class="panel-title">7 NAPOS ELŐREJELZÉS</div><div id="forecastCards" class="forecast-cards"></div><div class="forecast-footer">RÉSZLETES ELŐREJELZÉS →</div>`;
  },
  render(data,iconFn,fmt){
    const names=["V","H","K","SZE","CSÜ","P","SZO"],box=document.getElementById("forecastCards");box.innerHTML="";
    for(let i=0;i<7;i++){
      const d=new Date(data.daily.time[i]),card=document.createElement("div");card.className="forecast-card";
      card.innerHTML=`<div class="day">${names[d.getDay()]}</div><div class="date">${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}</div><div class="icon">${iconFn(data.daily.weather_code[i])}</div><div class="max">${fmt(data.daily.temperature_2m_max[i])}°</div><div class="min">${fmt(data.daily.temperature_2m_min[i])}°</div><div class="rainp">💧 ${data.daily.precipitation_probability_max[i]??0}%</div>`;
      box.appendChild(card)
    }
  }
};
