const $ = id => document.getElementById(id);
const fmt = n => (n === null || n === undefined) ? "--" : Number(n).toLocaleString("hu-HU", {maximumFractionDigits:1});

function updateClock(){
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  $("date").textContent = now.toLocaleDateString("hu-HU",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
}
updateClock(); setInterval(updateClock,1000);

function setConnection(type, text){
  $("connection").className = "status " + type;
  $("connection").textContent = "● " + text;
}

function render(d){
  $("outTemp").textContent = fmt(d.outdoorTemperature);
  $("inTemp").textContent = fmt(d.indoorTemperature);
  $("co2").textContent = d.co2 ?? "--";
  $("inHum").textContent = (d.indoorHumidity ?? "--") + "%";
  $("outHum").textContent = (d.outdoorHumidity ?? "--") + "%";
  $("pressure").textContent = (d.pressure ?? "--") + " mbar";
  $("feelsLike").textContent = fmt(d.feelsLike ?? d.outdoorTemperature) + " °C";
  $("updated").textContent = new Date().toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  applyAdvice(d);
}

function applyAdvice(d){
  const co2 = Number(d.co2 || 0), inside = Number(d.indoorTemperature), outside = Number(d.outdoorTemperature);
  const badge = $("co2Badge"), text = $("co2Text"), vent = document.querySelector(".vent");
  const msg = $("ventMessage"), reason = $("ventReason");

  if(co2 >= 1500){
    badge.style.background="#3a1519"; badge.style.color="var(--bad)";
    text.textContent="Nagyon magas CO₂"; vent.style.background="linear-gradient(145deg,#351015,#17090b)";
    vent.style.borderColor="#64212a"; msg.style.color="var(--bad)";
    msg.textContent="! AZONNAL SZELLŐZTESS"; reason.textContent="A beltéri CO₂-szint túl magas.";
  } else if(co2 >= 1000){
    badge.style.background="#35270e"; badge.style.color="var(--warn)";
    text.textContent="Szellőztetés ajánlott"; vent.style.background="linear-gradient(145deg,#30230d,#161006)";
    msg.style.color="var(--warn)"; msg.textContent="NYISS ABLAKOT 5–10 PERCRE";
    reason.textContent="A beltéri CO₂-szint emelkedett.";
  } else {
    badge.style.background="#183024"; badge.style.color="var(--good)"; text.textContent="Jó levegő";
    vent.style.background="linear-gradient(145deg,#0f251a,#0b1510)"; vent.style.borderColor="#1c4a30";
    msg.style.color="var(--good)";
    if(Number.isFinite(inside) && Number.isFinite(outside) && outside < inside - 0.5){
      msg.textContent="✓ MOST ÉRDEMES SZELLŐZTETNI"; reason.textContent="Kint hűvösebb van, mint bent.";
    } else {
      msg.textContent="A LEVEGŐ RENDBEN VAN"; reason.textContent="A CO₂-szint megfelelő.";
    }
  }
}

async function refresh(){
  const base = (window.RWC_CONFIG?.apiBaseUrl || "").replace(/\/$/,"");
  if(!base){
    setConnection("waiting","A Worker címe még nincs beállítva");
    render({outdoorTemperature:24.5,indoorTemperature:29.7,co2:955,indoorHumidity:45,outdoorHumidity:55,pressure:919,feelsLike:28});
    return;
  }
  try{
    const r = await fetch(base + "/api/weather", {cache:"no-store"});
    if(r.status === 401){ setConnection("waiting","Netatmo engedélyezés szükséges"); location.href = base + "/login"; return; }
    if(!r.ok) throw new Error("HTTP " + r.status);
    render(await r.json()); setConnection("ok","Netatmo csatlakoztatva");
  }catch(e){ console.error(e); setConnection("error","Kapcsolati hiba"); }
}
refresh(); setInterval(refresh, 5*60*1000);
