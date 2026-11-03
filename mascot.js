/* Loopins 5.6 — Lobo guia (mascote).
 * Reage ao uso: fica atento enquanto você digita, uiva quando encontra IAs, dorme quando o site
 * fica parado e dá dicas ao ser clicado. Pode ser escondido (preferência "mascot").
 * Decorativo: as mensagens importantes continuam no próprio site. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const tips=[
 'Fale comigo pelo microfone na caixa de pesquisa: é só clicar e dizer o que você quer criar.',
 'Arraste o globo de estrelas para girar o universo de IAs.',
 'Projeto grande? Use “Monte sua alcateia” e cada IA ganha um papel.',
 'Clique em “Por que esta IA ficou em primeiro lugar?” para ver a conta.',
 'Aperte Ctrl + K para encontrar qualquer tela ou IA.',
 'Escreva do seu jeito: eu entendo “qro”, “pra” e erros de digitação.',
 'O botão “Apresentar” faz o Loopins se apresentar sozinho.'
];
const SVG='<svg viewBox="0 0 100 100" aria-hidden="true">'+
 '<defs><linearGradient id="mgBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b18dff"/><stop offset="1" stop-color="#58dccd"/></linearGradient></defs>'+
 '<g class="m-tail"><path d="M32 82 C18 80 10 70 12 56 C18 66 24 70 34 72 Z" fill="url(#mgBody)"/></g>'+
 '<path class="m-body" d="M30 94 C26 72 34 54 50 50 C66 48 72 66 70 94 Z" fill="url(#mgBody)"/>'+
 '<path d="M46 60 C52 66 58 66 62 58 L62 82 C56 84 50 84 46 80 Z" fill="#fff" opacity=".35"/>'+
 '<rect x="52" y="76" width="6" height="18" rx="3" fill="#7c79e6"/><rect x="61" y="76" width="6" height="18" rx="3" fill="#7c79e6"/>'+
 '<g class="m-head">'+
  '<path class="m-ear" d="M42 32 L44 12 L54 26 Z" fill="#8b7cff"/><path class="m-ear m-ear2" d="M56 26 L64 10 L68 30 Z" fill="#8b7cff"/>'+
  '<circle cx="55" cy="36" r="15" fill="url(#mgBody)"/>'+
  '<path d="M60 38 C66 34 76 36 80 40 C78 46 68 48 60 46 Z" fill="#e9ecff"/>'+
  '<circle cx="79" cy="40" r="2.6" fill="#1b1f33"/>'+
  '<ellipse class="m-eye" cx="58" cy="32" rx="2.2" ry="2.4" fill="#1b1f33"/>'+
  '<ellipse class="m-mouth" cx="72" cy="47" rx="3" ry="2.2" fill="#1b1f33"/>'+
 '</g></svg>';
let state='idle',idleTimer=null,stateTimer=null,tipIndex=0,bubbleTimer=null;
function setState(s,ms){
  const el=$('wolfGuide');if(!el)return;
  clearTimeout(stateTimer);el.dataset.state=s;state=s;
  if(ms)stateTimer=setTimeout(()=>setState('idle'),ms);
  resetIdle();
}
function resetIdle(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{setState('sleep');say('Zzz… me chame quando quiser.',0);},45000);}
function say(text,ms=4200){
  const b=$('wolfBubble');if(!b)return;
  b.textContent=text;b.hidden=false;clearTimeout(bubbleTimer);
  if(ms)bubbleTimer=setTimeout(()=>{b.hidden=true;},ms);
}
function enabled(){const st=window.NexusSettings?.read();return st?st.mascot!==false:true;}
function applyVisibility(){const el=$('wolfGuide');if(el)el.hidden=!enabled();}
function init(){
  const wrap=document.createElement('div');wrap.id='wolfGuide';wrap.className='wolf-guide';wrap.dataset.state='idle';
  wrap.innerHTML='<p class="wolf-bubble" id="wolfBubble" role="status" aria-live="polite" hidden></p><button type="button" class="wolf-body" id="wolfButton" aria-label="Lobo guia: clique para receber uma dica">'+SVG+'</button><button type="button" class="wolf-hide" id="wolfHide" aria-label="Esconder o lobo guia" title="Esconder (dá para mostrar de novo em Meu espaço)">×</button>';
  document.body.appendChild(wrap);applyVisibility();
  $('wolfButton').onclick=()=>{setState('alert',1600);say(tips[tipIndex++%tips.length],6000);};
  $('wolfHide').onclick=()=>{try{window.NexusSettings?.update(s=>{s.mascot=false;});}catch(_){/* sem armazenamento: esconde só agora */}wrap.hidden=true;window.NexusApp?.toast('Lobo guia escondido. Para mostrar de novo, use Meu espaço.');};
  // Reações.
  let typingTimer=null;
  document.addEventListener('input',e=>{if(e.target?.id!=='taskInput'&&e.target?.id!=='packInput')return;if(state!=='howl')setState('alert');clearTimeout(typingTimer);typingTimer=setTimeout(()=>{if(state==='alert')setState('idle');},1400);});
  document.addEventListener('loopins:results',e=>{
    const {count,top}=e.detail||{};
    if(count>0){setState('howl',1800);say(count===1?'Auuu! Achei '+top+'.':'Auuu! Achei '+count+' IAs. A primeira é '+top+'.');if(!reduced())window.NexusSound?.play('mascot');}
    else{setState('sad',2200);say('Hmm… nenhuma IA tem tudo isso confirmado. Tente tirar uma restrição.');}
  });
  ['pointerdown','keydown','scroll'].forEach(ev=>document.addEventListener(ev,()=>{if(state==='sleep'){setState('idle');const b=$('wolfBubble');if(b)b.hidden=true;}else resetIdle();},{passive:true}));
  // Pisca de vez em quando.
  setInterval(()=>{const el=$('wolfGuide');if(!el||reduced()||state==='sleep')return;el.classList.add('blink');setTimeout(()=>el.classList.remove('blink'),160);},4200);
  resetIdle();
  setTimeout(()=>{if(enabled()&&!document.body.classList.contains('presenting'))say('Oi! Sou o lobo guia do Loopins. Me diga o que você quer criar.',5200);},1500);
}
window.NexusMascot={setState,say,applyVisibility};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
