window.RWC_EFFECTS = {
  setWeather(code) {
    let cls = "weather-partly", label = "Változó";
    if (code === 0) [cls,label] = ["weather-clear","Derült"];
    else if ([1,2].includes(code)) [cls,label] = ["weather-partly","Részben felhős"];
    else if (code === 3) [cls,label] = ["weather-cloudy","Borult"];
    else if ([45,48].includes(code)) [cls,label] = ["weather-fog","Ködös"];
    else if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) [cls,label] = ["weather-rain","Esős"];
    else if ([71,73,75,77,85,86].includes(code)) [cls,label] = ["weather-snow","Havas"];
    else if ([95,96,99].includes(code)) [cls,label] = ["weather-storm","Viharos"];
    document.body.classList.remove("weather-clear","weather-partly","weather-cloudy","weather-fog","weather-rain","weather-snow","weather-storm");
    document.body.classList.add(cls);
    return label;
  }
};