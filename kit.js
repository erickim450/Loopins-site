/* Loopins 5.3 — "Monte seu kit de IA".
 * Quiz curto (3 perguntas) que monta um kit pessoal usando o mesmo recomendador da pesquisa:
 * para cada interesse escolhido, roda um pedido representativo com as preferências da pessoa
 * e mostra a primeira opção, com o motivo. Nada é salvo nem enviado. */
(function(){
'use strict';
const E=window.NexusEngine;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const interests=[
 ['sites','Criar sites',{beginner:'Quero criar um site sem programar',any:'Quero criar um site',advanced:'Quero desenvolver um site em HTML, CSS e JavaScript'}],
 ['apps','Criar aplicativos',{beginner:'Quero criar um aplicativo com login e banco de dados sem programar',any:'Quero criar um aplicativo com login e banco de dados',advanced:'Quero programar um aplicativo'}],
 ['images','Imagens e artes',{any:'Quero criar ilustrações e imagens'}],
 ['posters','Cartazes com texto',{any:'Quero criar um cartaz com texto legível'}],
 ['video','Vídeos',{any:'Quero produzir um vídeo cinematográfico'}],
 ['avatar','Vídeo com apresentador',{any:'Quero fazer um vídeo com um apresentador virtual'}],
 ['music','Música',{any:'Quero compor uma música'}],
 ['voice','Narração',{any:'Quero gerar uma narração com voz natural'}],
 ['study','Estudar',{any:'Quero estudar com explicações e exercícios'}],
 ['math','Matemática',{any:'Quero resolver exercícios de matemática passo a passo'}],
 ['research','Pesquisa com fontes',{any:'Quero pesquisar na web com fontes'}],
 ['writing','Corrigir textos',{any:'Quero corrigir os erros de português do meu texto'}],
 ['translate','Traduzir',{any:'Quero traduzir um documento'}],
 ['slides','Apresentações',{any:'Quero criar uma apresentação'}],
 ['games','Jogos',{any:'Quero criar um jogo de plataforma',advanced:'Quero programar um jogo em JavaScript'}],
 ['3d','Modelos 3D',{any:'Quero criar um modelo 3D'}],
 ['automation','Automatizar tarefas',{any:'Quero automatizar o envio de e-mails a partir de uma planilha'}]
];
let answers={interests:[],experience:'any',budget:'free'};

function show(){
  $('workspace').innerHTML='<div class="workspace-heading"><span class="section-kicker">MONTE SEU KIT</span><h1 tabindex="-1">Qual é o seu kit de IA?</h1><p>Três perguntas rápidas. O Loopins monta um kit com a ferramenta mais adequada para cada coisa que você quer fazer, usando as mesmas regras e fontes da pesquisa.</p></div>'+
  '<form class="ws-block kit-form" id="kitForm"><fieldset><legend>1. O que você quer fazer com IA? <span class="ws-help">(escolha até 4)</span></legend><div class="kit-options">'+interests.map(([id,label])=>'<label class="kit-chip"><input type="checkbox" name="i" value="'+id+'"'+(answers.interests.includes(id)?' checked':'')+'><span>'+esc(label)+'</span></label>').join('')+'</div></fieldset>'+
  '<fieldset><legend>2. Você programa?</legend><div class="kit-options">'+[['beginner','Nunca programei'],['any','Sei um pouco'],['advanced','Sim, programo']].map(([v,l])=>'<label class="kit-chip"><input type="radio" name="e" value="'+v+'"'+(answers.experience===v?' checked':'')+'><span>'+l+'</span></label>').join('')+'</div></fieldset>'+
  '<fieldset><legend>3. Quanto quer gastar?</legend><div class="kit-options">'+[['free','Só opções grátis'],['any','Posso pagar se valer a pena']].map(([v,l])=>'<label class="kit-chip"><input type="radio" name="b" value="'+v+'"'+(answers.budget===v?' checked':'')+'><span>'+l+'</span></label>').join('')+'</div></fieldset>'+
  '<p class="kit-error" id="kitError" role="alert"></p><button class="primary-button kit-go" type="submit">Montar meu kit ✦</button></form><div id="kitResult" aria-live="polite"></div>';
  const form=$('kitForm');
  form.addEventListener('change',e=>{
    if(e.target.name==='i'){const checked=[...form.querySelectorAll('input[name="i"]:checked')];if(checked.length>4){e.target.checked=false;$('kitError').textContent='Escolha no máximo 4 interesses.';}else $('kitError').textContent='';}
  });
  form.onsubmit=e=>{
    e.preventDefault();
    const d=new FormData(form);answers={interests:d.getAll('i'),experience:d.get('e')||'any',budget:d.get('b')||'free'};
    if(!answers.interests.length){$('kitError').textContent='Escolha pelo menos um interesse.';return;}
    renderKit(build(answers));
  };
}
function build(a){
  const kit=[];
  for(const id of a.interests){
    const [,label,queries]=interests.find(x=>x[0]===id);
    const q=queries[a.experience]||queries.any;
    const prefs={experience:a.experience,budget:a.budget==='free'?'free':'any'};
    let r=E.recommend(q,null,prefs),paidFallback=false;
    if(!r.items.length&&a.budget==='free'){r=E.recommend(q,null,{experience:a.experience});paidFallback=true;}
    const top=r.items[0];
    kit.push({id,label,query:q,tool:top||null,alt:r.items[1]||null,paidFallback,why:top?.explanation?.why||'',plan:top?.accessDetails?.app?.note||''});
  }
  return kit;
}
function renderKit(kit){
  const out=$('kitResult');
  out.innerHTML='<div class="kit-result"><h2>Seu kit de IA</h2><div class="kit-grid">'+kit.map((k,i)=>'<article class="kit-card" style="--i:'+i+(k.tool?';--tool-start:'+k.tool.colors[0]+';--tool-end:'+k.tool.colors[1]:'')+'"><span class="kit-for">'+esc(k.label)+'</span>'+
   (k.tool?'<div class="kit-tool"><span class="tool-logo">'+esc(k.tool.initial)+'</span><div><h3>'+esc(k.tool.name)+'</h3><span>'+esc(k.tool.owner)+'</span></div></div><p>'+esc(k.why)+'</p>'+
   (k.paidFallback?'<p class="kit-warn">Nenhuma opção grátis confirmada para isso; esta é a mais adequada, verifique o plano.</p>':k.plan?'<p class="ws-help">'+esc(k.plan)+'</p>':'')+
   (k.alt?'<p class="ws-help">Alternativa: '+esc(k.alt.name)+'</p>':'')+'<div class="ws-actions"><button type="button" class="mini-button" data-kit-panel="'+esc(k.tool.id)+'">Ver detalhes</button><button type="button" class="mini-button" data-kit-search="'+esc(k.query)+'">Ver as 3 opções</button></div>'
   :'<p>Nenhuma ferramenta do catálogo tem as competências confirmadas para isso.</p>')+'</article>').join('')+'</div>'+
   '<div class="ws-actions"><button type="button" class="outline-button" id="kitCopy">Copiar meu kit</button><button type="button" class="text-button" id="kitAgain">Refazer</button></div><p class="ws-help">O kit usa o mesmo ranking da pesquisa: competências confirmadas em fontes oficiais, sem bônus por popularidade.</p></div>';
  out.querySelectorAll('[data-kit-panel]').forEach(b=>b.onclick=()=>window.NexusApp?.openPanel(b.dataset.kitPanel));
  out.querySelectorAll('[data-kit-search]').forEach(b=>b.onclick=()=>window.NexusApp?.submitSearch(b.dataset.kitSearch));
  $('kitCopy').onclick=()=>{const text='Meu kit de IA (Loopins)\n'+kit.map(k=>'- '+k.label+': '+(k.tool?k.tool.name:'sem opção confirmada')).join('\n');navigator.clipboard?.writeText(text).then(()=>window.NexusApp?.toast('Kit copiado!'),()=>window.NexusApp?.toast('Não foi possível copiar.'));};
  $('kitAgain').onclick=()=>{$('kitResult').innerHTML='';$('kitForm').scrollIntoView({block:'start'});};
  out.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});
  if(kit.some(k=>k.tool))celebrate();
}
/* Celebração curta (1,6 s). Não aparece com "reduzir movimento". */
function celebrate(){
  if(reduced()||typeof document.createElement('canvas').getContext!=='function')return;
  const c=document.createElement('canvas');c.className='confetti';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
  const ctx=c.getContext('2d');if(!ctx){c.remove();return;}
  const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;c.width=W*dpr;c.height=H*dpr;ctx.scale(dpr,dpr);
  const colors=['#8b7cff','#2ec4b6','#ff6fae','#ffc94d','#4dabf7','#9bd36a'];
  const parts=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*9,vy:-Math.random()*11-4,s:Math.random()*6+4,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:colors[Math.floor(Math.random()*colors.length)]}));
  const start=performance.now();
  const tick=now=>{const t=now-start;ctx.clearRect(0,0,W,H);
    for(const p of parts){p.vy+=.32;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.globalAlpha=Math.max(0,1-t/1600);ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();}
    if(t<1600)requestAnimationFrame(tick);else c.remove();};
  requestAnimationFrame(tick);
}
window.NexusKit={show,build,celebrate,interests};
})();
