/* Loopins 6.0 — Loopino, o lobo guia (mascote).
 * Reage ao uso: fica atento enquanto você digita, uiva quando encontra IAs, usa um acessório
 * para cada tipo de pedido, corre quando a página rola, dorme quando o site fica parado e dá
 * dicas ao ser clicado. Veste uma roupa especial em datas comemorativas e fecha o telão rápido
 * uivando no centro da tela. Pode ser escondido (preferência "mascot").
 * Decorativo: as mensagens importantes continuam no próprio site. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=v=>String(v).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const NAME='Loopino';
const tips=[
 'Fale comigo pelo microfone na caixa de pesquisa: é só clicar e dizer o que você quer criar.',
 'Arraste o globo de estrelas para girar o universo de IAs.',
 'Projeto grande? Use “Monte sua alcateia” e cada IA ganha um papel.',
 'Clique em “Por que esta IA ficou em primeiro lugar?” para ver a conta.',
 'Aperte Ctrl + K para encontrar qualquer tela ou IA.',
 'Escreva do seu jeito: eu entendo “qro”, “pra” e erros de digitação.',
 'Repare: eu troco de acessório conforme o seu pedido. Óculos para programar, fones para áudio…',
 'Quer me conhecer melhor? Abra “Conheça o Loopino” no menu lateral.'
];

/* Acessório por família de pedido. */
const GEAR={code:'code',data:'code',automation:'code',agents:'code',audio:'audio',image:'image',design:'image',video:'video',study:'study',research:'study'};
const GEAR_INFO={
 code:{label:'Óculos de programador',when:'Programação, dados, automação e agentes'},
 audio:{label:'Fones de ouvido',when:'Narração, música, transcrição e áudio'},
 image:{label:'Pincel',when:'Imagens, logotipos e design'},
 video:{label:'Claquete',when:'Vídeos, cortes e legendas'},
 study:{label:'Capelo de formatura',when:'Estudos e pesquisa'}
};
/* Roupa do dia (só visual). 3 de novembro: dia em que o site ganhou o nome Loopins. */
const OUTFIT_INFO={
 party:{label:'Chapéu de festa',when:'Aniversário da Loopins (3 de novembro) e Ano-Novo (31/12 e 1º/1)'},
 xmas:{label:'Gorro de Natal',when:'Dezembro'},
 junina:{label:'Chapéu de palha',when:'Junho, mês das festas juninas'},
 winter:{label:'Cachecol',when:'Julho e agosto, inverno no Brasil'}
};
function outfitFor(d=new Date()){
 const m=d.getMonth()+1,day=d.getDate();
 if((m===11&&day===3)||(m===12&&day===31)||(m===1&&day===1))return 'party';
 if(m===12)return 'xmas';
 if(m===6)return 'junina';
 if(m===7||m===8)return 'winter';
 return '';
}
function outfitReason(d=new Date()){
 const m=d.getMonth()+1,day=d.getDate(),o=outfitFor(d);
 if(o==='party')return m===11?'hoje é aniversário da Loopins: o site ganhou esse nome em 3 de novembro':'é Ano-Novo';
 return {xmas:'é mês de Natal',junina:'é mês das festas juninas',winter:'é inverno no Brasil'}[o]||'';
}
const OUTFIT_GREETING={party:' Hoje é dia de festa na alcateia!',xmas:' Feliz Natal!',junina:' Arraiá da Loopins!',winter:' Que frio, hein? Por isso o cachecol.'};

// Ids únicos por desenho: um gradiente dentro de um trecho oculto (display:none) não pinta as outras cópias.
let uid=0;
function svg(){
 const n=++uid;
 return ('<svg viewBox="-4 -8 104 108" aria-hidden="true">'+
 '<defs><linearGradient id="mgBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b18dff"/><stop offset="1" stop-color="#58dccd"/></linearGradient>'+
 '<linearGradient id="mgParty" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6fb1"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>'+
 '<g class="m-speed"><line x1="2" y1="58" x2="16" y2="58"/><line x1="-6" y1="70" x2="10" y2="70"/><line x1="4" y1="83" x2="18" y2="83"/></g>'+
 '<g class="m-dust"><circle cx="38" cy="95" r="3.2"/><circle cx="56" cy="96" r="2.4"/><circle cx="46" cy="97" r="1.8"/></g>'+
 '<g class="m-all">'+
 '<g class="m-hind"><rect class="m-leg m-leg3" x="33" y="76" width="6" height="18" rx="3" fill="#6d6ad8"/><rect class="m-leg m-leg4" x="41" y="76" width="6" height="18" rx="3" fill="#6d6ad8"/></g>'+
 '<g class="m-tail"><path d="M32 82 C18 80 10 70 12 56 C18 66 24 70 34 72 Z" fill="url(#mgBody)"/></g>'+
 '<path class="m-body" d="M30 94 C26 72 34 54 50 50 C66 48 72 66 70 94 Z" fill="url(#mgBody)"/>'+
 '<path d="M46 60 C52 66 58 66 62 58 L62 82 C56 84 50 84 46 80 Z" fill="#fff" opacity=".35"/>'+
 // Cachecol (roupa de inverno) no pescoço.
 '<g class="outfit outfit-winter"><path d="M43 52 Q56 60 69 49 L71 56 Q56 66 42 58 Z" fill="#e2564f"/><path d="M58 58 L56 74 L62 74 L64 57 Z" fill="#c9443e"/><path d="M56 70 L62 70" stroke="#ffd7d4" stroke-width="1.4"/></g>'+
 '<rect class="m-leg m-leg1" x="52" y="76" width="6" height="18" rx="3" fill="#7c79e6"/><rect class="m-leg m-leg2" x="61" y="76" width="6" height="18" rx="3" fill="#7c79e6"/>'+
 // Acessórios segurados pela pata.
 '<g class="acc acc-image"><path d="M62 76 L80 56" stroke="#a0673a" stroke-width="3.2" stroke-linecap="round"/><path d="M79 57 L83 52.6" stroke="#c9ced8" stroke-width="3.6"/><path d="M82.4 53.2 C84.5 49.5 88 48 90 46.5 C89.3 50 87.6 53.4 84.4 55.4 Z" fill="#7ae6de"/><circle cx="88" cy="58" r="1.6" fill="#ff6fb1"/><circle cx="91" cy="53" r="1.1" fill="#ffd23f"/></g>'+
 '<g class="acc acc-video"><g transform="rotate(-12 76 66)"><rect x="66" y="62" width="21" height="14" rx="2" fill="#1b1f33"/><path d="M66 62 L87 62 L87 56.4 L66 58.6 Z" fill="#e9ecff"/><path d="M70.5 58.1 L72.5 62 M76 57.5 L78 62 M81.5 56.9 L83.5 62" stroke="#1b1f33" stroke-width="1.7"/><rect x="69" y="66.5" width="15" height="1.6" rx=".8" fill="#e9ecff" opacity=".6"/><rect x="69" y="70" width="10" height="1.6" rx=".8" fill="#e9ecff" opacity=".6"/></g></g>'+
 '<g class="m-head">'+
  '<path class="m-ear" d="M42 32 L44 12 L54 26 Z" fill="#8b7cff"/><path class="m-ear m-ear2" d="M56 26 L64 10 L68 30 Z" fill="#8b7cff"/>'+
  '<circle cx="55" cy="36" r="15" fill="url(#mgBody)"/>'+
  '<path d="M60 38 C66 34 76 36 80 40 C78 46 68 48 60 46 Z" fill="#e9ecff"/>'+
  '<circle cx="79" cy="40" r="2.6" fill="#1b1f33"/>'+
  '<ellipse class="m-eye" cx="58" cy="32" rx="2.2" ry="2.4" fill="#1b1f33"/>'+
  '<ellipse class="m-mouth" cx="72" cy="47" rx="3" ry="2.2" fill="#1b1f33"/>'+
  // Roupas na cabeça.
  '<g class="outfit outfit-head outfit-party"><path d="M48 23 L57 -4 L65 22 Z" fill="url(#mgParty)"/><path d="M51 15 L62 13 M53.5 8 L60 6.8" stroke="#fff" stroke-width="1.6" opacity=".85"/><circle cx="57" cy="-4.5" r="3" fill="#ffd23f"/></g>'+
  '<g class="outfit outfit-head outfit-xmas"><path d="M43 25 Q49 2 70 4 Q78 6 77 14 L68 24 Z" fill="#e23b4a"/><rect x="41" y="21" width="31" height="6.5" rx="3.2" fill="#fff"/><circle cx="77.5" cy="14.5" r="3.6" fill="#fff"/></g>'+
  '<g class="outfit outfit-head outfit-junina"><path d="M46 21 Q57 1 68 21 Z" fill="#e8b85a"/><ellipse cx="57" cy="21.5" rx="18" ry="4.2" fill="#d9a441"/><path d="M47.5 18 L66.5 18" stroke="#c0392b" stroke-width="2"/><path d="M50 21 L53 21 M58 22 L61 22 M65 21 L67 21" stroke="#a67c2e" stroke-width="1"/></g>'+
  // Acessórios na cabeça.
  '<g class="acc acc-code"><circle cx="58.5" cy="32" r="5.4" fill="rgba(190,235,255,.28)" stroke="#1b1f33" stroke-width="1.9"/><circle cx="68.8" cy="33.4" r="4.2" fill="rgba(190,235,255,.28)" stroke="#1b1f33" stroke-width="1.7"/><path d="M63.8 32.4 L64.7 32.6" stroke="#1b1f33" stroke-width="1.7"/><path d="M53.2 31 L44 28.6" stroke="#1b1f33" stroke-width="1.7" stroke-linecap="round"/></g>'+
  '<g class="acc acc-audio"><path d="M44.5 33 C42 13 66 6 70.5 25" fill="none" stroke="#2b2f4a" stroke-width="3.4" stroke-linecap="round"/><rect x="39.5" y="29" width="9" height="13" rx="4.5" fill="#2b2f4a"/><rect x="41.4" y="31.2" width="5.2" height="8.6" rx="2.6" fill="#7ae6de"/></g>'+
  '<g class="acc acc-study"><path d="M39 15 L58 7.5 L77 15 L58 22.5 Z" fill="#1b1f33"/><path d="M49 18 L49 24 Q58 28 67 24 L67 18 Z" fill="#1b1f33"/><path d="M77 15 L78 27" stroke="#f2c14e" stroke-width="1.7"/><circle cx="78" cy="28.4" r="2" fill="#f2c14e"/></g>'+
 '</g></g></svg>').replace(/mgBody/g,'mgBody'+n).replace(/mgParty/g,'mgParty'+n);
}
/* Desenho avulso (para o cartão de resultado): só o acessório e a roupa pedidos, sem depender do CSS. */
function svgFor({gear='',outfit=''}={}){
  if(typeof DOMParser!=='function')return '';
  const doc=new DOMParser().parseFromString(svg().replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="400" height="415" '),'image/svg+xml'),root=doc.documentElement;
  const drop=sel=>root.querySelectorAll(sel).forEach(n=>n.remove());
  drop('.m-speed,.m-dust,.m-hind,.m-mouth');
  root.querySelectorAll('.acc').forEach(n=>{if(!n.classList.contains('acc-'+gear))n.remove();});
  const headGear=gear==='audio'||gear==='study';
  root.querySelectorAll('.outfit').forEach(n=>{if(!n.classList.contains('outfit-'+outfit)||(headGear&&n.classList.contains('outfit-head')))n.remove();});
  return new XMLSerializer().serializeToString(root);
}
let state='idle',idleTimer=null,stateTimer=null,tipIndex=0,bubbleTimer=null,staging=false,stageTimer=null;
function setState(s,ms){
  const el=$('wolfGuide');if(!el)return;
  clearTimeout(stateTimer);el.dataset.state=s;state=s;
  if(ms)stateTimer=setTimeout(()=>setState('idle'),ms);
  resetIdle();
}
/* Apelido salvo em “Meu espaço” (nexus:profile:v2). Sem apelido, ele fala sem nome. */
function userName(){try{const n=window.NexusStore?.read('nexus:profile:v2',{})?.name;return typeof n==='string'?n.replace(/\s+/g,' ').trim().slice(0,48):'';}catch(_){return '';}}
const withName=(before,after='')=>{const n=userName();return n?before+', '+n+after:before+after;};
function resetIdle(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(staging)return;setState('sleep');say(withName('Zzz… me chame quando quiser','.'),0);},45000);}
/* Truques escondidos: digitar “loopino” ou “auuu” na busca. Retorna true quando era um truque. */
function easterEgg(text){
  const t=String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[!.?\s]+/g,'');
  const el=$('wolfGuide');
  if(/^loopino$/.test(t)){
    if(el&&!el.hidden){el.classList.remove('flip');void el.offsetWidth;el.classList.add('flip');setTimeout(()=>el.classList.remove('flip'),1300);setState('alert',1400);say(withName('Me chamou','? ')+'Olha a minha cambalhota!',4200);}
    return true;
  }
  if(/^a+u{2,}$/.test(t)){
    window.NexusNightSky?.bloodMoon?.();window.NexusSound?.packHowl?.();
    if(el&&!el.hidden){setState('howl',3200);say('AUUUU! A alcateia inteira respondeu!',5000);}
    window.scrollTo({top:0,behavior:reduced()?'auto':'smooth'});
    return true;
  }
  return false;
}
/* Chamado por Meu espaço ao salvar o apelido. */
function nameSaved(){const n=userName(),el=$('wolfGuide');if(!el||el.hidden)return;setState('howl',1800);say(n?'Prazer, '+n+'! Agora eu sei o seu nome. Auuu!':'Tudo bem, vou te chamar só de “você”.',5200);if(!reduced())window.NexusSound?.play('mascot');}
function say(text,ms=4200){
  const b=$('wolfBubble');if(!b)return;
  b.textContent=text;b.hidden=false;clearTimeout(bubbleTimer);
  if(ms)bubbleTimer=setTimeout(()=>{b.hidden=true;},ms);
}
function setGear(family){const el=$('wolfGuide');if(!el)return;const g=GEAR[family]||'';if(g)el.dataset.gear=g;else delete el.dataset.gear;}
function enabled(){const st=window.NexusSettings?.read();return st?st.mascot!==false:true;}
function applyVisibility(){const el=$('wolfGuide');if(el)el.hidden=!enabled();}
function metBefore(){try{const seen=localStorage.getItem('nexus:loopino:met');localStorage.setItem('nexus:loopino:met','1');return !!seen;}catch(_){return false;}}
/* Telão: o Loopino corre até o centro da tela e uiva para a lua. */
function stage(on){
  const el=$('wolfGuide');if(!el)return;
  clearTimeout(stageTimer);
  if(!on){staging=false;el.classList.remove('on-stage');if(state==='run'||state==='howl')setState('idle');return;}
  if(el.hidden)return;
  staging=true;el.classList.add('on-stage');
  if(reduced()){setState('howl',3000);say('Auuu! Obrigado por assistirem!',5000);return;}
  el.dataset.dir='up';clearTimeout(stateTimer);el.dataset.state='run';state='run';
  stageTimer=setTimeout(()=>{el.dataset.dir='down';setState('howl',3200);say('Auuu! Obrigado por assistirem!',5000);window.NexusSound?.play('mascot');},1350);
}
function art(gear='',outfit='',size=''){return '<div class="loopino-art'+(size?' '+size:'')+'"'+(gear?' data-gear="'+gear+'"':'')+(outfit?' data-outfit="'+outfit+'"':'')+'>'+svg()+'</div>';}
/* Página “Conheça o Loopino”. */
function showPage(){
  const w=$('workspace');if(!w)return;const today=outfitFor();
  const gearCards=Object.entries(GEAR_INFO).map(([k,v])=>'<li class="loopino-card">'+art(k,'','small')+'<strong>'+esc(v.label)+'</strong><span>'+esc(v.when)+'</span></li>').join('');
  const outfitCards=Object.entries(OUTFIT_INFO).map(([k,v])=>'<li class="loopino-card'+(k===today?' is-today':'')+'">'+art('',k,'small')+'<strong>'+esc(v.label)+(k===today?' · hoje':'')+'</strong><span>'+esc(v.when)+'</span></li>').join('');
  w.innerHTML='<div class="workspace-heading"><span class="section-kicker">MASCOTE</span><h1 tabindex="-1">Conheça o '+NAME+'</h1><p>O lobo guia da Loopins.</p></div>'+
  '<div class="ws-block loopino-hero">'+art('',today,'big')+'<div><h2>Quem é o '+NAME+'</h2><p><strong>Loopins</strong> quer dizer <em>alcateia de lobos</em>: várias IAs trabalhando juntas, cada uma no seu papel. O '+NAME+' é o lobo que guia essa alcateia. Ele fareja o seu pedido e aponta as IAs certas para ele.</p>'+
  '<p class="loopino-today">'+(today?'Roupa de hoje: <strong>'+esc(OUTFIT_INFO[today].label)+'</strong>, porque '+esc(outfitReason())+'.':'Hoje ele está sem roupa especial: as roupas aparecem em datas comemorativas.')+'</p>'+
  '<button class="outline-button loopino-howl" id="loopinoHowl" type="button">Ouvir o uivo do '+NAME+'</button></div></div>'+
  '<div class="ws-block"><h2>O que ele faz</h2><ul class="loopino-list"><li>Fica atento enquanto você digita.</li><li>Uiva quando encontra IAs e fica triste quando nenhuma serve.</li><li>Troca de acessório conforme o tipo do seu pedido.</li><li>Corre quando você rola a página e senta quando você para.</li><li>Dorme depois de 45 segundos sem uso e acorda quando você volta.</li><li>Te chama pelo apelido salvo em Meu espaço e cumprimenta conforme a hora do dia.</li><li>Tem truques escondidos… experimente digitar o nome dele na busca.</li><li>Dá uma dica cada vez que você clica nele.</li><li>Fecha o telão rápido correndo até o centro da tela e uivando para a lua.</li></ul></div>'+
  '<div class="ws-block"><h2>Um acessório para cada pedido</h2><ul class="loopino-grid">'+gearCards+'</ul></div>'+
  '<div class="ws-block"><h2>Roupa do dia</h2><p class="ws-help">Só visual: em algumas datas ele aparece arrumado. Quando o pedido pede um acessório na cabeça, o acessório vence.</p><ul class="loopino-grid">'+outfitCards+'</ul></div>'+
  '<p class="ws-help">Quer esconder o '+NAME+'? Passe o mouse sobre ele e clique no ×, ou desmarque em Meu espaço.</p>';
  $('loopinoHowl').onclick=()=>{window.NexusSound?.play('mascot');const el=$('wolfGuide');if(el&&!el.hidden){setState('howl',1800);say('Auuu!',2000);}};
}
function init(){
  const wrap=document.createElement('div');wrap.id='wolfGuide';wrap.className='wolf-guide';wrap.dataset.state='idle';
  const outfit=outfitFor();if(outfit)wrap.dataset.outfit=outfit;
  wrap.innerHTML='<p class="wolf-bubble" id="wolfBubble" role="status" aria-live="polite" hidden></p><button type="button" class="wolf-body" id="wolfButton" aria-label="'+NAME+', o lobo guia: clique para receber uma dica">'+svg()+'</button><button type="button" class="wolf-hide" id="wolfHide" aria-label="Esconder o '+NAME+'" title="Esconder (dá para mostrar de novo em Meu espaço)">×</button>';
  document.body.appendChild(wrap);applyVisibility();
  $('wolfButton').onclick=()=>{setState('alert',1600);say(tips[tipIndex++%tips.length],6000);};
  $('wolfHide').onclick=()=>{try{window.NexusSettings?.update(s=>{s.mascot=false;});}catch(_){/* sem armazenamento: esconde só agora */}wrap.hidden=true;window.NexusApp?.toast(NAME+' escondido. Para mostrar de novo, use Meu espaço.');};
  // Reações.
  let typingTimer=null;
  document.addEventListener('input',e=>{if(e.target?.id!=='taskInput'&&e.target?.id!=='packInput')return;if(e.target.id==='taskInput'&&!e.target.value.trim())setGear('');if(state!=='howl'&&!staging)setState('alert');clearTimeout(typingTimer);typingTimer=setTimeout(()=>{if(state==='alert')setState('idle');},1400);});
  document.addEventListener('loopins:results',e=>{
    const {count,top,family}=e.detail||{};
    if(count>0){setGear(family);setState('howl',1800);say(withName('Auuu','! ')+(count===1?'Achei '+top+'.':'Achei '+count+' IAs. A primeira é '+top+'.'));if(!reduced())window.NexusSound?.play('mascot');}
    else{setGear('');setState('sad',2200);say(withName('Hmm','… ')+'nenhuma IA tem tudo isso confirmado. Tente tirar uma restrição.');}
  });
  ['pointerdown','keydown','scroll'].forEach(ev=>document.addEventListener(ev,()=>{if(state==='sleep'){setState('idle');const b=$('wolfBubble');if(b)b.hidden=true;}else resetIdle();},{passive:true}));
  // Corre enquanto a página rola (virado para o sentido da rolagem) e senta quando ela para.
  let lastY=window.scrollY,runStop=null;
  window.addEventListener('scroll',()=>{
    const el=$('wolfGuide'),y=window.scrollY,dy=y-lastY;lastY=y;
    if(!el||el.hidden||staging||reduced()||state==='howl'||Math.abs(dy)<2)return;
    el.dataset.dir=dy>0?'down':'up';
    if(state!=='run'){clearTimeout(stateTimer);el.dataset.state='run';state='run';}
    clearTimeout(runStop);runStop=setTimeout(()=>{if(state==='run'&&!staging)setState('sit',800);},260);
    resetIdle();
  },{passive:true});
  // Pisca de vez em quando.
  setInterval(()=>{const el=$('wolfGuide');if(!el||reduced()||state==='sleep')return;el.classList.add('blink');setTimeout(()=>el.classList.remove('blink'),160);},4200);
  resetIdle();
  // Apresentação: completa na primeira visita, curta nas seguintes.
  const h=new Date().getHours(),late=h<5,hello=late?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  const greeting=(metBefore()?withName(hello,'! ')+'O '+NAME+' voltou. O que vamos criar hoje?':withName(hello,'! ')+'Eu sou o '+NAME+', o lobo guia da Loopins. Me diga o que você quer criar que eu farejo as IAs certas.'+(userName()?'':' Dica: salve seu apelido em Meu espaço que eu te chamo pelo nome.'))+(late?' *bocejo* Lobo também precisa dormir… mas por você eu fico acordado.':'')+(OUTFIT_GREETING[outfit]||'');
  setTimeout(()=>{if(enabled()&&!document.body.classList.contains('presenting')){say(greeting,late?8000:6500);if(late){setState('sleep',1400);}}},1500);
}
window.NexusMascot={name:NAME,setState,say,applyVisibility,setGear,stage,showPage,outfitFor,outfitReason,gear:GEAR,userName,nameSaved,easterEgg,svgFor};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
