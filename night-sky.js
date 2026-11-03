/* Loopins 5.7 — Céu da alcateia (decorativo, sem interação).
 * Topo da página: aurora em movimento, lua, estrelas piscando, estrelas cadentes e um lobo
 * desenhado por estrelas que uiva para a lua. Abaixo da busca, uma faixa contínua com as IAs
 * do catálogo. Respeita "reduzir movimento" (fica tudo parado) e pausa fora da tela. */
(function(){
'use strict';
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

/* Lobo uivando: mesma silhueta da abertura (intro.js), com estrelas nos vértices do contorno. */
const WOLF='M86 48 L84 12 L97 29 L105 9 L111 29 L117 27 L150 5 L158 11 L135 30 L157 27 L156 35 L127 50 L133 58 L125 64 L133 72 L125 79 L131 89 L122 96 C124 110 125 125 125 140 L127 185 L138 189 L138 194 L111 194 L112 151 L105 158 L105 184 L113 189 L113 194 L80 194 L62 194 C38 199 12 193 6 173 L0 177 L4 167 L-1 160 L9 158 L6 151 L16 157 C26 168 42 173 56 168 C46 148 48 124 62 106 C71 94 77 82 80 68 L74 63 L81 57 L77 51 Z';
const STARS={ear:[84,12],ear2:[105,9],snout:[150,5],jaw:[157,27],throat:[127,50],chest:[122,96],paw:[130,190],hind:[109,190],haunch:[62,194],tail:[2,170],tailbase:[56,168],back:[62,106],neck:[80,68],nape:[86,48],eye:[114,27]};
const LINES=[['ear','ear2','snout','jaw','throat','chest','paw','hind','haunch','tail','tailbase','back','neck','nape','ear']];
const BRIGHT=new Set(['snout','eye','ear2','tail']);

function constellation(){
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','-12 -22 196 226');svg.setAttribute('class','sky-wolf');
  svg.innerHTML='<defs><linearGradient id="skyWolfFill" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7b8bff"/><stop offset="1" stop-color="#6ae6d6"/></linearGradient></defs>';
  const shape=document.createElementNS(NS,'path');shape.setAttribute('d',WOLF);shape.setAttribute('class','sky-wolf-shape');svg.appendChild(shape);
  LINES.forEach((names,i)=>{const p=document.createElementNS(NS,'polyline');p.setAttribute('points',names.map(n=>STARS[n].join(',')).join(' '));p.setAttribute('pathLength','1');p.setAttribute('class','sky-wolf-line');p.style.animationDelay=(0.6+i*1.1)+'s';svg.appendChild(p);});
  Object.entries(STARS).forEach(([name,[x,y]],i)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',BRIGHT.has(name)?3.4:2.4);c.setAttribute('class','sky-wolf-star'+(BRIGHT.has(name)?' bright':''));c.style.animationDelay=(i*0.37).toFixed(2)+'s';svg.appendChild(c);});
  // Ondas do uivo saindo do focinho em direção à lua.
  const [nx,ny]=STARS.snout,ang=Math.atan2(ny-22,nx-128),pt=(r,d)=>[(nx+r*Math.cos(ang+d)).toFixed(1),(ny+r*Math.sin(ang+d)).toFixed(1)];
  [9,15,21].forEach((r,i)=>{const a=document.createElementNS(NS,'path'),[x1,y1]=pt(r,-.65),[x2,y2]=pt(r,.65);a.setAttribute('d','M'+x1+' '+y1+' A'+r+' '+r+' 0 0 1 '+x2+' '+y2);a.setAttribute('class','sky-howl');a.style.animationDelay=(3.2+i*0.35)+'s';svg.appendChild(a);});
  return svg;
}

function starfield(canvas){
  const ctx=canvas.getContext('2d');if(!ctx)return {start(){},stop(){}};
  const rnd=seeded(2026),stars=Array.from({length:150},()=>({x:rnd(),y:Math.pow(rnd(),1.4),r:.4+rnd()*1.3,p:rnd()*6.28,s:.6+rnd()*1.6}));
  let w=0,h=0,raf=0,last=0,meteor=null,nextMeteor=2500;
  function size(){const dpr=Math.min(2,window.devicePixelRatio||1);w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=Math.max(1,w*dpr);canvas.height=Math.max(1,h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function draw(t){
    ctx.clearRect(0,0,w,h);
    for(const s of stars){const a=reduced()?.7:.35+.65*(.5+.5*Math.sin(t/1000*s.s+s.p));ctx.globalAlpha=a*(1-s.y*.55);ctx.fillStyle='#e9ecff';ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,6.283);ctx.fill();}
    if(meteor){const k=(t-meteor.t0)/900;if(k>=1)meteor=null;else{const x=meteor.x-k*meteor.len,y=meteor.y+k*meteor.len*.45,g=ctx.createLinearGradient(x,y,x+120,y-54);g.addColorStop(0,'rgba(255,255,255,'+(1-k)+')');g.addColorStop(1,'rgba(160,190,255,0)');ctx.globalAlpha=1;ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+120,y-54);ctx.stroke();}}
    ctx.globalAlpha=1;
  }
  function frame(t){
    raf=requestAnimationFrame(frame);
    if(document.hidden||window.scrollY>h+200||t-last<33)return;last=t;
    if(!meteor&&t>nextMeteor){meteor={t0:t,x:w*(.45+Math.random()*.5),y:h*(.05+Math.random()*.3),len:w*.35};nextMeteor=t+4500+Math.random()*5000;}
    draw(t);
  }
  return {
    start(){size();window.addEventListener('resize',size,{passive:true});if(reduced())draw(0);else raf=requestAnimationFrame(frame);},
    stop(){cancelAnimationFrame(raf);}
  };
}

function buildSky(){
  const main=document.getElementById('mainContent');if(!main||document.getElementById('nightSky'))return;
  const sky=document.createElement('div');sky.id='nightSky';sky.className='night-sky';sky.setAttribute('aria-hidden','true');
  sky.innerHTML='<div class="aurora a1"></div><div class="aurora a2"></div><div class="aurora a3"></div><canvas class="sky-stars"></canvas><div class="sky-moon"><i></i><i></i><i></i></div>';
  sky.appendChild(constellation());
  main.prepend(sky);
  starfield(sky.querySelector('canvas')).start();
}

function buildMarquee(){
  const hero=document.getElementById('heroSection'),E=window.NexusEngine;if(!hero||!E||document.getElementById('aiMarquee'))return;
  const tools=[...E.tools].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  const esc=v=>String(v).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),color=v=>/^#[0-9a-f]{3,8}$/i.test(v)?v:'#6c8aff';
  const chip=t=>'<span class="mq-chip"><b style="--tool-start:'+color(t.colors?.[0])+';--tool-end:'+color(t.colors?.[1])+'">'+esc(t.name.charAt(0))+'</b>'+esc(t.name)+'</span>';
  const row=(list,cls)=>{const html=list.map(chip).join('');return '<div class="mq-row '+cls+'"><div class="mq-track">'+html+html+'</div></div>';};
  const band=document.createElement('section');band.id='aiMarquee';band.className='ai-marquee';band.setAttribute('aria-label','Faixa com as '+tools.length+' IAs do catálogo');
  band.innerHTML='<p class="mq-title"><span>'+tools.length+'</span> IAs na alcateia</p><div aria-hidden="true">'+row(tools.filter((_,i)=>i%2===0),'mq-left')+row(tools.filter((_,i)=>i%2===1),'mq-right')+'</div><p class="sr-only">'+esc(tools.map(t=>t.name).join(', '))+'.</p>';
  hero.after(band);
}

function init(){buildSky();buildMarquee();}
window.NexusNightSky={init,stars:STARS,lines:LINES};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
