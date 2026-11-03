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

/* Constelações por categoria (6.2): ao escolher uma categoria ou buscar, as estrelas formam o
 * símbolo da área. O lobo é a constelação padrão. Coordenadas no mesmo quadro do lobo. */
const circ=(cx,cy,r,n,a0=-Math.PI/2)=>Array.from({length:n},(_,i)=>[+(cx+r*Math.cos(a0+i*2*Math.PI/n)).toFixed(1),+(cy+r*Math.sin(a0+i*2*Math.PI/n)).toFixed(1)]);
function shapeFrom(name,groups,bright=[]){ // groups: [{pts:[[x,y]...],close:true|false}] → estrelas + linhas
  const stars=[],lines=[];
  for(const g of groups){const idx=g.pts.map(p=>{stars.push(p);return stars.length-1;});if(idx.length>1)lines.push(g.close?[...idx,idx[0]]:idx);}
  return {name,stars,lines,bright:new Set(bright)};
}
const gearPts=()=>Array.from({length:32},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/32,r=[86,86,64,64][i%4];return [+(96+r*Math.cos(a)).toFixed(1),+(96+r*Math.sin(a)).toFixed(1)];});
const SHAPES={
 code:shapeFrom('das Chaves',[{pts:[[62,8],[46,14],[44,58],[26,96],[44,134],[46,178],[62,184]]},{pts:[[130,8],[146,14],[148,58],[166,96],[148,134],[146,178],[130,184]]},{pts:[[80,96]]},{pts:[[96,96]]},{pts:[[112,96]]}],[14,15,16,3,10]),
 image:shapeFrom('do Pincel',[{pts:[[30,196],[75,140],[118,86]]},{pts:[[110,78],[150,52],[176,6],[160,60],[132,96]]},{pts:[[60,40]]},{pts:[[24,80]]}],[5,8,9]),
 video:shapeFrom('da Câmera',[{pts:[[10,70],[110,70],[110,160],[10,160]],close:true},{pts:[[110,95],[170,70],[170,160],[110,135]],close:true},{pts:circ(38,40,24,6),close:true},{pts:circ(88,40,24,6),close:true}],[5,6]),
 audio:shapeFrom('da Música',[{pts:[[60,150],[60,40],[150,20],[150,130]]},{pts:[[60,62],[150,42]]},{pts:circ(42,152,19,6),close:true},{pts:circ(132,132,19,6),close:true}],[1,2]),
 study:shapeFrom('do Livro',[{pts:[[10,50],[96,74],[182,50],[182,170],[96,194],[10,170]],close:true},{pts:[[96,74],[96,194]]},{pts:[[30,84],[78,98]]},{pts:[[30,114],[78,128]]},{pts:[[114,98],[162,84]]},{pts:[[114,128],[162,114]]}],[1]),
 research:shapeFrom('da Lupa',[{pts:circ(78,78,56,10),close:true},{pts:[[122,112],[178,170],[168,180],[112,122]]}],[0,12]),
 presentation:shapeFrom('da Tela',[{pts:[[12,10],[180,10],[180,124],[12,124]],close:true},{pts:[[96,124],[96,168]]},{pts:[[60,204],[96,168],[132,204]]},{pts:[[36,100],[70,70],[104,86],[150,40]]}],[17]),
 design:shapeFrom('do Esquadro',[{pts:[[20,190],[176,190],[20,30]],close:true},{pts:[[44,166],[118,166],[44,90]],close:true}],[2]),
 text:shapeFrom('da Pena',[{pts:[[30,200],[70,150],[112,92],[150,36],[172,4]]},{pts:[[172,4],[132,30],[100,70],[80,118],[70,150]]},{pts:[[172,4],[170,48],[144,92],[110,128],[70,150]]}],[4]),
 automation:shapeFrom('da Engrenagem',[{pts:gearPts(),close:true},{pts:circ(96,96,26,8),close:true}],[0,8,16,24]),
 data:shapeFrom('do Gráfico',[{pts:[[16,8],[16,186],[182,186]]},{pts:[[40,186],[40,126],[66,126],[66,186]]},{pts:[[88,186],[88,80],[114,80],[114,186]]},{pts:[[136,186],[136,36],[162,36],[162,186]]}],[14]),
 agents:shapeFrom('do Balão',[{pts:[[12,24],[180,24],[180,134],[84,134],[46,180],[58,134],[12,134]],close:true},{pts:[[56,80]]},{pts:[[96,80]]},{pts:[[136,80]]}],[7,8,9])
};
const WOLF_SHAPE={name:'do Lobo',stars:Object.values(STARS),lines:LINES.map(l=>l.map(n=>Object.keys(STARS).indexOf(n))),bright:new Set(Object.keys(STARS).map((k,i)=>BRIGHT.has(k)?i:-1).filter(i=>i>=0)),wolf:true};
const FAMILY_SHAPE={all:'wolf',code:'code',image:'image',video:'video',audio:'audio',study:'study',research:'research',presentation:'presentation',design:'design',text:'text',automation:'automation',data:'data',agents:'agents'};
let currentShape='',swapTimer=null;
function renderShape(svg,key){
  const sh=key==='wolf'?WOLF_SHAPE:SHAPES[key];if(!sh)return;
  svg.innerHTML='<defs><linearGradient id="skyWolfFill" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7b8bff"/><stop offset="1" stop-color="#6ae6d6"/></linearGradient></defs>';
  svg.dataset.shape=key;
  if(sh.wolf){const shape=document.createElementNS(NS,'path');shape.setAttribute('d',WOLF);shape.setAttribute('class','sky-wolf-shape');svg.appendChild(shape);}
  sh.lines.forEach((ids,i)=>{const p=document.createElementNS(NS,'polyline');p.setAttribute('points',ids.map(n=>sh.stars[n].join(',')).join(' '));p.setAttribute('pathLength','1');p.setAttribute('class','sky-wolf-line');p.style.animationDelay=(sh.wolf?0.6:0.15+i*0.25)+'s';svg.appendChild(p);});
  sh.stars.forEach(([x,y],i)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',sh.bright.has(i)?3.4:2.4);c.setAttribute('class','sky-wolf-star'+(sh.bright.has(i)?' bright':''));c.style.animationDelay=(i*0.37%4).toFixed(2)+'s';svg.appendChild(c);});
  if(sh.wolf){
    // Ondas do uivo saindo do focinho em direção à lua.
    const [nx,ny]=STARS.snout,ang=Math.atan2(ny-22,nx-128),pt=(r,d)=>[(nx+r*Math.cos(ang+d)).toFixed(1),(ny+r*Math.sin(ang+d)).toFixed(1)];
    [9,15,21].forEach((r,i)=>{const a=document.createElementNS(NS,'path'),[x1,y1]=pt(r,-.65),[x2,y2]=pt(r,.65);a.setAttribute('d','M'+x1+' '+y1+' A'+r+' '+r+' 0 0 1 '+x2+' '+y2);a.setAttribute('class','sky-howl');a.style.animationDelay=(3.2+i*0.35)+'s';svg.appendChild(a);});
  }
  const label=document.createElementNS(NS,'text');label.setAttribute('x','86');label.setAttribute('y','226');label.setAttribute('text-anchor','middle');label.setAttribute('class','sky-label');label.textContent='Constelação '+sh.name;svg.appendChild(label);
  currentShape=key;
}
function constellation(){
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','-12 -22 196 256');svg.setAttribute('class','sky-wolf');
  renderShape(svg,'wolf');return svg;
}
function setShape(family){
  const key=FAMILY_SHAPE[family]||'wolf',svg=document.querySelector('#nightSky .sky-wolf');
  if(!svg||key===currentShape)return;
  clearTimeout(swapTimer);
  if(reduced()){renderShape(svg,key);return;}
  svg.classList.add('sky-swap');currentShape=key;
  swapTimer=setTimeout(()=>{renderShape(svg,key);svg.classList.remove('sky-swap');},380);
}
/* Truque “auuu”: lua vermelha e o lobo de estrelas uivando por alguns segundos. */
let bloodTimer=null;
function bloodMoon(){
  const sky=document.getElementById('nightSky'),svg=sky?.querySelector('.sky-wolf');if(!sky||!svg)return;
  clearTimeout(swapTimer);svg.classList.remove('sky-swap');renderShape(svg,'wolf');
  sky.classList.add('blood');clearTimeout(bloodTimer);bloodTimer=setTimeout(()=>sky.classList.remove('blood'),9000);
}
function listen(){
  document.addEventListener('loopins:category',e=>setShape(e.detail?.category));
  document.addEventListener('loopins:results',e=>{if(e.detail?.count>0)setShape(e.detail.family);});
  document.addEventListener('input',e=>{if(e.target?.id==='taskInput'&&!e.target.value.trim())setShape('all');});
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
  // CSS antigo em cache (atualização recém-publicada)? Sem os estilos o céu ficaria quebrado: não mostra.
  if(typeof getComputedStyle==='function'&&getComputedStyle(sky).position!=='absolute'){sky.remove();return;}
  starfield(sky.querySelector('canvas')).start();
}

function buildMarquee(){
  const hero=document.getElementById('heroSection'),E=window.NexusEngine;if(!hero||!E||document.getElementById('aiMarquee'))return;
  const tools=[...E.tools].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  const esc=v=>String(v).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),color=v=>/^#[0-9a-f]{3,8}$/i.test(v)?v:'#6c8aff';
  const chip=t=>'<span class="mq-chip"><b style="--tool-start:'+color(t.colors?.[0])+';--tool-end:'+color(t.colors?.[1])+'">'+esc(t.name.charAt(0))+'</b>'+esc(t.name)+'</span>';
  // Velocidade constante: a duração cresce com a quantidade de IAs na faixa.
  const row=(list,cls,k)=>{const html=list.map(chip).join('');return '<div class="mq-row '+cls+'"><div class="mq-track" style="animation-duration:'+Math.round(list.length*k)+'s">'+html+html+'</div></div>';};
  const band=document.createElement('section');band.id='aiMarquee';band.className='ai-marquee';band.setAttribute('aria-label','Faixa com as '+tools.length+' IAs do catálogo');
  band.innerHTML='<p class="mq-title"><span>'+tools.length+'</span> IAs na alcateia</p><div aria-hidden="true">'+row(tools.filter((_,i)=>i%2===0),'mq-left',2.6)+row(tools.filter((_,i)=>i%2===1),'mq-right',3)+'</div><p class="sr-only">'+esc(tools.map(t=>t.name).join(', '))+'.</p>';
  hero.after(band);
  if(typeof getComputedStyle==='function'&&getComputedStyle(band.querySelector('.mq-track')).display!=='flex')band.remove();
}

function init(){buildSky();buildMarquee();listen();}
window.NexusNightSky={init,stars:STARS,lines:LINES,shapes:SHAPES,setShape,bloodMoon,current:()=>currentShape};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
