const $=id=>document.getElementById(id);
const fmt=n=>(n===null||n===undefined)?"--":Number(n).toLocaleString("hu-HU",{maximumFractionDigits:1});

function updateClock(){
  const now=new Date();
  $("clock").textContent=now.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  $("date").textContent=now.toLocaleDateString("hu-HU",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
  $("systemTime").textContent="Rendszeridő: "+now.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  const h=now.getHours();
  document.body.classList.remove("time-day","time-sunset","time-night");
  document.body.classList.add(h>=7&&h<18?"time-day":h>=18&&h<21?"time-sunset":"time-night");
}
updateClock();setInterval(updateClock,1000);

function setConnection(type,text){$("connection").className="status "+type;$("connection").textContent="● "+text}

function moonPhaseName(date=new Date()){
  const syn=29.53058867,known=new Date("2000-01-06T18:14:00Z"),days=(date-known)/86400000;
  const p=((days%syn)+syn)%syn/syn;
  if(p<.03||p>.97)return"🌑 Újhold";if(p<.22)return"🌒 Növő sarló";if(p<.28)return"🌓 Első negyed";
  if(p<.47)return"🌔 Növő hold";if(p<.53)return"🌕 Telihold";if(p<.72)return"🌖 Fogyó hold";
  if(p<.78)return"🌗 Utolsó negyed";return"🌘 Fogyó sarló";
}
$("moonPhase").textContent=moonPhaseName();

function render(d){
  $("outTemp").textContent=fmt(d.outdoorTemperature);
  $("inTemp").textContent=fmt(d.indoorTemperature);
  $("co2").textContent=d.co2??"--";
  $("inHum").textContent=(d.indoorHumidity??"--")+"%";
  $("pressure").textContent=fmt(d.pressure)+" mbar";
  $("battery").textContent=d.outdoorBatteryPercent!=null?d.outdoorBatteryPercent+"%":"--";
  $("outdoorHumHero").textContent=(d.outdoorHumidity??"--")+"%";
  const updated=d.updatedAt?new Date(d.updatedAt*1000):new Date();
  const t=updated.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  $("updated").textContent=t;$("updatedTop").textContent="Frissítés: "+t;
  applyAdvice(d);saveHistory(d);drawCharts();
}
function applyAdvice(d){
  const co2=Number(d.co2||0),inside=Number(d.indoorTemperature),outside=Number(d.outdoorTemperature),hum=Number(d.indoorHumidity||0);
  const badge=$("co2Badge"),text=$("co2Text"),msg=$("ventMessage"),reason=$("ventReason"),alert=$("alertBar");
  alert.classList.add("hidden");
  if(co2>=1500){badge.style.color="var(--bad)";text.textContent="Nagyon magas CO₂";msg.style.color="var(--bad)";msg.textContent="AZONNAL SZELLŐZTESS";reason.textContent="A beltéri CO₂-szint túl magas.";alert.textContent="⚠ Magas CO₂-szint";alert.classList.remove("hidden")}
  else if(co2>=1000){badge.style.color="var(--warn)";text.textContent="Szellőztetés ajánlott";msg.style.color="var(--warn)";msg.textContent="NYISS ABLAKOT 5–10 PERCRE";reason.textContent="A beltéri CO₂-szint emelkedett."}
  else{badge.style.color="var(--good)";text.textContent="Jó levegő";msg.style.color="var(--good)";
    if(Number.isFinite(inside)&&Number.isFinite(outside)&&outside<inside-.5){msg.textContent="MOST ÉRDEMES SZELLŐZTETNI";reason.textContent="Kint hűvösebb van, mint bent."}
    else{msg.textContent="A LEVEGŐ RENDBEN VAN";reason.textContent="A CO₂-szint megfelelő."}}
  if(hum>=70){alert.textContent="⚠ Magas beltéri páratartalom";alert.classList.remove("hidden")}
  if(outside<=0){alert.textContent="❄ Fagyveszély odakint";alert.classList.remove("hidden")}
}
function weatherIcon(code){
  if(code===0)return"☀️";if([1,2].includes(code))return"🌤️";if(code===3)return"☁️";if([45,48].includes(code))return"🌫️";
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return"🌧️";
  if([71,73,75,77,85,86].includes(code))return"❄️";if([95,96,99].includes(code))return"⛈️";return"🌦️";
}
function saveHistory(d){
  const key="rwcHistoryV4",now=Date.now(),arr=JSON.parse(localStorage.getItem(key)||"[]");
  arr.push({t:now,i:Number(d.indoorTemperature),c:Number(d.co2)});
  const cutoff=now-24*3600*1000;
  localStorage.setItem(key,JSON.stringify(arr.filter(x=>x.t>=cutoff).slice(-360)));
}
function drawSeries(canvas,points,min,max,color){
  const ctx=canvas.getContext("2d"),w=canvas.clientWidth,h=canvas.clientHeight,dpr=devicePixelRatio||1;
  canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
  if(points.length<2)return;
  ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.beginPath();
  points.forEach((v,i)=>{const x=i/(points.length-1)*w,y=h-((v-min)/(max-min||1))*h*.78-h*.11;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.stroke();
}
function drawCharts(){
  const arr=JSON.parse(localStorage.getItem("rwcHistoryV4")||"[]");
  const temps=arr.map(x=>x.i).filter(Number.isFinite),co2=arr.map(x=>x.c).filter(Number.isFinite);
  if(temps.length)drawSeries($("tempChart"),temps,Math.min(...temps)-1,Math.max(...temps)+1,"rgba(63,224,136,.95)");
  if(co2.length)drawSeries($("co2Chart"),co2,Math.min(...co2)-50,Math.max(...co2)+50,"rgba(114,215,255,.9)");
}
async function refreshOutdoor(){
  try{
    const {latitude:lat,longitude:lon}=window.RWC_CONFIG.weather;
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,apparent_temperature,wind_speed_10m,cloud_cover&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;
    const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error("Open-Meteo hiba");
    const data=await r.json(),code=data.current.weather_code,label=window.RWC_EFFECTS.setWeather(code);
    $("weatherLabel").textContent=label;$("outsideCondition").textContent="🌦 "+label;$("weatherIcon").textContent=weatherIcon(code);
    $("feelsLike").textContent=fmt(data.current.apparent_temperature)+" °C";
    $("windSpeed").textContent=fmt(data.current.wind_speed_10m)+" km/h";
    $("cloudCover").textContent=(data.current.cloud_cover??"--")+"%";
    $("tempMin").textContent=fmt(data.daily.temperature_2m_min[0])+" °C";
    $("tempMax").textContent=fmt(data.daily.temperature_2m_max[0])+" °C";
    $("rainChance").textContent=(data.daily.precipitation_probability_max[0]??"--")+"%";
    $("uvIndex").textContent=fmt(data.daily.uv_index_max[0]);
    $("sunrise").textContent=new Date(data.daily.sunrise[0]).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
    $("sunset").textContent=new Date(data.daily.sunset[0]).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  }catch(e){console.error(e);$("outsideCondition").textContent="Külső időjárás nem elérhető"}
}
async function refreshNetatmo(){
  try{
    const r=await fetch("/api/weather",{cache:"no-store"});
    if(r.status===401){setConnection("waiting","Netatmo engedélyezés szükséges");location.href="/login";return}
    if(!r.ok)throw new Error(await r.text());
    render(await r.json());setConnection("ok","Netatmo élő adatok");
  }catch(e){console.error(e);setConnection("error","Élő adatkapcsolati hiba")}
}
$("radarReload").addEventListener("click",()=>{
  const frame=$("radarFrame"),src=frame.src;frame.src="about:blank";setTimeout(()=>frame.src=src,100);
});
refreshNetatmo();refreshOutdoor();drawCharts();
setInterval(refreshNetatmo,5*60*1000);setInterval(refreshOutdoor,15*60*1000);
window.addEventListener("resize",drawCharts);
