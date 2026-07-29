const $=id=>document.getElementById(id);
const fmt=n=>(n===null||n===undefined)?"--":Number(n).toLocaleString("hu-HU",{maximumFractionDigits:1});
const startedAt=Date.now();
let refreshDeadline=Date.now()+180000;
let latestNetatmo=null;
let latestOutdoor=null;

RWC_WIDGETS.mountHeader();
RWC_WIDGETS.mountFooter();
RWC_OUTDOOR.mount();
RWC_INDOOR.mount();
RWC_CHARTS.mount();
RWC_FORECAST.mount();
RWC_RADAR.mount();
RWC_ALERTS.mount();

function moonPhaseName(date=new Date()){
  const syn=29.53058867,known=new Date("2000-01-06T18:14:00Z"),days=(date-known)/86400000,p=((days%syn)+syn)%syn/syn;
  if(p<.03||p>.97)return"Újhold";if(p<.22)return"Növő sarló";if(p<.28)return"Első negyed";if(p<.47)return"Növő hold";
  if(p<.53)return"Telihold";if(p<.72)return"Fogyó hold";if(p<.78)return"Utolsó negyed";return"Fogyó sarló";
}
$("moonPhase").textContent=moonPhaseName();

function updateClock(){
  const now=new Date();
  $("clock").textContent=now.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  $("date").textContent=now.toLocaleDateString("hu-HU",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
  const remain=Math.max(0,refreshDeadline-Date.now());
  $("nextRefresh").textContent="Következő frissítés: "+Math.floor(remain/60000)+":"+String(Math.floor(remain%60000/1000)).padStart(2,"0");
  const up=Date.now()-startedAt;
  $("uptime").textContent=Math.floor(up/86400000)+" nap "+Math.floor(up%86400000/3600000)+" óra "+Math.floor(up%3600000/60000)+" perc";
  const h=now.getHours();document.body.classList.remove("time-day","time-sunset","time-night");
  document.body.classList.add(h>=7&&h<18?"time-day":h>=18&&h<21?"time-sunset":"time-night");
}
updateClock();setInterval(updateClock,1000);

function setConnection(type,text){$("connection").className="status "+type;$("connection").textContent="● "+text}
function dewPoint(t,rh){if(!Number.isFinite(t)||!Number.isFinite(rh))return null;const a=17.62,b=243.12,g=Math.log(rh/100)+(a*t)/(b+t);return(b*g)/(a-g)}
function absHumidity(t,rh){if(!Number.isFinite(t)||!Number.isFinite(rh))return null;const es=6.112*Math.exp((17.67*t)/(t+243.5));return 2.1674*(rh*es)/(273.15+t)}
function comfortLabel(t,rh,co2){if(co2>1500||rh>70||t>27)return"Gyenge";if(co2>1000||rh<35||rh>65||t<19||t>25)return"Közepes";return"Jó"}
function uvLabel(v){if(v>=8)return"Nagyon magas";if(v>=6)return"Magas";if(v>=3)return"Közepes";return"Alacsony"}
function windDir(deg){const dirs=["É","ÉK","K","DK","D","DNy","Ny","ÉNy"];return dirs[Math.round((deg||0)/45)%8]}
function weatherIcon(code){if(code===0)return"☀️";if([1,2].includes(code))return"🌤️";if(code===3)return"☁️";if([45,48].includes(code))return"🌫️";if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return"🌧️";if([71,73,75,77,85,86].includes(code))return"❄️";if([95,96,99].includes(code))return"⛈️";return"🌦️"}

function renderNetatmo(d){
  latestNetatmo=d;
  $("outTemp").textContent=fmt(d.outdoorTemperature);$("inTemp").textContent=fmt(d.indoorTemperature);$("co2").textContent=d.co2??"--";
  $("inHum").textContent=(d.indoorHumidity??"--")+"%";$("pressure").textContent=fmt(d.pressure)+" mbar";$("battery").textContent=(d.outdoorBatteryPercent??"--")+"%";
  $("humidityBar").style.width=Math.min(100,Math.max(0,Number(d.indoorHumidity)||0))+"%";
  $("dewPoint").textContent=fmt(dewPoint(Number(d.indoorTemperature),Number(d.indoorHumidity)))+" °C";
  $("absoluteHumidity").textContent=fmt(absHumidity(Number(d.indoorTemperature),Number(d.indoorHumidity)))+" g/m³";
  const comfort=comfortLabel(Number(d.indoorTemperature),Number(d.indoorHumidity),Number(d.co2));$("comfortIndex").textContent=comfort;$("comfortText").textContent="● "+(comfort==="Jó"?"Kellemes hőmérséklet":"Figyelmet igényel");
  const updated=d.updatedAt?new Date(d.updatedAt*1000):new Date(),t=updated.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  $("updated").textContent=t;$("updatedTop").textContent="Frissítve: "+t;
  RWC_CHARTS.save(d);RWC_CHARTS.draw();updateAdvice();
}
function updateAdvice(){
  if(!latestNetatmo)return;
  const d=latestNetatmo,co2=Number(d.co2||0),inside=Number(d.indoorTemperature),outside=Number(d.outdoorTemperature);
  let vent="A levegő rendben van";
  if(co2>=1500)vent="Azonnal szellőztess";else if(co2>=1000)vent="Szellőztess 5–10 percig";else if(Number.isFinite(inside)&&Number.isFinite(outside)&&outside<inside-.5)vent="Ideális szellőztetés";
  $("ventRecommendation").textContent=vent;
  $("co2Text").textContent=co2<1000?"● Jó levegő":co2<1500?"● Szellőztetés ajánlott":"● Magas CO₂";
  $("alertAirTitle").textContent=co2<1000?"A levegő minősége jó":"Levegőminőség romlik";
  $("alertAirText").textContent=co2<1000?"CO₂ szint rendben":co2+" ppm";
  $("alertVentTitle").textContent=vent;$("alertVentText").textContent=RWC_AI.advice(latestNetatmo,latestOutdoor);
  $("alertBatteryText").textContent="Elem töltöttség: "+(d.outdoorBatteryPercent??"--")+"%";
}
async function refreshOutdoor(){
  try{
    const {latitude:lat,longitude:lon}=window.RWC_CONFIG.weather;
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,apparent_temperature,wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,visibility&daily=weather_code,sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;
    const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error("Open-Meteo hiba");const data=await r.json();latestOutdoor=data;
    const code=data.current.weather_code,label=window.RWC_EFFECTS.setWeather(code),icon=weatherIcon(code);
    $("weatherIcon").textContent=icon;$("headerWeatherIcon").textContent=icon;$("weatherLabel").textContent=label;$("headerCondition").textContent=label;
    $("feelsLike").textContent=fmt(data.current.apparent_temperature)+" °C";$("windSpeed").textContent=fmt(data.current.wind_speed_10m)+" km/h";$("windGust").textContent=fmt(data.current.wind_gusts_10m)+" km/h";$("windDirection").textContent=windDir(data.current.wind_direction_10m);
    $("cloudCover").textContent=(data.current.cloud_cover??"--")+"%";$("visibility").textContent=fmt((data.current.visibility||0)/1000)+" km";$("airQuality").textContent="Jó";
    $("tempMin").textContent=fmt(data.daily.temperature_2m_min[0])+"°";$("tempMax").textContent=fmt(data.daily.temperature_2m_max[0])+"°";
    $("rainChance").textContent=(data.daily.precipitation_probability_max[0]??"--")+"%";$("uvIndex").textContent=fmt(data.daily.uv_index_max[0]);$("uvText").textContent=uvLabel(data.daily.uv_index_max[0]);
    $("sunrise").textContent=new Date(data.daily.sunrise[0]).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});$("sunset").textContent=new Date(data.daily.sunset[0]).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
    $("brightness").textContent=Math.round(Math.max(20,100-(data.current.cloud_cover||0)*.7))+"%";
    $("alertRainTitle").textContent=(data.daily.precipitation_probability_max[1]||0)>=50?"Eső valószínű":"Csapadék esélye alacsony";$("alertRainText").textContent=(data.daily.precipitation_probability_max[1]||0)+"% esély holnap";
    $("alertUvTitle").textContent=(data.daily.uv_index_max[0]||0)>=6?"Erős UV sugárzás":"UV-index megfelelő";$("alertUvText").textContent=uvLabel(data.daily.uv_index_max[0]);
    $("alertNightTitle").textContent="Éjszaka hűvös lesz";$("alertNightText").textContent="Min. hőmérséklet: "+fmt(data.daily.temperature_2m_min[0])+"°C";
    RWC_FORECAST.render(data,weatherIcon,fmt);updateAdvice();
  }catch(e){console.error(e)}
}
async function refreshNetatmo(){
  try{
    const r=await fetch("/api/weather",{cache:"no-store"});
    if(r.status===401){location.href="/login";return}
    if(!r.ok)throw new Error(await r.text());
    renderNetatmo(await r.json());setConnection("ok","Netatmo élő adatok");refreshDeadline=Date.now()+180000
  }catch(e){console.error(e);setConnection("error","Adatkapcsolati hiba")}
}

refreshNetatmo();refreshOutdoor();RWC_CHARTS.draw();
setInterval(()=>{refreshNetatmo();refreshOutdoor()},180000);
window.addEventListener("resize",()=>RWC_CHARTS.draw());
