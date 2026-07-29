window.RWC_CHARTS = {
  current:"temperature",
  outdoorHourly:[],
  mount(){
    document.getElementById("trendPanel").innerHTML=`
      <div class="panel-title">24 ÓRÁS TREND</div>
      <div class="tabs">
        <button class="active" data-chart="temperature">HŐMÉRSÉKLET</button>
        <button data-chart="co2">CO₂</button>
        <button data-chart="pressure">LÉGNYOMÁS</button>
        <button data-chart="humidity">PÁRATARTALOM</button>
      </div>
      <div class="chart-box"><canvas id="trendChart"></canvas></div>
      <div class="chart-legend"><span><i class="outdoor-line"></i>Kültéri hőmérséklet</span><span><i class="indoor-line"></i>Beltéri hőmérséklet</span></div>`;
    document.querySelectorAll(".tabs button").forEach(btn=>{
      btn.addEventListener("click",()=>{
        document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        this.current=btn.dataset.chart;
        this.draw();
      });
    });
  },
  save(d){
    const key="rwcHistoryV6",now=Date.now(),arr=JSON.parse(localStorage.getItem(key)||"[]");
    arr.push({t:now,i:+d.indoorTemperature,o:+d.outdoorTemperature,c:+d.co2,p:+d.pressure,h:+d.indoorHumidity});
    localStorage.setItem(key,JSON.stringify(arr.filter(x=>x.t>=now-86400000).slice(-480)));
  },
  setOutdoorHourly(values){
    this.outdoorHourly=Array.isArray(values)?values.filter(Number.isFinite):[];
    this.draw();
  },
  draw(){
    const canvas=document.getElementById("trendChart"); if(!canvas)return;
    const arr=JSON.parse(localStorage.getItem("rwcHistoryV6")||"[]");
    const ctx=canvas.getContext("2d"),w=canvas.clientWidth,h=canvas.clientHeight,dpr=devicePixelRatio||1;
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
    if(arr.length<2)return;
    let series;
    if(this.current==="temperature"){
      const indoor=arr.map(x=>x.i).filter(Number.isFinite);
      series=[
        {values:this.outdoorHourly.length?this.outdoorHourly:arr.map(x=>x.o).filter(Number.isFinite),c:"#ff8a20"},
        {values:indoor,c:"#149dff"}
      ];
    }else if(this.current==="co2"){
      series=[{values:arr.map(x=>x.c).filter(Number.isFinite),c:"#28df82"}];
    }else if(this.current==="pressure"){
      series=[{values:arr.map(x=>x.p).filter(Number.isFinite),c:"#b175ff"}];
    }else{
      series=[{values:arr.map(x=>x.h).filter(Number.isFinite),c:"#22b8ff"}];
    }
    const vals=series.flatMap(s=>s.values);
    if(vals.length<2)return;
    const min=Math.min(...vals),max=Math.max(...vals);
    ctx.strokeStyle="rgba(255,255,255,.08)";ctx.lineWidth=1;
    for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,h*i/4);ctx.lineTo(w,h*i/4);ctx.stroke()}
    series.forEach(s=>{
      if(s.values.length<2)return;
      ctx.strokeStyle=s.c;ctx.lineWidth=2.6;ctx.beginPath();
      s.values.forEach((v,i)=>{
        const px=i/(s.values.length-1)*w,py=h-((v-min)/(max-min||1))*h*.78-h*.1;
        i?ctx.lineTo(px,py):ctx.moveTo(px,py)
      });
      ctx.stroke();
      ctx.globalAlpha=.12;
      ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
      ctx.fillStyle=s.c;ctx.fill();
      ctx.globalAlpha=1;
    });
  }
};
