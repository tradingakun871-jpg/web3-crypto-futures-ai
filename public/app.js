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

async function refresh(){
  try{
    const [sr,jr,br]=await Promise.all([
      fetch('/api/scan',{cache:'no-store'}),
      fetch('/api/journal',{cache:'no-store'}),
      fetch('/api/bitget/status',{cache:'no-store'})
    ]);
    const d=await sr.json();
    const jd=await jr.json();
    const bg=await br.json();

    const mk=d.markets||[];
    const pos=d.portfolio?.positions||[];
    const risk=Number(d.portfolio?.openRiskPct||0);
    const a=d.portfolio?.account||{};
    const z=jd.analytics||{};
    const mm=d.portfolio?.model?.metrics||{};
    const realized=Number(a.realizedPnL||0);
    const open=Number(a.openPnL||0);
    const pnl=realized+open;

    $('#scannerState').textContent='SCANNER '+(d.scanner?.state||'UNKNOWN')+' • '+(d.scanner?.feed||'');
    $('#bitgetState').textContent=bg.connected?'BITGET CONNECTED':'BITGET ERROR';
    $('#marketCount').textContent=mk.length;
    $('#positionCount').textContent=pos.length;
    $('#riskNow').textContent=risk.toFixed(2)+'%';
    $('#evalCount').textContent=z.trades||0;
    $('#netR').textContent=Number(z.netR||0).toFixed(2)+'R';

    $('#startingEquity').textContent=money(a.startingBalance||0);
    $('#equity').textContent=money(a.equity||0);
    $('#realizedPnl').textContent=(realized>=0?'+':'')+money(realized);
    $('#realizedPnl').className=realized>=0?'good':'bad';
    $('#runningPnl').textContent=(open>=0?'+':'')+money(open);
    $('#runningPnl').className=open>=0?'good':'bad';
    $('#winrate').textContent=Number(mm.winRate??z.winrate??0).toFixed(1)+'%';
    $('#profitFactor').textContent=Number(mm.profitFactor??0).toFixed(2);
    $('#drawdown').textContent=Number(mm.maxDrawdownR??0).toFixed(2)+'R';

    $('#engineState').textContent=d.engine||'AI';
    $('#stamp').textContent=d.ts?new Date(d.ts).toLocaleString():'—';
    $('#modelState').textContent=d.portfolio?.model?.state||'COLLECTING';
    animateLoop(d.scanner?.state);
  }catch(e){
    $('#scannerState').textContent='SCANNER ERROR';
  }
}

$('#scan').onclick=refresh;
refresh();
setInterval(refresh,10000);
setInterval(()=>animateLoop('RUNNING'),5000);