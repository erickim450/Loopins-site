/* Loopins 5.3 — Galáxia de IAs.
 * Visualização em canvas do catálogo real: cada estrela é uma ferramenta, agrupada pela área
 * em que tem mais competências confirmadas. Quando há um pedido, a galáxia mostra a filtragem
 * do recomendador: descartadas se apagam, elegíveis se aproximam e as 3 recomendadas orbitam o pedido.
 * Respeita "reduzir movimento", pausa fora da tela e não é a única forma de ver a informação
 * (os resultados em texto continuam abaixo). */
(function(){
'use strict';
const E=window.NexusEngine;
if(!E)return;
const ORDER=['code','image','video','audio','study','text','presentation','design','automation','data','agents'];
const COLORS={code:'#8b7cff',image:'#ff6fae',video:'#ff9f43',audio:'#2ec4b6',study:'#4dabf7',text:'#9bd36a',presentation:'#ffc94d',design:'#e879f9',automation:'#20c997',data:'#74c0fc',agents:'#b197fc'};
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

// Área principal de cada ferramenta: família com mais competências confirmadas (mesmas regras do recomendador).
const capFamily={};
for(const spec of Object.values(E.subtasks)){
  if(!ORDER.includes(spec.family))continue;
  const top=Object.entries(spec.weights).sort((a,b)=>b[1]-a[1])[0];
  if(top&&!capFamily[top[0]])capFamily[top[0]]=spec.family;
}
function familyOf(tool){
  const count={};
  for(const [k,c] of Object.entries(tool.capabilities||{}))if(c.status==='supported'&&capFamily[k])count[capFamily[k]]=(count[capFamily[k]]||0)+1;
  // Assistentes gerais (3+ áreas e escrita de texto) ficam juntos em "Textos".
  if(Object.keys(count).length>=3&&tool.capabilities?.text?.status==='supported')return 'text';
  const best=ORDER.filter(f=>count[f]).sort((a,b)=>count[b]-count[a]||ORDER.indexOf(a)-ORDER.indexOf(b))[0];
  return best||'text';
}
const families=()=>ORDER.filter(f=>E.tools.some(t=>familyOf(t)===f));

function create(canvas,options={}){
  const ctx=canvas.getContext&&canvas.getContext('2d');
  if(!ctx)return {setResult(){},setFilter(){},destroy(){},nodes:[]};
  const fams=families();
  const nodes=E.tools.map((t,i)=>{const f=familyOf(t);return {id:t.id,name:t.name,family:f,color:COLORS[f]||'#aaa',seed:(i*137.508)%360,ring:i%3,x:0,y:0,alpha:1,size:1,mode:'idle',rank:0,init:false};});
  const byFamily={};for(const n of nodes)(byFamily[n.family]=byFamily[n.family]||[]).push(n);
  let w=0,h=0,dpr=1,raf=0,last=0,time=0,hover=null,result=null,filter=null,destroyed=false,coreLabel='',coreAlpha=0;
  const onRanks=options.onCounts||(()=>{});

  function resize(){
    const r=canvas.getBoundingClientRect();
    dpr=Math.min(2,window.devicePixelRatio||1);w=Math.max(1,r.width);h=Math.max(1,r.height);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    HUD=w<600?86:58;
  }
  // Área útil abaixo do contador (HUD) no topo.
  let HUD=58;const cyOf=()=>HUD+(h-HUD)/2;
  function clusterCenter(f){
    const i=fams.indexOf(f),a=-Math.PI/2+i/fams.length*Math.PI*2;
    const rx=w*(w<600?0.36:0.40),ry=(h-HUD)*0.34;
    return {x:w/2+Math.cos(a)*rx,y:cyOf()+Math.sin(a)*ry};
  }
  function home(n,t){
    const c=clusterCenter(n.family),list=byFamily[n.family],k=list.indexOf(n);
    const scale=Math.min(w,h)/420;
    const radius=(10+(k%4)*9+Math.floor(k/4)*5)*Math.max(.7,scale);
    const speed=reducedMotion()?0:0.00006*(1+n.ring*.4);
    const a=n.seed*Math.PI/180+t*speed*(k%2?1:-1);
    return {x:c.x+Math.cos(a)*radius,y:c.y+Math.sin(a)*radius*.8};
  }
  function target(n,t){
    const hm=home(n,t),cx=w/2,cy=cyOf();
    if(n.mode==='top'){
      // 1º acima do pedido, 2º à esquerda e 3º à direita, todos na metade de cima (rótulo do pedido fica embaixo).
      const ang=[-90,-155,-25][n.rank-1]*Math.PI/180,r=Math.min(w,h-HUD)*0.30,bob=reducedMotion()?0:Math.sin(t/900+n.rank)*3;
      return {x:cx+Math.cos(ang)*r*(w<600?1.15:1.6),y:cy+Math.sin(ang)*r+bob};
    }
    if(n.mode==='eligible')return {x:hm.x+(cx-hm.x)*0.42,y:hm.y+(cy-hm.y)*0.42};
    if(n.mode==='dim')return {x:cx+(hm.x-cx)*1.08,y:cy+(hm.y-cy)*1.08};
    return hm;
  }
  function apply(){
    const items=result?.items||[],eligible=new Set((result?.eligible||[]).map(t=>t.id));
    for(const n of nodes){
      const rank=items.findIndex(t=>t.id===n.id)+1;
      n.rank=rank;n.mode=!result?'idle':rank?'top':eligible.has(n.id)?'eligible':'dim';
      if(filter&&n.family!==filter&&n.mode!=='top')n.mode='dim';
    }
    coreLabel=result?.intent?.deliverable||'';
    onRanks(result?{total:nodes.length,eligible:eligible.size,top:items.length,label:coreLabel}:null);
  }
  function draw(dt){
    ctx.clearRect(0,0,w,h);
    const light=document.documentElement.dataset.theme==='light';
    const ease=reducedMotion()?1:1-Math.exp(-dt/220);
    coreAlpha+=((result?1:0)-coreAlpha)*ease;
    // Rótulos das áreas (só no estado inicial ou com filtro).
    ctx.font='600 11px "DM Sans",system-ui,sans-serif';ctx.textAlign='center';
    for(const f of fams){
      const c=clusterCenter(f),a=(1-coreAlpha)*(filter&&filter!==f?.25:.75);
      if(a<.03)continue;
      ctx.fillStyle=light?'rgba(30,35,60,'+a+')':'rgba(220,226,255,'+a+')';
      const label=E.categories[f]?.label||f,ly=c.y+(c.y<cyOf()?-Math.min(w,h)*0.11:Math.min(w,h)*0.13);
      ctx.fillText(label.toUpperCase(),c.x,Math.max(HUD+6,Math.min(h-8,ly)));
    }
    // Núcleo do pedido.
    const cx=w/2,cy=cyOf();
    if(coreAlpha>.02){
      const pulse=reducedMotion()?1:1+Math.sin(time/450)*.08,r=Math.min(w,h)*0.055*pulse;
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r*3);
      g.addColorStop(0,'rgba(164,155,255,'+(.55*coreAlpha)+')');g.addColorStop(1,'rgba(164,155,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r*3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,'+(.95*coreAlpha)+')';ctx.beginPath();ctx.arc(cx,cy,r*.45,0,Math.PI*2);ctx.fill();
    }
    // Linhas do pedido até elegíveis e recomendadas.
    for(const n of nodes){
      if(!result||n.mode==='dim'||n.mode==='idle')continue;
      const top=n.mode==='top';
      ctx.strokeStyle=top?hexA(n.color,.75*coreAlpha):hexA(n.color,.16*coreAlpha);
      ctx.lineWidth=top?2:1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(n.x,n.y);ctx.stroke();
    }
    // Estrelas.
    for(const n of nodes){
      const t=target(n,time);
      if(!n.init){n.x=t.x;n.y=t.y;n.init=true;}
      n.x+=(t.x-n.x)*ease;n.y+=(t.y-n.y)*ease;
      const wantAlpha=n.mode==='dim'?.13:1,wantSize=n.mode==='top'?2.6:n.mode==='eligible'?1.35:1;
      n.alpha+=(wantAlpha-n.alpha)*ease;n.size+=(wantSize-n.size)*ease;
      const twinkle=reducedMotion()?1:.85+.15*Math.sin(time/700+n.seed);
      const r=3.2*n.size*twinkle*(hover===n?1.5:1);
      const glow=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4);
      glow.addColorStop(0,hexA(n.color,.5*n.alpha));glow.addColorStop(1,hexA(n.color,0));
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(n.x,n.y,r*4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=hexA(n.color,n.alpha);ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.fill();
    }
    // Rótulos das recomendadas e da estrela sob o cursor.
    ctx.font='700 13px "DM Sans",system-ui,sans-serif';
    for(const n of nodes){
      if(n.mode!=='top'&&hover!==n&&!(options.labels&&n.mode==='eligible'))continue;
      const text=(n.mode==='top'?n.rank+'º · ':'')+n.name;
      const tw=ctx.measureText(text).width+16,tx=Math.min(w-tw/2-4,Math.max(tw/2+4,n.x)),ty=n.y-14*n.size-8;
      ctx.fillStyle=light?'rgba(255,255,255,.92)':'rgba(12,15,27,.85)';roundRect(ctx,tx-tw/2,ty-15,tw,22,11);ctx.fill();
      ctx.strokeStyle=hexA(n.color,.9);ctx.lineWidth=1;roundRect(ctx,tx-tw/2,ty-15,tw,22,11);ctx.stroke();
      ctx.fillStyle=light?'#171a2b':'#fff';ctx.textAlign='center';ctx.fillText(text,tx,ty);
    }
    if(coreAlpha>.5&&coreLabel){
      ctx.font='700 12px "DM Sans",system-ui,sans-serif';ctx.fillStyle=light?'rgba(23,26,43,'+coreAlpha+')':'rgba(255,255,255,'+coreAlpha+')';
      ctx.textAlign='center';ctx.fillText(coreLabel.length>34?coreLabel.slice(0,33)+'…':coreLabel,cx,cy+Math.min(w,h)*0.055+22);
    }
  }
  function frame(now){
    if(destroyed)return;
    if(!canvas.isConnected){destroy();return;}
    const dt=last?Math.min(64,now-last):16;last=now;time=now;
    if(!document.hidden)draw(dt);
    raf=requestAnimationFrame(frame);
  }
  function hit(ev){
    const r=canvas.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top;
    let best=null,bd=18*18;
    for(const n of nodes){if(n.alpha<.3)continue;const d=(n.x-x)**2+(n.y-y)**2;if(d<bd){bd=d;best=n;}}
    return best;
  }
  const onMove=ev=>{hover=hit(ev);canvas.style.cursor=hover?'pointer':'default';canvas.title=hover?hover.name+' — clique para ver detalhes':'';};
  const onLeave=()=>{hover=null;};
  const onClick=ev=>{const n=hit(ev);if(n&&window.NexusApp)window.NexusApp.openPanel(n.id);};
  canvas.addEventListener('mousemove',onMove);canvas.addEventListener('mouseleave',onLeave);canvas.addEventListener('click',onClick);
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;ro?.observe(canvas);
  resize();raf=requestAnimationFrame(frame);
  function destroy(){destroyed=true;cancelAnimationFrame(raf);ro?.disconnect();canvas.removeEventListener('mousemove',onMove);canvas.removeEventListener('mouseleave',onLeave);canvas.removeEventListener('click',onClick);}
  return {
    nodes,
    setResult(data){result=data&&data.items?data:null;apply();},
    setFilter(f){filter=f||null;apply();},
    destroy
  };
}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+Math.max(0,Math.min(1,a)).toFixed(3)+')';}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

/* HUD com contagem animada (texto real, lido por leitores de tela). */
function countTo(el,value){
  if(!el)return;const from=Number(el.dataset.v||0);el.dataset.v=value;
  if(reducedMotion()||from===value){el.textContent=value;return;}
  const start=performance.now(),dur=700;
  const step=now=>{const k=Math.min(1,(now-start)/dur),v=Math.round(from+(value-from)*(1-Math.pow(1-k,3)));el.textContent=v;if(k<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);
}
function hudUpdate(prefix,c){
  const $=id=>document.getElementById(id);
  const box=$(prefix+'Hud');if(!box)return;
  if(!c){box.dataset.state='idle';countTo($(prefix+'Total'),E.tools.length);countTo($(prefix+'Eligible'),E.tools.length);countTo($(prefix+'Top'),0);$(prefix+'Label').textContent='Digite um pedido e veja o Loopins filtrar as IAs';return;}
  box.dataset.state='result';countTo($(prefix+'Total'),c.total);countTo($(prefix+'Eligible'),c.eligible);countTo($(prefix+'Top'),c.top);
  $(prefix+'Label').textContent=c.top?'Objetivo: '+c.label:'Nenhuma IA tem todas as competências exigidas confirmadas';
}

/* Galáxia da página inicial. */
let hero=null;
function initStats(){
  const box=document.getElementById('heroStats');if(!box)return;
  const sources=new Set();for(const t of E.tools)for(const c of Object.values(t.capabilities||{}))if(c.status==='supported'&&c.source)sources.add(c.source);
  const values={tools:E.tools.length,tasks:Object.keys(E.subtasks).length-1,sources:sources.size};
  box.querySelectorAll('[data-count]').forEach((el,i)=>setTimeout(()=>countTo(el,values[el.dataset.count]),reducedMotion()?0:200+i*180));
}
function initHero(){
  initStats();
  const canvas=document.getElementById('galaxyHero');if(!canvas)return;
  const make=window.NexusGalaxy3D?.create||create;
  hero=make(canvas,{scale:0.32,onCounts:c=>hudUpdate('galaxy',c)});
  hudUpdate('galaxy',null);
}
/* Tela "Galáxia de IAs". */
let view=null;
function showView(){
  const ws=document.getElementById('workspace');if(!ws)return;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fams=families();
  ws.innerHTML='<div class="workspace-heading"><span class="section-kicker">GALÁXIA DE IAS</span><h1 tabindex="-1">'+E.tools.length+' ferramentas, uma galáxia</h1><p>Cada estrela é uma ferramenta do catálogo, agrupada pela área em que tem mais competências confirmadas. Arraste para girar o universo, role para aproximar, digite um pedido para ver o Loopins filtrar ao vivo e clique numa estrela para ver detalhes.</p></div>'+
  '<div class="ws-block galaxy-view-block"><form id="galaxyViewForm" class="galaxy-view-form"><label class="sr-only" for="galaxyViewInput">Pedido</label><input id="galaxyViewInput" maxlength="300" placeholder="Ex.: quero criar um logotipo vetorial"><button class="primary-button" type="submit">Filtrar</button><button class="outline-button" type="button" id="galaxyViewReset">Limpar</button></form>'+
  '<div class="galaxy-filters" role="group" aria-label="Destacar área"><button type="button" class="filter-pill active" aria-pressed="true" data-gfam="">Todas</button>'+fams.map(f=>'<button type="button" class="filter-pill" aria-pressed="false" data-gfam="'+f+'"><span class="dot" style="background:'+COLORS[f]+'"></span>'+esc(E.categories[f]?.label||f)+'</button>').join('')+'</div>'+
  '<div class="galaxy-stage galaxy-stage-big" id="galaxyViewStage"><canvas id="galaxyViewCanvas" aria-hidden="true"></canvas><div class="galaxy-tools"><button type="button" class="galaxy-open" id="galaxyMode">Ver em 2D</button><button type="button" class="galaxy-open" id="galaxyFull">Tela cheia ⛶</button></div><div class="galaxy-hud" id="gviewHud" aria-live="polite"><span><strong id="gviewTotal">0</strong> analisadas</span><span><strong id="gviewEligible">0</strong> elegíveis</span><span><strong id="gviewTop">0</strong> recomendadas</span><em id="gviewLabel"></em></div></div>'+
  '<details class="galaxy-list"><summary>Ver a galáxia em lista (texto)</summary>'+fams.map(f=>'<h3>'+esc(E.categories[f]?.label||f)+'</h3><p>'+E.tools.filter(t=>familyOf(t)===f).map(t=>'<button type="button" class="text-button" data-panel-g="'+esc(t.id)+'">'+esc(t.name)+'</button>').join(' · ')+'</p>').join('')+'</details></div>';
  let mode3d=!!window.NexusGalaxy3D,current=null,currentFilter='';
  const build=()=>{view?.destroy();const make=mode3d?window.NexusGalaxy3D.create:create;view=make(document.getElementById('galaxyViewCanvas'),{labels:true,zoom:true,onCounts:c=>hudUpdate('gview',c)});if(current)view.setResult(current);view.setFilter(currentFilter);document.getElementById('galaxyMode').textContent=mode3d?'Ver em 2D':'Ver em 3D';};
  build();hudUpdate('gview',current?null:null);
  document.getElementById('galaxyMode').onclick=()=>{mode3d=!mode3d;build();};
  if(!window.NexusGalaxy3D)document.getElementById('galaxyMode').hidden=true;
  const run=q=>{q=q.trim();current=q.length<3?null:E.recommend(q);view.setResult(current);};
  document.getElementById('galaxyViewForm').onsubmit=e=>{e.preventDefault();run(document.getElementById('galaxyViewInput').value);};
  let t;document.getElementById('galaxyViewInput').oninput=e=>{clearTimeout(t);t=setTimeout(()=>run(e.target.value),280);};
  document.getElementById('galaxyViewReset').onclick=()=>{document.getElementById('galaxyViewInput').value='';current=null;view.setResult(null);};
  ws.querySelectorAll('[data-gfam]').forEach(b=>b.onclick=()=>{ws.querySelectorAll('[data-gfam]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});currentFilter=b.dataset.gfam;view.setFilter(currentFilter);});
  const stage=document.getElementById('galaxyViewStage'),full=document.getElementById('galaxyFull');
  if(!stage.requestFullscreen)full.hidden=true;
  full.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else stage.requestFullscreen().catch(()=>window.NexusApp?.toast('Tela cheia indisponível neste navegador.'));};
  document.addEventListener('fullscreenchange',()=>{if(full.isConnected)full.textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia ⛶';});
  ws.querySelectorAll('[data-panel-g]').forEach(b=>b.onclick=()=>window.NexusApp?.openPanel(b.dataset.panelG));
}
window.NexusGalaxy={create,familyOf,families,colors:COLORS,showView,setHero:data=>hero?.setResult(data),initHero};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initHero);else initHero();
})();
