/* Loopins 5.4 — Universo 3D de IAs.
 * Globo 3D renderizado em canvas 2D (sem bibliotecas): cada ferramenta é uma estrela na superfície,
 * agrupada pela área (mesma regra da galáxia 2D). Gira sozinho, aceita arrastar e zoom.
 * Com um pedido: elegíveis saltam para fora do globo, descartadas afundam e se apagam,
 * e as 3 recomendadas flutuam para a frente com posição. Mesma API de galaxy.js:
 * create(canvas, options) → {setResult, setFilter, destroy, nodes}. */
(function(){
'use strict';
const E=window.NexusEngine;
if(!E)return;
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+Math.max(0,Math.min(1,a)).toFixed(3)+')';}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
// Gerador pseudoaleatório com semente: o céu de fundo é sempre igual.
function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const norm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

function create(canvas,options={}){
  const ctx=canvas.getContext&&canvas.getContext('2d');
  const G=window.NexusGalaxy;
  if(!ctx||!G)return {setResult(){},setFilter(){},destroy(){},nodes:[]};
  const fams=G.families(),COLORS=G.colors;
  // Centro de cada área: distribuição de Fibonacci na esfera.
  const centers={};
  fams.forEach((f,i)=>{const y=1-(i+.5)/fams.length*2,r=Math.sqrt(1-y*y),a=i*2.39996;centers[f]=[Math.cos(a)*r,y*.85,Math.sin(a)*r];});
  const groups={};
  const nodes=E.tools.map(t=>{const f=G.familyOf(t);(groups[f]=groups[f]||[]).push(t.id);return {id:t.id,name:t.name,family:f,color:COLORS[f]||'#aaa'};});
  // Ferramentas espalhadas numa calota em volta do centro da área (espiral áurea).
  for(const n of nodes){
    const list=groups[n.family],k=list.indexOf(n.id),c=norm(centers[n.family]);
    const up=Math.abs(c[1])>.9?[1,0,0]:[0,1,0],u=norm(cross(c,up)),v=cross(c,u);
    const ang=k*2.39996,rad=0.11+0.085*Math.sqrt(k);
    n.base=norm([c[0]+(u[0]*Math.cos(ang)+v[0]*Math.sin(ang))*rad,c[1]+(u[1]*Math.cos(ang)+v[1]*Math.sin(ang))*rad,c[2]+(u[2]*Math.cos(ang)+v[2]*Math.sin(ang))*rad]);
    n.lift=1;n.alpha=1;n.size=1;n.mode='idle';n.rank=0;n.fx=0;n.fy=0;n.front=0;n.sx=0;n.sy=0;n.sz=0;n.seed=k*1.7;
  }
  // Constelações: cada estrela ligada às 2 vizinhas mais próximas da mesma área.
  const links=[];
  for(const n of nodes){
    const same=nodes.filter(m=>m!==n&&m.family===n.family).map(m=>[m,(m.base[0]-n.base[0])**2+(m.base[1]-n.base[1])**2+(m.base[2]-n.base[2])**2]).sort((a,b)=>a[1]-b[1]).slice(0,2);
    for(const [m] of same)if(!links.some(([a,b])=>(a===m&&b===n)))links.push([n,m]);
  }
  const rnd=seeded(7),stars=Array.from({length:180},()=>({x:rnd(),y:rnd(),r:rnd()*1.2+.2,a:rnd()*.6+.2,tw:rnd()*6}));
  let w=0,h=0,dpr=1,raf=0,last=0,time=0,yaw=0.6,pitch=-0.25,zoom=1,vyaw=0,dragging=null,hover=null,result=null,filter=null,destroyed=false,coreA=0,HUD=58;
  const onCounts=options.onCounts||(()=>{});

  function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);w=Math.max(1,r.width);h=Math.max(1,r.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);HUD=w<600?86:58;}
  const cy=()=>HUD+(h-HUD)/2;
  function project(p){
    // Rotação (yaw em Y, pitch em X) e perspectiva.
    const cyw=Math.cos(yaw),syw=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    let x=p[0]*cyw+p[2]*syw,z=-p[0]*syw+p[2]*cyw,y=p[1];
    const y2=y*cp-z*sp,z2=y*sp+z*cp;
    const R=Math.max(20,Math.min(w,h-HUD)*(options.scale||0.36)*zoom),f=3.2,s=f/(f+z2);
    return {x:w/2+x*R*s,y:cy()+y2*R*s,z:z2,s};
  }
  function apply(){
    const items=result?.items||[],el=new Set((result?.eligible||[]).map(t=>t.id));
    for(const n of nodes){const rank=items.findIndex(t=>t.id===n.id)+1;n.rank=rank;n.mode=!result?'idle':rank?'top':el.has(n.id)?'eligible':'dim';if(filter&&n.family!==filter&&n.mode!=='top')n.mode='dim';}
    onCounts(result?{total:nodes.length,eligible:el.size,top:items.length,label:result.intent?.deliverable||''}:null);
  }
  function draw(dt){
    const light=document.documentElement.dataset.theme==='light',rm=reducedMotion();
    const ease=rm?1:1-Math.exp(-dt/240);
    if(!dragging){yaw+=(rm?0:0.00011*dt)+vyaw;vyaw*=0.94;}
    coreA+=((result?1:0)-coreA)*ease;
    ctx.clearRect(0,0,w,h);
    // Céu de fundo.
    for(const s of stars){ctx.fillStyle=light?'rgba(60,60,120,'+(s.a*.35)+')':'rgba(255,255,255,'+(s.a*(rm?1:.7+.3*Math.sin(time/900+s.tw)))+')';ctx.fillRect(s.x*w,s.y*h,s.r,s.r);}
    // Halo e malha do globo (dá profundidade).
    const R=Math.max(20,Math.min(w,h-HUD)*(options.scale||0.36)*zoom),c0=cy();
    const halo=ctx.createRadialGradient(w/2,c0,R*.2,w/2,c0,R*1.35);
    halo.addColorStop(0,light?'rgba(91,79,214,.10)':'rgba(120,110,255,.16)');halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(w/2,c0,R*1.35,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=1;
    for(let lat=-60;lat<=60;lat+=30){
      const ph=lat*Math.PI/180;ctx.beginPath();
      for(let i=0;i<=48;i++){const th=i/48*Math.PI*2,p=project([Math.cos(ph)*Math.cos(th),Math.sin(ph),Math.cos(ph)*Math.sin(th)]);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}
      ctx.strokeStyle=light?'rgba(80,80,160,.10)':'rgba(170,165,255,.10)';ctx.stroke();
    }
    for(let lon=0;lon<180;lon+=30){
      const th=lon*Math.PI/180;ctx.beginPath();
      for(let i=0;i<=48;i++){const ph=i/48*Math.PI*2,p=project([Math.cos(ph)*Math.cos(th),Math.sin(ph),Math.cos(ph)*Math.sin(th)]);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}
      ctx.strokeStyle=light?'rgba(80,80,160,.07)':'rgba(170,165,255,.07)';ctx.stroke();
    }
    // Atualiza estados e projeta.
    for(const n of nodes){
      const wantLift=n.mode==='eligible'?1.22:n.mode==='dim'?0.86:n.mode==='top'?1.25:1;
      const wantA=n.mode==='dim'?.12:1,wantS=n.mode==='top'?2.4:n.mode==='eligible'?1.5:1,wantF=n.mode==='top'?1:0;
      n.lift+=(wantLift-n.lift)*ease;n.alpha+=(wantA-n.alpha)*ease;n.size+=(wantS-n.size)*ease;n.front+=(wantF-n.front)*ease;
      const p=project([n.base[0]*n.lift,n.base[1]*n.lift,n.base[2]*n.lift]);
      // Recomendadas: interpolam da posição no globo para uma posição fixa na frente.
      const ang=[-90,-150,-30][Math.max(0,n.rank-1)]*Math.PI/180,fr=Math.max(20,Math.min(w,h-HUD)*.27);
      const fx=w/2+Math.cos(ang)*fr*(w<600?1.1:1.55),fy=c0+Math.sin(ang)*fr+(rm?0:Math.sin(time/800+n.rank)*3);
      n.sx=p.x+(fx-p.x)*n.front;n.sy=p.y+(fy-p.y)*n.front;n.sz=p.z*(1-n.front)-2*n.front;n.ps=p.s+(1.15-p.s)*n.front;
    }
    // Constelações (só no estado inicial, atrás das estrelas).
    const idleA=1-coreA;
    if(idleA>.02)for(const [a,b] of links){
      const za=(a.sz+b.sz)/2,depth=za>0?.25:1;
      ctx.strokeStyle=hexA(a.color,.22*idleA*depth*Math.min(a.alpha,b.alpha));ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
    }
    // Núcleo do pedido e feixes.
    if(coreA>.02){
      const pulse=rm?1:1+Math.sin(time/420)*.1,r=Math.min(w,h)*0.045*pulse;
      const g=ctx.createRadialGradient(w/2,c0,0,w/2,c0,r*3.2);g.addColorStop(0,'rgba(190,180,255,'+(.7*coreA)+')');g.addColorStop(1,'rgba(164,155,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(w/2,c0,r*3.2,0,Math.PI*2);ctx.fill();
      for(const n of nodes){if(n.mode!=='top'&&n.mode!=='eligible')continue;const top=n.mode==='top';
        ctx.strokeStyle=hexA(n.color,(top?.85:.18)*coreA*(n.sz>0&&!top?.4:1));ctx.lineWidth=top?2.2:1;
        ctx.beginPath();ctx.moveTo(w/2,c0);ctx.quadraticCurveTo((w/2+n.sx)/2,(c0+n.sy)/2-(top?30:10),n.sx,n.sy);ctx.stroke();}
      ctx.fillStyle='rgba(255,255,255,'+coreA+')';ctx.beginPath();ctx.arc(w/2,c0,r*.42,0,Math.PI*2);ctx.fill();
    }
    // Estrelas de trás para frente.
    const order=[...nodes].sort((a,b)=>b.sz-a.sz);
    for(const n of order){
      const back=n.sz>0,depthA=back?Math.max(.18,1-n.sz*.9):1;
      const tw=rm?1:.88+.12*Math.sin(time/650+n.seed);
      const r=3*n.size*n.ps*tw*(hover===n?1.5:1),a=n.alpha*depthA;
      const glow=ctx.createRadialGradient(n.sx,n.sy,0,n.sx,n.sy,r*4.5);glow.addColorStop(0,hexA(n.color,.55*a));glow.addColorStop(1,hexA(n.color,0));
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(n.sx,n.sy,r*4.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=hexA(n.color,a);ctx.beginPath();ctx.arc(n.sx,n.sy,r,0,Math.PI*2);ctx.fill();
      if(!back&&a>.6){ctx.fillStyle='rgba(255,255,255,'+(.7*a)+')';ctx.beginPath();ctx.arc(n.sx-r*.3,n.sy-r*.3,r*.35,0,Math.PI*2);ctx.fill();}
    }
    // Rótulos.
    ctx.font='700 13px "DM Sans",system-ui,sans-serif';ctx.textAlign='center';
    for(const n of nodes){
      if(n.mode!=='top'&&hover!==n&&!(options.labels&&n.mode==='eligible'&&n.sz<0))continue;
      const text=(n.mode==='top'?n.rank+'º · ':'')+n.name,tw2=ctx.measureText(text).width+16;
      const tx=Math.min(w-tw2/2-4,Math.max(tw2/2+4,n.sx)),ty=Math.max(HUD+16,n.sy-14*n.size-6);
      ctx.fillStyle=light?'rgba(255,255,255,.94)':'rgba(12,15,27,.88)';roundRect(ctx,tx-tw2/2,ty-15,tw2,22,11);ctx.fill();
      ctx.strokeStyle=hexA(n.color,.95);ctx.lineWidth=1;roundRect(ctx,tx-tw2/2,ty-15,tw2,22,11);ctx.stroke();
      ctx.fillStyle=light?'#171a2b':'#fff';ctx.fillText(text,tx,ty);
    }
    if(coreA>.5&&result?.intent?.deliverable){
      const label=result.intent.deliverable;ctx.font='700 12px "DM Sans",system-ui,sans-serif';
      ctx.fillStyle=light?'rgba(23,26,43,'+coreA+')':'rgba(255,255,255,'+coreA+')';
      ctx.fillText(label.length>34?label.slice(0,33)+'…':label,w/2,c0+Math.min(w,h)*.045+24);
    }
    if(!result&&options.hint!==false&&!dragging){ctx.font='600 11px "DM Sans",system-ui,sans-serif';ctx.fillStyle=light?'rgba(30,35,60,.55)':'rgba(220,226,255,.5)';ctx.fillText('Arraste para girar · role para aproximar',w/2,h-14);}
  }
  function frame(now){
    if(destroyed)return;if(!canvas.isConnected){destroy();return;}
    const dt=last?Math.min(64,now-last):16;last=now;time=now;
    if(!document.hidden)draw(dt);raf=requestAnimationFrame(frame);
  }
  function pick(ev){
    const r=canvas.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top;let best=null,bd=20*20;
    for(const n of nodes){if(n.alpha<.3||(n.sz>.35&&n.mode!=='top'))continue;const d=(n.sx-x)**2+(n.sy-y)**2;if(d<bd){bd=d;best=n;}}
    return best;
  }
  const onDown=ev=>{dragging={x:ev.clientX,y:ev.clientY,yaw,pitch,moved:false,t:performance.now()};canvas.setPointerCapture?.(ev.pointerId);};
  const onMove=ev=>{
    if(dragging){const dx=ev.clientX-dragging.x,dy=ev.clientY-dragging.y;if(Math.abs(dx)+Math.abs(dy)>4)dragging.moved=true;
      const ny=dragging.yaw+dx*0.008;vyaw=(ny-yaw)*0.5;yaw=ny;pitch=Math.max(-1.2,Math.min(1.2,dragging.pitch+dy*0.006));return;}
    hover=pick(ev);canvas.style.cursor=hover?'pointer':'grab';canvas.title=hover?hover.name+' — clique para ver detalhes':'';
  };
  const onUp=ev=>{const d=dragging;dragging=null;if(d&&!d.moved){const n=pick(ev);if(n&&window.NexusApp)window.NexusApp.openPanel(n.id);}};
  const onLeave=()=>{hover=null;};
  const onWheel=ev=>{if(!options.zoom)return;ev.preventDefault();zoom=Math.max(.7,Math.min(1.8,zoom*(ev.deltaY>0?.92:1.08)));};
  canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointerleave',onLeave);canvas.addEventListener('wheel',onWheel,{passive:false});
  canvas.style.touchAction=options.zoom?'none':'pan-y';
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;ro?.observe(canvas);
  resize();raf=requestAnimationFrame(frame);
  function destroy(){destroyed=true;cancelAnimationFrame(raf);ro?.disconnect();canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointerleave',onLeave);canvas.removeEventListener('wheel',onWheel);}
  return {
    nodes,
    setResult(data){result=data&&data.items?data:null;apply();},
    setFilter(f){filter=f||null;apply();},
    rotate(d){vyaw+=d;},
    destroy
  };
}
window.NexusGalaxy3D={create};
})();
