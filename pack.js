/* Loopins 5.6 — "Monte sua alcateia".
 * Para um projeto com várias partes, cada parte vira um lobo com um papel e a IA mais adequada
 * (mesmo recomendador da pesquisa). Os lobos entram correndo e se posicionam em V atrás do líder.
 * Dentro da alcateia, cada papel usa a melhor opção entre as 3 recomendadas que ainda não esteja
 * em outro papel, para dividir o trabalho; isso é dito na tela. */
(function(){
'use strict';
const E=window.NexusEngine;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const RUN='M4 34 C18 28 36 30 52 38 C76 30 108 28 134 32 L146 26 L150 10 L157 22 L162 12 L166 24 L176 24 L200 32 L198 38 L178 41 L172 49 C166 55 158 58 150 60 L172 76 L180 80 L176 86 L164 82 L140 68 L147 85 L141 88 L131 70 L104 68 L110 86 L104 89 L94 70 L82 72 L58 86 L48 92 L42 88 L66 66 L56 56 C46 50 30 46 16 44 C10 42 6 38 4 34 Z';
const ROLES=[
 {id:'build',re:/\b(site|sites|app|aplicativo|sistema|plataforma|loja virtual|jogo|jogos|game)\b/,role:'Construtor',task:n=>/\b(jogo|jogos|game)\b/.test(n)?'Quero criar um jogo':/\b(app|aplicativo|sistema|plataforma)\b/.test(n)?'Quero criar um aplicativo com login e banco de dados':'Quero criar um site'},
 {id:'art',re:/\b(logo|logotipo|imagem|imagens|arte|artes|ilustracao|ilustracoes|personagem|personagens|cartaz|capa|identidade visual)\b/,role:'Artista',task:n=>/\b(logo|logotipo)\b/.test(n)?'Quero criar um logotipo vetorial editável':'Quero criar ilustrações'},
 {id:'video',re:/\b(video|videos|trailer|clipe|animacao|filme)\b/,role:'Diretor de vídeo',task:n=>/\b(demonstr\w*|tela|tutorial)\b/.test(n)?'Quero criar um vídeo mostrando o funcionamento do meu site':'Quero produzir um vídeo cinematográfico'},
 {id:'music',re:/\b(musica|musicas|trilha|trilha sonora|cancao|efeitos sonoros)\b/,role:'Músico',task:()=>'Quero compor uma música'},
 {id:'voice',re:/\b(narracao|narrador|voz|locucao|dublagem)\b/,role:'Voz',task:()=>'Quero gerar uma narração com voz natural'},
 {id:'writer',re:/\b(roteiro|historia|textos|post|posts|descricoes)\b/,role:'Roteirista',task:()=>'Quero escrever um roteiro'},
 {id:'slides',re:/\b(apresentacao|slides)\b/,role:'Apresentador',task:()=>'Quero criar uma apresentação'},
 {id:'scout',re:/\b(pesquisa|pesquisar|fontes|artigos)\b/,role:'Batedor',task:()=>'Quero pesquisar na web com fontes'},
 {id:'translator',re:/\b(traduzir|traducao|ingles|espanhol|idiomas)\b/,role:'Tradutor',task:()=>'Quero traduzir textos'},
 {id:'sculptor',re:/\b(3d|tridimensional)\b/,role:'Escultor 3D',task:()=>'Quero criar um modelo 3D'},
 {id:'guardian',re:/\b(chatbot|atendimento|whatsapp)\b/,role:'Guardião do atendimento',task:()=>'Quero criar um chatbot de atendimento para o WhatsApp'},
 {id:'analyst',re:/\b(planilha|dados|graficos)\b/,role:'Analista',task:()=>'Quero analisar uma planilha e fazer gráficos'},
 {id:'messenger',re:/\b(automatizar|automacao)\b/,role:'Mensageiro',task:()=>'Quero automatizar tarefas entre aplicativos'}
];
const LEADER={id:'leader',role:'Líder da alcateia',query:'Quero planejar um projeto e escrever o roteiro',job:'Planeja o projeto, divide as tarefas e escreve os pedidos para os outros lobos.'};

function build(text,{free=false}={}){
  const n=E.normalize(text),noCode=/sem (?:saber )?programar|nao sei programar|no.?code/.test(n),prefs=free?{budget:'free'}:{};
  const parts=[{...LEADER}];
  for(const r of ROLES)if(r.re.test(n)&&parts.length<6){let q=r.task(n);if(r.id==='build'&&noCode&&!/jogo/.test(q))q+=' sem programar';parts.push({id:r.id,role:r.role,query:q});}
  if(parts.length===1){const main=E.recommend(text,null,prefs);if(main.items.length)parts.push({id:'specialist',role:'Especialista',query:text});}
  const used=new Set(),pack=[];
  for(const p of parts){
    let r=E.recommend(p.query,null,prefs),paidFallback=false;
    if(!r.items.length&&free){r=E.recommend(p.query);paidFallback=true;}
    const pick=r.items.find(t=>!used.has(t.id))||r.items[0];
    if(!pick)continue;
    used.add(pick.id);
    pack.push({...p,tool:pick,shared:r.items[0]?.id!==pick.id,options:r.items.map(t=>t.name),paidFallback,why:pick.explanation?.why||'',job:p.job||('Cuida de: '+r.intent.deliverable+'.')});
  }
  return pack;
}

/* ── Cena: lobos correndo até a formação em V ── */
let scene=null;
function animate(canvas,pack){
  scene?.stop();
  const ctx=canvas.getContext&&canvas.getContext('2d');if(!ctx)return;
  const wolf=new Path2D(RUN),G=window.NexusGalaxy;
  let w=0,h=0,dpr=1,raf=0,start=performance.now(),howled=false,hover=-1;
  const colorOf=t=>G?G.colors[G.familyOf(t)]:'#a49bff';
  function size(){const r=canvas.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);w=r.width;h=r.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  size();
  const targets=()=>{const k=Math.min(1,w/900),lx=w*.76,ly=h*.42;return pack.map((_,i)=>{if(!i)return {x:lx,y:ly,s:.68*Math.max(.6,k)};const row=Math.ceil(i/2),side=i%2?-1:1;return {x:lx-row*185*Math.max(.5,k),y:row>=3?ly:ly+side*row*66*Math.max(.7,k),s:.56*Math.max(.6,k)};});};
  const easeOut=t=>1-Math.pow(1-t,3);
  function frame(now){
    if(!canvas.isConnected){stop();return;}
    const t=reduced()?1e6:now-start,light=document.documentElement.dataset.theme==='light';ctx.clearRect(0,0,w,h);
    const T=targets(),arrive=i=>Math.min(1,Math.max(0,(t-i*140)/1700));
    // Chão e poeira.
    ctx.strokeStyle=light?'rgba(60,60,120,.12)':'rgba(200,200,255,.08)';ctx.setLineDash([4,10]);ctx.beginPath();ctx.moveTo(0,h*.88);ctx.lineTo(w,h*.88);ctx.stroke();ctx.setLineDash([]);
    // Trilhas do líder até cada lobo (aparecem depois da chegada).
    pack.forEach((p,i)=>{if(!i)return;const a=Math.max(0,Math.min(1,(t-1900-i*120)/500));if(!a)return;
      ctx.strokeStyle=hexA(colorOf(p.tool),.45*a);ctx.lineWidth=1.5;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(T[0].x,T[0].y+10);ctx.lineTo(T[i].x+40*T[i].s,T[i].y+10);ctx.stroke();ctx.setLineDash([]);});
    pack.forEach((p,i)=>{
      const k=easeOut(arrive(i)),tg=T[i],x=-260+(tg.x+260)*k,running=k<1;
      const bob=running?Math.sin(t/55+i)*5:Math.sin(t/700+i)*1.2,y=tg.y+bob,rot=running?Math.sin(t/55+i)*.06:0,col=colorOf(p.tool),s=tg.s*(hover===i?1.08:1);
      p._hit={x:x-100*s,y:y-50*s,w:205*s,h:100*s};
      ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.translate(-100,-50);
      ctx.shadowColor=col;ctx.shadowBlur=i?14:28;ctx.fillStyle=hexA(col,.95);ctx.fill(wolf);ctx.shadowBlur=0;
      ctx.restore();
      if(running&&!reduced()){for(let d=0;d<3;d++){ctx.fillStyle=hexA(col,.18-d*.05);ctx.beginPath();ctx.arc(x-90*s-d*16,y+38*s+Math.sin(t/40+d)*2,4-d,0,Math.PI*2);ctx.fill();}}
      // Rótulo.
      const la=Math.max(0,Math.min(1,(t-1500-i*140)/400));if(!la)return;
      ctx.globalAlpha=la;ctx.textAlign='center';
      ctx.font='800 '+(i?11:12)+'px "DM Sans",system-ui,sans-serif';ctx.fillStyle=light?'#4f5870':'#b9c1d9';ctx.fillText((i?'':'★ ')+p.role.toUpperCase(),x,y+52*s+16);
      ctx.font='700 '+(i?13:15)+'px "DM Sans",system-ui,sans-serif';ctx.fillStyle=light?'#171a2b':'#fff';ctx.fillText(p.tool.name,x,y+52*s+33);
      ctx.globalAlpha=1;
    });
    if(!howled&&t>2000){howled=true;if(!reduced())window.NexusSound?.packHowl();}
    raf=requestAnimationFrame(frame);
  }
  const onMove=e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;hover=pack.findIndex(p=>p._hit&&x>p._hit.x&&x<p._hit.x+p._hit.w&&y>p._hit.y&&y<p._hit.y+p._hit.h);canvas.style.cursor=hover>=0?'pointer':'default';canvas.title=hover>=0?pack[hover].role+': '+pack[hover].tool.name:'';};
  const onClick=()=>{if(hover>=0)window.NexusApp?.openPanel(pack[hover].tool.id);};
  canvas.addEventListener('pointermove',onMove);canvas.addEventListener('click',onClick);
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(size):null;ro?.observe(canvas);
  raf=requestAnimationFrame(frame);
  function stop(){cancelAnimationFrame(raf);ro?.disconnect();canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('click',onClick);}
  scene={stop,replay(){start=performance.now();howled=false;}};
}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}

function show(prefill){
  $('workspace').innerHTML='<div class="workspace-heading"><span class="section-kicker">MONTE SUA ALCATEIA</span><h1 tabindex="-1">Um projeto grande pede uma alcateia</h1><p>Descreva um projeto com várias partes. O Loopins dá um papel para cada IA, como numa alcateia: o líder planeja e cada lobo cuida de uma parte.</p></div>'+
  '<form class="ws-block pack-form" id="packForm"><label class="ws-field"><span>Seu projeto</span><textarea id="packInput" rows="2" maxlength="600" placeholder="Ex.: quero criar um jogo de plataforma com música própria, um trailer e um logotipo"></textarea></label>'+
  '<div class="pack-row"><label class="ws-checkbox"><input type="checkbox" id="packFree"> Só opções com plano gratuito documentado</label><button class="primary-button" type="submit">Reunir a alcateia 🐺</button></div>'+
  '<div class="prompt-examples">'+['Quero criar um jogo de plataforma com música própria, um trailer e um logotipo','Quero lançar um canal de vídeos com roteiro, narração e trilha sonora','Quero abrir uma loja virtual com logotipo, chatbot de atendimento e fotos dos produtos','Quero fazer um trabalho escolar com pesquisa, apresentação e tradução para o inglês'].map(q=>'<button type="button" data-pack-example="'+esc(q)+'">'+esc(q)+'</button>').join('')+'</div></form>'+
  '<div id="packOut" aria-live="polite"></div>';
  const run=()=>{const text=$('packInput').value.trim();if(text.length<6){window.NexusApp?.toast('Descreva o projeto.');return;}render(build(text,{free:$('packFree').checked}),text);};
  $('packForm').onsubmit=e=>{e.preventDefault();run();};
  $('workspace').querySelectorAll('[data-pack-example]').forEach(b=>b.onclick=()=>{$('packInput').value=b.dataset.packExample;run();});
  if(prefill){$('packInput').value=prefill;run();}
}
function render(pack,text){
  const out=$('packOut');
  if(pack.length<2){out.innerHTML='<div class="ws-empty">Não identifiquei partes suficientes. Descreva o que o projeto precisa (ex.: site, logotipo, vídeo, música).</div>';return;}
  out.innerHTML='<div class="pack-stage"><canvas id="packCanvas" aria-hidden="true"></canvas></div>'+
  '<div class="pack-list">'+pack.map((p,i)=>'<article class="pack-card" style="--i:'+i+'"><span class="pack-role">'+(i?'':'★ ')+esc(p.role)+'</span><h3>'+esc(p.tool.name)+'</h3><p>'+esc(p.job)+'</p>'+
    (p.paidFallback?'<p class="kit-warn">Sem opção grátis confirmada para esta parte; verifique o plano.</p>':'')+
    (p.shared?'<p class="ws-help">A 1ª opção para esta parte ('+esc(p.options[0])+') já está em outro papel; usamos a próxima entre as recomendadas.</p>':'')+
    '<div class="ws-actions"><button type="button" class="mini-button" data-pack-panel="'+esc(p.tool.id)+'">Ver detalhes</button><button type="button" class="mini-button" data-pack-search="'+esc(p.query)+'">Ver opções</button></div></article>').join('')+'</div>'+
  '<div class="ws-actions"><button type="button" class="outline-button" id="packReplay">Ver a alcateia correr de novo</button><button type="button" class="outline-button" id="packCopy">Copiar alcateia</button><button type="button" class="primary-button" id="packPlan">Transformar em fluxo de trabalho</button></div>'+
  '<p class="ws-help">Cada papel usa o mesmo ranking da pesquisa (competências confirmadas em fontes oficiais). Para dividir o trabalho, a alcateia evita repetir a mesma IA em dois papéis quando há outra entre as 3 recomendadas.</p>';
  animate($('packCanvas'),pack);
  out.querySelectorAll('[data-pack-panel]').forEach(b=>b.onclick=()=>window.NexusApp?.openPanel(b.dataset.packPanel));
  out.querySelectorAll('[data-pack-search]').forEach(b=>b.onclick=()=>window.NexusApp?.submitSearch(b.dataset.packSearch));
  $('packReplay').onclick=()=>scene?.replay();
  $('packCopy').onclick=()=>{const t='Minha alcateia (Loopins)\n'+pack.map(p=>'- '+p.role+': '+p.tool.name).join('\n');navigator.clipboard?.writeText(t).then(()=>window.NexusApp?.toast('Alcateia copiada!'),()=>window.NexusApp?.toast('Não foi possível copiar.'));};
  $('packPlan').onclick=()=>{try{window.NexusEvolution.start(text,{});}catch(e){window.NexusApp?.toast(e.message);}};
  out.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});
}
window.NexusPack={show,build,roles:ROLES,pending:null};
})();
