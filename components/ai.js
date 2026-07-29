window.RWC_AI = {
  advice(netatmo,outdoor){
    if(!netatmo)return"Az adatok betöltése folyamatban van.";
    const co2=Number(netatmo.co2||0),inside=Number(netatmo.indoorTemperature),outside=Number(netatmo.outdoorTemperature);
    const rain=outdoor?.daily?.precipitation_probability_max?.[0]||0;
    const uv=outdoor?.daily?.uv_index_max?.[0]||0;
    if(co2>=1500)return"Azonnal szellőztess: a CO₂-szint túl magas.";
    if(co2>=1000)return"Nyiss ablakot 5–10 percre, mert a beltéri levegő romlik.";
    if(rain>=70)return"Magas a csapadék esélye, érdemes esernyőt vinni.";
    if(uv>=6)return"Az UV-index magas, hosszabb kinti tartózkodásnál védekezz.";
    if(Number.isFinite(inside)&&Number.isFinite(outside)&&outside<inside-1)return"Most ideális az idő a lakás lehűtésére és szellőztetésére.";
    return"A levegő és az időjárási körülmények jelenleg rendben vannak.";
  }
};
