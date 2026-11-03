/* Loopins 5.0 — tema, busca global (Ctrl+K), atalhos, ajuda, tour opcional e novidades. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const E=window.NexusEngine,S=window.NexusSettings,app=()=>window.NexusApp;

/* ── Tema ── */
function applyTheme(){
 const st=S?.read()||{theme:'auto',fontScale:'normal'};
 const prefersLight=typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: light)').matches;
 const theme=st.theme==='auto'?(prefersLight?'light':'dark'):st.theme;
 const root=document.documentElement;if(!root?.dataset)return;
 root.dataset.theme=theme;root.dataset.fontScale=st.fontScale;
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',theme==='light'?'#f5f6fb':'#0b0c15');
 const b=$('themeToggle');if(b){b.textContent=theme==='light'?'Tema escuro':'Tema claro';b.setAttribute('aria-pressed',String(theme==='light'));}
}
function toggleTheme(){
 const current=document.documentElement?.dataset?.theme==='light'?'light':'dark';
 try{S.update(s=>{s.theme=current==='light'?'dark':'light';});}catch(e){app()?.toast(e.message);}
 applyTheme();
}

/* ── Novidades do próprio Loopins (sem notícias sobre ferramentas externas) ── */
const news=[
 {version:'5.8',date:'03/11/2026',items:['56 IAs novas, todas conferidas em páginas oficiais: agora são 127 (Moises, Duolingo Max, OpusClip, Google AI Studio, Base44, Antigravity, SciSpace, Semantic Scholar, PixVerse, Hailuo, Tripo, Meta AI, Poe e muitas outras).','Novos tipos de pedido: separar a voz de uma música, aprender um idioma e transformar vídeo longo em cortes curtos.']},
 {version:'5.7',date:'03/11/2026',items:['Céu da alcateia no topo: aurora em movimento, lua, estrelas cadentes e um lobo feito de estrelas uivando para a lua.','Faixa com todas as IAs do catálogo passando abaixo da busca.']},
 {version:'5.6',date:'03/11/2026',items:['Monte sua alcateia: projetos grandes viram uma alcateia de IAs, cada uma com um papel, correndo em formação.','Lobo guia: um mascote que fica atento quando você digita, uiva quando encontra IAs e dá dicas.','Sons gerados no navegador: trilha e uivo na abertura, uivo do lobo guia; liga e desliga em Meu espaço.']},
 {version:'5.5',date:'03/11/2026',items:['O site agora se chama Loopins — “alcateia de lobos”.','Novo logotipo de lobo uivando para a lua.','Na abertura do modo apresentação, as partículas formam LOOPINS e depois se transformam num lobo uivando para a lua.']},
 {version:'5.4',date:'03/11/2026',items:['Universo 3D de IAs: o catálogo como um globo 3D que gira, aceita arrastar e zoom, e mostra as 3 escolhidas flutuando para a frente.','Pesquisa por voz: fale o pedido e veja o texto e o globo reagirem enquanto você fala.','Abertura cinematográfica no modo apresentação.']},
 {version:'5.3',date:'03/11/2026',items:['Galáxia de IAs: as 71 ferramentas como estrelas que reagem ao pedido em tempo real — descartadas se apagam, as 3 melhores vão para o centro.','Interpretação ao vivo enquanto você digita.','Monte seu kit de IA: quiz de 3 perguntas que monta um kit pessoal.','12 IAs novas (DeepL, Grammarly, QuillBot, Photomath, Wolfram|Alpha, Synthesia, HeyGen, Meshy, Photoroom, Microsoft Copilot, Grok, Murf) e 5 tipos de tarefa novos: tradução, revisão de texto, matemática, vídeo com apresentador virtual e modelo 3D.','Tela cheia na galáxia para projetar em apresentações.']},
 {version:'5.2',date:'29/10/2026',items:['“Comparar estas lado a lado” direto nos resultados, com veredito, plano, nível técnico e cada competência do pedido.','Catálogo com 59 ferramentas e nenhuma sem competência verificada: DeepSeek, Qwen Chat, Le Chat (Mistral Vibe) e Freepik AI (Magnific) revisados; CapCut e Kickresume adicionados.','Novo tipo de tarefa: currículo e carta de apresentação.','Legendas, transcrição e voz valorizam ferramentas com português confirmado em fonte oficial.']},
 {version:'5.1',date:'29/10/2026',items:['Tela inicial limpa: só a busca, sem resultado de exemplo pré-carregado.','Cartões mais claros: “Melhor para”, selo “Grátis para começar” só quando o plano gratuito é documentado, nível técnico e ações secundárias recolhidas.','Refinamentos, incertezas e interpretação reunidos em “Refinar ou entender este resultado”.','Modo apresentação com roteiro automático de 7 pedidos (setas, espaço e Esc).','Nova página “Como funciona”, com diagrama e experimento etapa por etapa.']},
 {version:'5.0',date:'29/10/2026',items:['Recomendador com correção de erros de digitação, linguagem informal e perguntas de esclarecimento opcionais.','Explicação de cada recomendação e “Por que esta IA ficou em primeiro lugar?” com a pontuação detalhada.','Catálogo de 41 para 57 ferramentas, com automação, dados, agentes de atendimento, jogos e vídeo de demonstração de tela.','Servidor opcional para IA externa (Gemini, Groq, OpenRouter), desativado até ser configurado.','Prompt Studio: melhorar prompt existente com explicação, versões alternativas, campos por categoria e modelos por ferramenta.','Tema claro, busca global (Ctrl+K), atalhos de teclado, central de ajuda e tour opcional.']},
 {version:'4.0',date:'24/10/2026',items:['Planejador multi-IA, projetos com versões, backup v4 e feedback local.']},
 {version:'3.0',date:'22/10/2026',items:['Catálogo modular e Prompt Studio independente.']}
];

/* ── Busca global / paleta de comandos ── */
function commands(){
 const views=[['Descobrir','discover'],['Fluxos / Planejador','planner'],['Projetos','projects'],['Comparar IAs','compare'],['Criar prompts','prompts'],['Comparar respostas','responses'],['Biblioteca de IAs','library'],['Meu espaço','profile'],['Feedback local','diagnostics'],['Privacidade e fontes','information'],['Central de ajuda','help'],['Novidades','news'],['Como funciona','how']];
 return [
  ...views.map(([label,id])=>({label:'Ir para: '+label,kind:'Tela',run:()=>id==='discover'?app().selectCategory('all'):app().showWorkspace(id)})),
  ...E.tools.map(t=>({label:t.name,detail:t.owner+' · '+(t.facts?.description||''),kind:'Ferramenta',run:()=>app().openPanel(t.id)})),
  {label:'Alternar tema claro/escuro',kind:'Ação',run:toggleTheme},
  {label:'Modo apresentação',kind:'Ação',run:()=>startPresentation()},
  {label:'Favoritos',kind:'Tela',run:()=>app().renderFavorites()},{label:'Histórico',kind:'Tela',run:()=>app().renderHistory()}
 ];
}
let paletteReturn=null;
function openPalette(){
 const dlg=$('paletteDialog');if(!dlg)return;
 paletteReturn=document.activeElement;
 $('paletteInput').value='';renderPalette('');
 if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
 $('paletteInput').focus();
}
function closePalette(){const dlg=$('paletteDialog');if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open');paletteReturn?.focus?.();}
let paletteItems=[],paletteIndex=0;
function renderPalette(q){
 const n=E.normalize(q);
 const all=commands();
 paletteItems=(n?all.filter(c=>E.normalize(c.label+' '+(c.detail||'')).includes(n)):all.filter(c=>c.kind!=='Ferramenta')).slice(0,12);
 if(n.length>=3)paletteItems.push({label:'Pesquisar IAs para: “'+q+'”',kind:'Pesquisa',run:()=>app().submitSearch(q)});
 paletteIndex=0;
 $('paletteList').innerHTML=paletteItems.map((c,i)=>'<li role="option" id="pal'+i+'" aria-selected="'+(i===0)+'"><button type="button" data-pal="'+i+'"><span class="pal-kind">'+esc(c.kind)+'</span> '+esc(c.label)+(c.detail?'<small>'+esc(c.detail.slice(0,90))+'</small>':'')+'</button></li>').join('')||'<li class="ws-help">Nada encontrado.</li>';
 $('paletteList').querySelectorAll('[data-pal]').forEach(b=>b.onclick=()=>runPalette(Number(b.dataset.pal)));
}
function runPalette(i){const c=paletteItems[i];if(!c)return;closePalette();c.run();}

/* ── Ajuda ── */
const shortcuts=[['Ctrl + K','Busca global: telas, ferramentas e ações'],['/','Ir para o campo de pesquisa'],['Ctrl + Enter','Pesquisar a partir do campo'],['?','Abrir esta lista de atalhos'],['Esc','Fechar painel, diálogo ou menu']];
function showHelp(){
 $('workspace').innerHTML='<div class="workspace-heading"><span class="section-kicker">AJUDA</span><h1 tabindex="-1">Central de ajuda</h1><p>Como usar o Loopins e o que cada recurso faz de verdade.</p></div>'+
 '<div class="ws-block"><h2>Primeiros passos</h2><ol><li>Escreva o que você quer fazer, do seu jeito. Erros de digitação e linguagem informal são aceitos.</li><li>Veja até três ferramentas adequadas e abra “Por que foi recomendada?”.</li><li>Se aparecerem perguntas opcionais, responda para refinar — ou ignore.</li><li>Use “Criar prompt para esta IA”, “Criar fluxo” ou “Salvar como projeto”.</li></ol><button class="outline-button" id="helpTour">Fazer o tour rápido</button></div>'+
 '<div class="ws-block"><h2>Perguntas frequentes</h2>'+[
  ['O Loopins usa uma IA para recomendar?','O ranking usa regras e um catálogo com fontes oficiais, no seu navegador. Se o servidor do Loopins tiver um provedor de IA configurado e você ativar em “Meu espaço”, a IA externa pode sugerir uma interpretação do pedido. Mesmo assim, ela não escolhe as ferramentas.'],
  ['O que significam os pontos?','Adequação do pedido às competências documentadas de cada ferramenta, mais critérios pequenos (facilidade, gratuidade quando você pede, qualidade da evidência). Não são nota de qualidade. Veja o detalhamento em “Por que esta IA ficou em primeiro lugar?”.'],
  ['Posso usar minha assinatura do ChatGPT ou do Claude aqui?','Não. Assinaturas de aplicativos não dão acesso à API e o Loopins nunca pede senhas. O painel abre o site oficial com o seu pedido pronto para copiar.'],
  ['Onde ficam meus dados?','No armazenamento deste navegador. Exporte um backup em “Meu espaço” antes de trocar de navegador ou limpar dados.'],
  ['Por que uma ferramenta conhecida não apareceu?','Só recomendamos quando a competência exigida está confirmada em fonte oficial. Veja “Por que outras opções ficaram de fora?” abaixo dos resultados.']
 ].map(([q,a])=>'<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>').join('')+'</div>'+
 '<div class="ws-block"><h2>Atalhos de teclado</h2><div class="ws-table-scroll"><table class="ws-table"><tbody>'+shortcuts.map(([k,d])=>'<tr><th scope="row"><kbd>'+esc(k)+'</kbd></th><td>'+esc(d)+'</td></tr>').join('')+'</tbody></table></div></div>';
 $('helpTour').onclick=()=>startTour(true);
}
function showNews(){
 $('workspace').innerHTML='<div class="workspace-heading"><span class="section-kicker">NOVIDADES</span><h1 tabindex="-1">O que mudou no Loopins</h1><p>Atualizações do próprio Loopins. Não publicamos notícias sobre ferramentas externas.</p></div>'+news.map(n=>'<div class="ws-block"><h2>Versão '+esc(n.version)+' <small>'+esc(n.date)+'</small></h2><ul>'+n.items.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul></div>').join('');
}

/* ── Tour opcional (nunca bloqueia; pode ser fechado a qualquer momento) ── */
const tourSteps=[['taskInput','Descreva sua tarefa aqui, com suas palavras. Erros de digitação são aceitos.'],['resultSection','Aqui aparecem até três ferramentas. Abra “Por que foi recomendada?” em cada cartão.'],['sidebar','No menu ficam o planejador, projetos, Prompt Studio, comparadores e a biblioteca.'],['paletteOpen','Use Ctrl + K para encontrar qualquer tela ou ferramenta.']];
let tourIndex=0;
function startTour(force){
 const st=S?.read();if(!force&&(st?.tourDone||window.NexusStore.isPrivate()||presenting()))return;
 tourIndex=0;$('tourBox').hidden=false;showTourStep();
}
function showTourStep(){
 while(tourIndex<tourSteps.length-1&&!$(tourSteps[tourIndex][0])?.getClientRects?.().length)tourIndex++;
 const [target,text]=tourSteps[tourIndex];
 $('tourText').textContent=text;$('tourCount').textContent=(tourIndex+1)+' de '+tourSteps.length;
 $('tourNext').textContent=tourIndex===tourSteps.length-1?'Concluir':'Próximo';
 document.querySelectorAll('.tour-target').forEach(n=>n.classList.remove('tour-target'));
 $(target)?.classList.add('tour-target');
 $('tourNext').focus();
}
function endTour(){
 $('tourBox').hidden=true;document.querySelectorAll('.tour-target').forEach(n=>n.classList.remove('tour-target'));
 try{if(!window.NexusStore.isPrivate())S.update(s=>{s.tourDone=true;});}catch(_){/* armazenamento indisponível: o tour pode reaparecer */}
}

function init(){
 applyTheme();
 if(typeof matchMedia==='function')matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',applyTheme);
 $('themeToggle')?.addEventListener('click',toggleTheme);
 $('presentOpen')?.addEventListener('click',startPresentation);
 const soundBtn=$('presentSound'),syncSound=()=>{if(!soundBtn)return;const on=window.NexusSettings?.read().sound!==false;soundBtn.textContent='Som: '+(on?'ligado':'desligado');soundBtn.setAttribute('aria-pressed',String(on));};
 soundBtn?.addEventListener('click',()=>{try{window.NexusSettings.update(s=>{s.sound=s.sound===false;});}catch(_){/* sem armazenamento */}if(window.NexusSettings?.read().sound===false)window.NexusSound?.stop();syncSound();});syncSound();
 $('presentNext')?.addEventListener('click',nextDemo);$('presentPrev')?.addEventListener('click',prevDemo);$('presentPause')?.addEventListener('click',togglePause);$('presentExit')?.addEventListener('click',stopPresentation);
 $('paletteOpen')?.addEventListener('click',openPalette);
 $('paletteInput')?.addEventListener('input',e=>renderPalette(e.target.value));
 $('paletteInput')?.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();paletteIndex=(paletteIndex+(e.key==='ArrowDown'?1:-1)+paletteItems.length)%Math.max(1,paletteItems.length);$('paletteList').querySelectorAll('[role="option"]').forEach((o,i)=>o.setAttribute('aria-selected',String(i===paletteIndex)));$('paletteInput').setAttribute('aria-activedescendant','pal'+paletteIndex);}
  else if(e.key==='Enter'){e.preventDefault();runPalette(paletteIndex);}
 });
 $('paletteDialog')?.addEventListener('click',e=>{if(e.target===$('paletteDialog'))closePalette();});
 $('tourNext')?.addEventListener('click',()=>{tourIndex++;if(tourIndex>=tourSteps.length)endTour();else showTourStep();});
 $('tourSkip')?.addEventListener('click',endTour);
 document.addEventListener('keydown',e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette();return;}
  if(presenting()&&!typing){if(e.key==='Escape'){e.preventDefault();stopPresentation();return;}if(e.key==='ArrowRight'){e.preventDefault();nextDemo();return;}if(e.key==='ArrowLeft'){e.preventDefault();prevDemo();return;}if(e.key===' '){e.preventDefault();togglePause();return;}}
  if(typing)return;
  if(e.key==='/'){e.preventDefault();app().selectCategory&&$('heroSection').hidden&&app().selectCategory('all');$('taskInput').focus();$('taskInput').select();}
  else if(e.key==='?'){e.preventDefault();app().showWorkspace('help');}
  else if(e.key==='Escape'&&!$('tourBox').hidden)endTour();
 });
 setTimeout(()=>startTour(false),600);
 // Inclinação 3D dos cartões seguindo o mouse (desligada com "reduzir movimento").
 if(typeof matchMedia==='function'&&matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.addEventListener('pointermove',e=>{
   if(reduced())return;
   const card=e.target.closest?.('.tool-card,.kit-card');
   document.querySelectorAll('.is-tilting').forEach(c=>{if(c!==card){c.classList.remove('is-tilting');c.style.removeProperty('--rx');c.style.removeProperty('--ry');c.style.setProperty('--go','0');}});
   if(!card)return;
   const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   card.classList.add('is-tilting');card.style.setProperty('--ry',((x-.5)*7).toFixed(2)+'deg');card.style.setProperty('--rx',((.5-y)*6).toFixed(2)+'deg');
   card.style.setProperty('--gx',(x*100).toFixed(0)+'%');card.style.setProperty('--gy',(y*100).toFixed(0)+'%');card.style.setProperty('--go','1');
  },{passive:true});
 }
}

/* ── Como funciona: diagrama + experimento com o motor real ── */
const HOW_EXAMPLE='qro criar um site sem saber programar pra minha loja';
function showHow(){
 const steps=[['1','Seu pedido','Texto livre, com erros e gírias'],['2','Interpretação','Objetivo, produto, requisitos, contexto'],['3','Filtros','Elimina quem não tem o requisito confirmado'],['4','Ranking','Pontos por adequação, sem popularidade'],['5','Explicação','Por que, limitações e alternativas']];
 const w=150,gap=28,h=96,total=steps.length*w+(steps.length-1)*gap;
 const svg='<svg class="how-diagram" viewBox="0 0 '+total+' '+(h+8)+'" role="img" aria-labelledby="howDiagTitle"><title id="howDiagTitle">Do pedido à recomendação em cinco etapas</title>'+steps.map(([n,t,d],i)=>{const x=i*(w+gap);return '<g><rect x="'+(x+1)+'" y="4" width="'+(w-2)+'" height="'+h+'" rx="14" class="how-box"/><text x="'+(x+w/2)+'" y="32" class="how-num">'+n+'</text><text x="'+(x+w/2)+'" y="56" class="how-title">'+esc(t)+'</text><foreignObject x="'+(x+8)+'" y="62" width="'+(w-16)+'" height="38"><p xmlns="http://www.w3.org/1999/xhtml" class="how-desc">'+esc(d)+'</p></foreignObject>'+(i<steps.length-1?'<path d="M'+(x+w+4)+' '+(h/2+4)+' h'+(gap-10)+'" class="how-arrow"/><path d="M'+(x+w+gap-10)+' '+(h/2-1)+' l6 5 -6 5" class="how-arrow"/>':'')+'</g>';}).join('')+'</svg>';
 $('workspace').innerHTML='<div class="workspace-heading"><span class="section-kicker">COMO FUNCIONA</span><h1 tabindex="-1">Do pedido à recomendação</h1><p>O Loopins não pergunta a uma IA qual ferramenta é melhor. Ele segue regras abertas e um catálogo com fontes oficiais, e mostra cada decisão.</p></div>'+
 '<div class="ws-block"><div class="how-scroll">'+svg+'</div><ol class="how-list"><li><strong>Seu pedido.</strong> Você escreve como fala. Erros de digitação e abreviações (“qro”, “pra”) são corrigidos, e a correção aparece na tela.</li><li><strong>Interpretação.</strong> O Loopins separa o objetivo principal dos detalhes. “Assistente que responde por voz” é um programa; a voz é só um recurso dele.</li><li><strong>Filtros.</strong> Cada tipo de tarefa exige certas capacidades. Ferramentas sem a capacidade confirmada em fonte oficial saem da lista, mesmo as famosas.</li><li><strong>Ranking.</strong> As que sobram ganham pontos pelas capacidades úteis ao pedido, mais pequenos bônus (especialização, facilidade, plano gratuito quando você pede algo barato). Não existe bônus por fama.</li><li><strong>Explicação.</strong> Cada cartão diz por que foi escolhido, o que pode atrapalhar e quando outra ferramenta seria melhor.</li></ol></div>'+
 '<div class="ws-block"><h2>Experimente: veja cada etapa</h2><form id="howForm" class="ws-form"><label class="ws-field"><span>Digite um pedido</span><input name="q" maxlength="400" value="'+esc(HOW_EXAMPLE)+'"></label><button class="primary-button" type="submit">Mostrar as etapas</button></form><div id="howOut" aria-live="polite"></div></div>';
 const run=q=>{
  const r=E.recommend(q),i=r.intent,label=k=>window.NexusCatalog.capabilityLabels[k]||k;
  const c=i.constraints,restr=[c.noCode&&'sem programar',c.freeOnly&&'gratuito',c.offline&&'offline',c.privacy&&'privacidade',c.outputFormat&&'formato '+c.outputFormat].filter(Boolean);
  $('howOut').innerHTML='<ol class="how-trace">'+
  '<li><strong>1. Pedido</strong><p>'+esc(i.originalQuery)+'</p>'+(i.corrections.length?'<p>Correções: '+i.corrections.map(x=>'“'+esc(x.from)+'” → “'+esc(x.to)+'”').join(', ')+'</p>':'<p>Nenhuma correção necessária.</p>')+'</li>'+
  '<li><strong>2. Interpretação</strong><p>Objetivo: <strong>'+esc(i.deliverable)+'</strong> ('+esc(E.categories[i.taskFamily]?.label||i.taskFamily)+')'+(restr.length?' · restrições: '+esc(restr.join(', ')):'')+(i.technologies.length?' · tecnologias: '+esc(i.technologies.join(', ')):'')+'</p></li>'+
  '<li><strong>3. Filtros</strong><p>Requisitos: '+esc([...r.requirements,...(r.anyOf.length?['uma de: '+r.anyOf.map(label).join(' ou ')]:[])].map(label).join(', ')||'nenhum além da finalidade')+'.</p><p>'+r.eligible.length+' de '+E.tools.length+' ferramentas passaram; '+r.excluded.length+' saíram.</p></li>'+
  '<li><strong>4. Ranking</strong>'+(r.items.length?'<ul>'+r.items.map(t=>'<li><strong>'+esc(t.name)+'</strong>: '+t.score+' pontos ('+t.breakdown.map(b=>esc(b.label.toLowerCase())+' '+(b.points>0?'+':'')+b.points).join(', ')+')</li>').join('')+'</ul>':'<p>Nenhuma ferramenta atende a todos os requisitos; o Loopins não inventa uma opção.</p>')+'</li>'+
  '<li><strong>5. Explicação</strong><p>'+esc(r.whyFirst?.summary||'Sem recomendação para explicar.')+'</p></li></ol><button class="outline-button" id="howSeeResults" type="button">Ver estes resultados na pesquisa</button>';
  $('howSeeResults').onclick=()=>app().submitSearch(q);
 };
 $('howForm').onsubmit=e=>{e.preventDefault();const q=new FormData(e.currentTarget).get('q').trim();if(q.length<3){app().toast('Escreva um pedido.');return;}run(q);};
 run(HOW_EXAMPLE);
}

/* ── Modo apresentação: roteiro automático para mostrar o Loopins a uma turma ── */
const demo=[
 {q:'Quero criar um site sem saber programar',note:'Olhe a galáxia: das 127 IAs, só as que constroem sites sem código continuam acesas, e as 3 melhores vão para perto do pedido. Abaixo, “Por que esta IA ficou em primeiro lugar?” mostra a conta.',open:'.why-first'},
 {q:'Tenho um site em HTML, CSS e JavaScript e preciso corrigir seus erros',note:'Mesmo assunto, objetivo diferente: agora entram agentes que editam código que já existe.'},
 {q:'Quero programar um assistente virtual que responda por voz no computador',note:'A voz é um recurso do programa, não o produto. Por isso aparecem ferramentas de programação, e a voz vira uma etapa complementar.'},
 {q:'Quero criar um cartaz de confeitaria com textos perfeitamente legíveis',note:'Texto legível na imagem é um requisito: só entram geradores com essa capacidade confirmada.'},
 {q:'Quero criar um vídeo mostrando o funcionamento do meu site',note:'O produto é um vídeo de demonstração: o Loopins indica gravação de tela e edição, não geradores de cenas.'},
 {q:'qro fazer um sitie pra minha loja',note:'Linguagem informal e erros de digitação são entendidos, e as correções aparecem no topo dos resultados.'},
 {q:'Quero criar um modelo 3D de uma cadeira para impressão 3D',note:'Uma área nova: só uma ferramenta do catálogo tem modelo 3D confirmado, e o Loopins não inventa outras para completar três.'},
 {q:'ferramentas que geram SVG',note:'Busca por funcionalidade: lista todas as ferramentas com a capacidade confirmada.'},
 {q:'Quero criar um jogo de plataforma com música própria, um trailer e um logotipo',pack:true,note:'Projeto grande? O Loopins monta uma alcateia: o líder planeja e cada lobo é uma IA com um papel — construtor, artista, músico, diretor de vídeo.'}
];
let demoIndex=0,demoTimer=null,typeTimer=null,demoPlaying=true;
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function clearDemoTimers(){clearTimeout(demoTimer);clearInterval(typeTimer);demoTimer=typeTimer=null;}
function startPresentation(){
 app().closePanel?.();if(!$('tourBox').hidden)endTour();
 const go=()=>{document.body.classList.add('presenting');$('presentBar').hidden=false;app().selectCategory('all');demoIndex=0;demoPlaying=true;runDemo();};
 if(window.NexusIntro)window.NexusIntro.play(go);else go();
}
function runDemo(){
 clearDemoTimers();
 const step=demo[demoIndex],input=$('taskInput');
 $('presentStep').textContent=(demoIndex+1)+' de '+demo.length;$('presentNote').textContent=step.note;
 $('presentPrev').disabled=demoIndex===0;$('presentNext').textContent=demoIndex===demo.length-1?'Recomeçar':'Próximo →';
 $('presentPause').textContent=demoPlaying?'Pausar':'Continuar';
 const finish=()=>{app().submitSearch(step.q);if(step.open)setTimeout(()=>document.querySelector(step.open)?.setAttribute('open',''),50);
  ($('galaxyStage')||$('resultSection')).scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});if(demoPlaying)demoTimer=setTimeout(nextDemo,12000);};
 if(step.pack){window.NexusPack.pending=step.q;app().showWorkspace('pack');if(demoPlaying)demoTimer=setTimeout(nextDemo,14000);return;}
 if($('heroSection').hidden)app().selectCategory('all');
 window.scrollTo({top:0,behavior:'auto'});
 if(reduced()){input.value=step.q;finish();return;}
 input.value='';let i=0;
 typeTimer=setInterval(()=>{input.value=step.q.slice(0,++i);if(i>=step.q.length){clearInterval(typeTimer);typeTimer=null;demoTimer=setTimeout(finish,500);}},35);
}
function nextDemo(){demoIndex=(demoIndex+1)%demo.length;runDemo();}
function prevDemo(){if(demoIndex>0){demoIndex--;runDemo();}}
function togglePause(){demoPlaying=!demoPlaying;$('presentPause').textContent=demoPlaying?'Pausar':'Continuar';if(!demoPlaying)clearTimeout(demoTimer);else if(!typeTimer)demoTimer=setTimeout(nextDemo,4000);}
function stopPresentation(){clearDemoTimers();document.body.classList.remove('presenting');$('presentBar').hidden=true;$('presentOpen')?.focus();}
const presenting=()=>document.body.classList.contains('presenting');
window.NexusExtras={show:view=>view==='help'?showHelp():view==='news'?showNews():view==='how'?showHow():null,startPresentation,stopPresentation,applyTheme,toggleTheme,openPalette,startTour,news};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
