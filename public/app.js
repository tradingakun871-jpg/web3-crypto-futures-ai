function drawGrowth(a){let c=document.querySelector('#growth');if(!c||!a.length)return;let x=c.getContext('2d'),w=c.width=c.clientWidth*devicePixelRatio,h=c.height=180*devicePixelRatio,v=a.map(q=>+q.equity),mn=Math.min(...v),mx=Math.max(...v);x.clearRect(0,0,w,h);x.beginPath();v.forEach((n,i)=>{let px=i/(Math.max(1,v.length-1))*w,py=h-(n-mn)/(Math.max(1,mx-mn))*h*.8-h*.1;i?x.lineTo(px,py):x.moveTo(px,py)});x.strokeStyle='#39d98a';x.lineWidth=2*devicePixelRatio;x.stroke()}const $=s=>document.querySelector(s),fmt=n=>Number(n||0).toLocaleString(undefined,{maximumFractionDigits:5});
async function refresh(){
 try{
  const [sr,jr,br]=await Promise.all([fetch('/api/scan',{cache:'no-store'}),fetch('/api/journal',{cache:'no-store'}),fetch('/api/bitget/status',{cache:'no-store'})]);
  const d=await sr.json(),jd=await jr.json(),bg=await br.json();
  $('#scannerState').textContent='SCANNER '+(d.scanner?.state||'UNKNOWN')+' • '+(d.scanner?.feed||'')+' • 60s';
  $('#bitgetState').textContent=bg.connected?'BITGET CONNECTED • '+(bg.permission||'READ'):'BITGET '+(bg.configured?'ERROR':'NOT CONFIGURED');
  const ac=d.portfolio?.account||{};
  $('#accountCards').innerHTML='<b>START $'+fmt(ac.startingBalance)+'</b><b>BALANCE $'+fmt(ac.balance)+'</b><b>EQUITY $'+fmt(ac.equity)+'</b><b>REALIZED $'+fmt(ac.realizedPnL)+'</b><b>OPEN PNL $'+fmt(ac.openPnL)+'</b><b>RETURN '+Number(ac.returnPct||0).toFixed(2)+'%</b><b>OPEN RISK '+Number(d.portfolio?.openRiskPct||0).toFixed(2)+'%</b>';
  $('#state').textContent=(d.markets||[]).length+' MTF MARKETS';$('#stamp').textContent=d.engine+' • '+new Date(d.ts).toLocaleString();
  $('#rows').innerHTML=(d.markets||[]).map(x=>'<tr><td><b>'+x.symbol+'</b></td><td>'+fmt(x.price)+'</td><td>'+Number(x.change).toFixed(2)+'%</td><td><b>'+x.bias+'</b></td><td>'+x.setup+'</td><td>'+x.tf+' ('+x.align+')</td><td>'+x.score+'/100</td><td>'+x.status+'<br><small>E '+fmt(x.entry)+' | SL '+fmt(x.sl)+' | TP1 '+fmt(x.tp1)+' | TP2 '+fmt(x.tp2)+'</small></td></tr>').join('');
  $('#positions').innerHTML=(d.portfolio?.positions||[]).map(p=>'<tr><td><b>'+p.symbol+'</b></td><td>'+p.side+'</td><td>'+p.tf+'</td><td>'+fmt(p.entry)+'</td><td>'+fmt(p.sl)+'</td><td>'+fmt(p.tp1)+' / '+fmt(p.tp2)+'</td><td>'+p.status+' • '+p.action+'</td></tr>').join('')||'<tr><td colspan="7">No paper positions.</td></tr>';
  const z=jd.analytics;if(z)$('#analytics').innerHTML='<b>TRADES '+z.trades+'</b><b>WINRATE '+z.winrate+'%</b><b>TP1 '+z.tp1+'</b><b>TP2 '+z.tp2+'</b><b>SL '+z.sl+'</b><b>NET R '+z.netR+'</b>';
 }catch(e){$('#scannerState').textContent='SCANNER ERROR'}
}
$('#scan').onclick=refresh;refresh();setInterval(refresh,60000);
