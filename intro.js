/* Loopins 5.4 — abertura cinematográfica do modo apresentação.
 * Partículas (uma por ferramenta do catálogo, repetidas) se juntam para formar "LOOPINS",
 * mostram os números reais do catálogo, viram um lobo uivando para a lua (Loopins = alcateia)
 * e se dispersam. ~7,5 s; clique, tecla ou Esc pulam.
 * Não roda com "reduzir movimento". */
(function(){
'use strict';
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function textPoints(text,w,h,step){
  const off=document.createElement('canvas');off.width=w;off.height=h;const c=off.getContext('2d');
  const size=Math.min(w*0.16,h*0.26);
  c.fillStyle='#fff';c.font='800 '+size+'px "Space Grotesk","DM Sans",system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(text,w/2,h*0.44);
  const data=c.getImageData(0,0,w,h).data,pts=[];
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step)if(data[(y*w+x)*4+3]>128)pts.push([x,y]);
  return pts;
}
// Silhueta de lobo sentado uivando (caixa 200×200) e a lua atrás dele.
const WOLF='M86 48 L84 12 L97 29 L105 9 L111 29 L117 27 L150 5 L158 11 L135 30 L157 27 L156 35 L127 50 L133 58 L125 64 L133 72 L125 79 L131 89 L122 96 C124 110 125 125 125 140 L127 185 L138 189 L138 194 L111 194 L112 151 L105 158 L105 184 L113 189 L113 194 L80 194 L62 194 C38 199 12 193 6 173 L0 177 L4 167 L-1 160 L9 158 L6 151 L16 157 C26 168 42 173 56 168 C46 148 48 124 62 106 C71 94 77 82 80 68 L74 63 L81 57 L77 51 Z';
function shapePoints(W,H,step){
  const off=document.createElement('canvas');off.width=W;off.height=H;const c=off.getContext('2d');
  const size=Math.min(W*.42,H*.6),ox=W/2-size*.55,oy=H*.44-size*.52,k=size/200;
  const read=()=>{const d=c.getImageData(0,0,W,H).data,pts=[];for(let y=0;y<H;y+=step)for(let x=0;x<W;x+=step)if(d[(y*W+x)*4+3]>128)pts.push([x,y]);return pts;};
  // Lua: círculo à direita, acima do focinho.
  c.fillStyle='#fff';c.beginPath();c.arc(ox+186*k,oy+34*k,30*k,0,Math.PI*2);c.fill();
  c.globalCompositeOperation='destination-out';c.save();c.translate(ox,oy);c.scale(k,k);c.fill(new Path2D(WOLF));c.restore();
  const moon=read();
  c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);c.save();c.translate(ox,oy);c.scale(k,k);c.fill(new Path2D(WOLF));c.restore();
  return {wolf:read(),moon};
}
function play(onDone){
  const done=()=>{try{onDone?.();}catch(_){/* segue a apresentação */}};
  if(reduced()||!document.createElement('canvas').getContext){done();return;}
  const E=window.NexusEngine,G=window.NexusGalaxy;
  const wrap=document.createElement('div');wrap.className='intro-overlay';wrap.setAttribute('role','presentation');
  const c=document.createElement('canvas');wrap.appendChild(c);
  const sub=document.createElement('p');sub.className='intro-sub';
  const sources=new Set();for(const t of E.tools)for(const v of Object.values(t.capabilities||{}))if(v.status==='supported'&&v.source)sources.add(v.source);
  sub.textContent=E.tools.length+' IAs · '+(Object.keys(E.subtasks).length-1)+' tipos de tarefa · '+sources.size+' fontes oficiais';
  const skip=document.createElement('button');skip.type='button';skip.className='intro-skip';skip.textContent='Pular abertura';
  wrap.append(sub,skip);document.body.appendChild(wrap);
  const ctx=c.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;
  c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';ctx.scale(dpr,dpr);
  const step=W<700?5:7,pts=textPoints('LOOPINS',W,H,step),shape=shapePoints(W,H,step);
  const wolfPts=[...shape.wolf.map(p=>[p[0],p[1],0]),...shape.moon.map(p=>[p[0],p[1],1])];
  const sub2=document.createElement('p');sub2.className='intro-sub intro-sub2';sub2.textContent='Loopins: a alcateia que encontra a IA certa para você.';wrap.insertBefore(sub2,skip);
  const colors=G?Object.values(G.colors):['#8b7cff','#2ec4b6','#ff6fae'];
  // Cada partícula herda a cor da área de uma ferramenta real.
  const tools=E.tools.map(t=>G?G.colors[G.familyOf(t)]:colors[0]);
  let seed=3;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const count=Math.max(pts.length,wolfPts.length);
  const parts=Array.from({length:count},(_,i)=>{const p=pts[i%pts.length],q=wolfPts[i%wolfPts.length],a=rnd()*Math.PI*2,r=Math.max(W,H)*(.6+rnd()*.5);
    return {tx:p[0],ty:p[1],wx:q[0],wy:q[1],moon:q[2]===1,sx:W/2+Math.cos(a)*r,sy:H/2+Math.sin(a)*r,ex:q[0]+(rnd()-.5)*W*1.4,ey:q[1]+(rnd()-.5)*H*1.4,c:tools[i%tools.length]||colors[i%colors.length],d:rnd()*500,m:rnd()*400};});
  window.NexusSound?.intro();
  const start=performance.now();let raf=0,ended=false;
  const finish=()=>{if(ended)return;ended=true;cancelAnimationFrame(raf);if(performance.now()-start<7000)window.NexusSound?.stop();wrap.classList.add('is-leaving');document.removeEventListener('keydown',onKey,true);setTimeout(()=>{wrap.remove();done();},350);};
  const onKey=e=>{e.preventDefault();e.stopPropagation();finish();};
  document.addEventListener('keydown',onKey,true);wrap.addEventListener('click',finish);
  const easeOut=t=>1-Math.pow(1-t,3),easeIn=t=>t*t*t;
  // Linha do tempo: forma o nome (0–2 s) → mostra números (até 3,2 s) → vira lobo e lua (3,2–4,8 s)
  // → mostra o significado (até 6,6 s) → dispersa (até 7,4 s).
  const tick=now=>{
    const t=now-start;ctx.clearRect(0,0,W,H);
    for(const p of parts){
      let x,y,a=1,mix=0;
      if(t<2000){const k=easeOut(Math.max(0,Math.min(1,(t-p.d)/1500)));x=p.sx+(p.tx-p.sx)*k;y=p.sy+(p.ty-p.sy)*k;a=Math.min(1,k*1.4);}
      else if(t<3200){x=p.tx+Math.sin(t/300+p.d)*.6;y=p.ty+Math.cos(t/340+p.d)*.6;}
      else if(t<4800){const k=easeOut(Math.max(0,Math.min(1,(t-3200-p.m)/1200)));x=p.tx+(p.wx-p.tx)*k;y=p.ty+(p.wy-p.ty)*k;mix=k;}
      else if(t<6600){x=p.wx+Math.sin(t/320+p.d)*.5;y=p.wy+Math.cos(t/360+p.d)*.5;mix=1;}
      else{const k=easeIn(Math.min(1,(t-6600)/800));x=p.wx+(p.ex-p.wx)*k;y=p.wy+(p.ey-p.wy)*k;a=1-k;mix=1;}
      if(mix<1){ctx.globalAlpha=a*(1-mix);ctx.fillStyle=p.c;ctx.fillRect(x-1.3,y-1.3,2.6,2.6);}
      if(mix>0){ctx.globalAlpha=a*mix;ctx.fillStyle=p.moon?'#ffe7a3':'#dfe6ff';ctx.fillRect(x-1.3,y-1.3,2.6,2.6);}
    }
    ctx.globalAlpha=1;
    sub.classList.toggle('is-visible',t>1700&&t<3200);
    sub2.classList.toggle('is-visible',t>4600&&t<6700);
    if(t<7400)raf=requestAnimationFrame(tick);else finish();
  };
  raf=requestAnimationFrame(tick);
  skip.focus();
}
window.NexusIntro={play};
})();
