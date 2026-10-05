const $=s=>document.querySelector(s);
const money=n=>'$'+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

function animateLoop(state){
  const nodes=[...document.querySelectorAll('#aiLoop>div')];
  nodes.forEach(x=>x.classList.remove('active'));
  if(!nodes.length)return;
  const phase=Math.floor(Date.now()/5000)%nodes.length;
  nodes[phase].classList.add('active');
  $('#loopState').textContent=(state||'RUNNING')+' • PHASE '+(phase+1)+'/6';
}

async function fetchJson(url,timeout=5000){
  const c=new AbortController();
  const t=setTimeout(()=>c.abort(),timeout);
  try{
    const r=await fetch(url,{cache:'no-store',signal:c.signal});
    if(!r.ok)throw new Error(url+' HTTP '+r.status);
    return await r.json();
  }finally{
    clearTimeout(t);
  }
}

function renderScan(d){
  const risk=Number(d.openRiskPct||0);
  const a=d.account||{};
  const model=d.model||{};
  const mm=model.metrics||{};
  const realized=Number(a.realizedPnL||0);
  const open=Number(a.openPnL||0);

  $('#scannerState').textContent='SCANNER '+(d.scanner?.state||'UNKNOWN')+' • '+(d.scanner?.feed||'');
  $('#marketCount').textContent=Number(d.marketCount||0);
  $('#positionCount').textContent=Number(d.positionCount||0);
  $('#riskNow').textContent=risk.toFixed(2)+'%';
  $('#evalCount').textContent=Number(mm.samples||0);
  $('#netR').textContent=Number(mm.netR||0).toFixed(2)+'R';

  $('#startingEquity').textContent=money(a.startingBalance||0);
  $('#equity').textContent=money(a.equity||0);
  $('#realizedPnl').textContent=(realized>=0?'+':'')+money(realized);
  $('#realizedPnl').className=realized>=0?'good':'bad';
  $('#runningPnl').textContent=(open>=0?'+':'')+money(open);
  $('#runningPnl').className=open>=0?'good':'bad';
  $('#winrate').textContent=Number(mm.winRate||0).toFixed(1)+'%';
  $('#profitFactor').textContent=Number(mm.profitFactor||0).toFixed(2);
  $('#drawdown').textContent=Number(mm.maxDrawdownR||0).toFixed(2)+'R';

  $('#engineState').textContent=d.engine||'AI';
  $('#stamp').textContent=d.ts?new Date(d.ts).toLocaleString():'—';
  $('#modelState').textContent=model.state||'COLLECTING';
  animateLoop(d.scanner?.state);
}

let refreshing=false;
async function refresh(){
  if(refreshing)return;
  refreshing=true;
  try{
    const d=await fetchJson('/api/dashboard',5000);
    renderScan(d);

    fetchJson('/api/bitget/status',4000)
      .then(bg=>{$('#bitgetState').textContent=bg.connected?'BITGET CONNECTED':'BITGET ERROR';})
      .catch(()=>{$('#bitgetState').textContent='BITGET STATUS WAIT';});
  }catch(e){
    $('#scannerState').textContent='SCANNER RETRYING';
  }finally{
    refreshing=false;
  }
}

$('#scan').onclick=refresh;
animateLoop('RUNNING');
refresh();
setInterval(refresh,10000);
setInterval(()=>animateLoop('RUNNING'),5000);