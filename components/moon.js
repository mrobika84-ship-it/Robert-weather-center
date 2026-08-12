(()=>{
  const SYNODIC_MONTH=29.53058867;
  const KNOWN_NEW_MOON=new Date('2000-01-06T18:14:00Z');

  function phaseData(date=new Date()){
    const days=(date-KNOWN_NEW_MOON)/86400000;
    const phase=((days%SYNODIC_MONTH)+SYNODIC_MONTH)%SYNODIC_MONTH/SYNODIC_MONTH;
    const illumination=(1-Math.cos(2*Math.PI*phase))/2;
    const pct=Math.round(illumination*100);
    let name='';
    let icon='🌑';
    if(phase<0.03||phase>=0.97){name='Újhold';icon='🌑'}
    else if(phase<0.22){name='Növő sarló';icon='🌒'}
    else if(phase<0.28){name='Első negyed';icon='🌓'}
    else if(phase<0.47){name='Növő hold';icon='🌔'}
    else if(phase<0.53){name='Telihold';icon='🌕'}
    else if(phase<0.72){name='Fogyó hold';icon='🌖'}
    else if(phase<0.78){name='Utolsó negyed';icon='🌗'}
    else {name='Fogyó sarló';icon='🌘'}
    return {name,icon,pct};
  }

  function renderMoon(){
    const d=phaseData();
    const label=document.getElementById('moonPhase');
    const icon=document.getElementById('moonPhaseIcon');
    if(label) label.textContent=`${d.name} · ${d.pct}%`;
    if(icon) icon.textContent=d.icon;
  }

  window.RWC_MOON={phaseData,renderMoon};
  renderMoon();
  setInterval(renderMoon,60000);
})();
