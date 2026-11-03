(function () {
  'use strict';
  const engine = window.NexusEngine;
  if (!engine) throw new Error('Carregue engine.js antes de app.js');
  const $ = (id) => document.getElementById(id);
  const icon = (name, className = '') => `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const STORAGE = { favorites: 'nexus:favorites:v1', history: 'nexus:history:v1' }; // preservar dados de quem já usou v1
  function getStored(key, fallback) { try { const value = window.NexusStore.read(key,fallback); return Array.isArray(value) ? value : fallback; } catch (_) { return fallback; } }
  const state = { category: 'all', view: 'discover', result: null, favorites: new Set(getStored(STORAGE.favorites, [])), history: getStored(STORAGE.history, []).filter(h=>h&&typeof h.query==='string'&&Number.isFinite(Date.parse(h.time))), provider: null, chatMode: 'preview', chatMessages: [] };
  let toastTimer,returnFocus;
function recommendationPreferences(){
return {outputFormat:$('prefFormat')?.value||null,privacy:$('prefPrivacy')?.checked||false,integration:$('prefIntegration')?.value||'any',budget:document.getElementById('prefBudget')?.value||'any',experience:document.getElementById('prefExperience')?.value||'any',platform:document.getElementById('prefPlatform')?.value||'any',offline:document.getElementById('prefOffline')?.checked||false};
}
function trapPanel(event){
if(event.key!=='Tab')return;
const panel=document.getElementById('chatDrawer');
if(!panel.classList.contains('is-open'))return;
const nodes=[...panel.querySelectorAll('a[href],button,textarea,input,select,[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);
if(!nodes.length)return;
const first=nodes[0],last=nodes[nodes.length-1];
if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const truncate = (text, size) => text.length > size ? text.slice(0, size-1) + '…' : text;

  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('is-visible'); toastTimer=setTimeout(()=> $('toast').classList.remove('is-visible'),2800); }
  function persist() {const r=window.NexusStore.writeMany({[STORAGE.favorites]:[...state.favorites],[STORAGE.history]:state.history});if(!r.ok)toast(r.error);return r.ok;}
  function setNav(view) {
    document.querySelectorAll('.nav-item').forEach(el => {
      const active = el.dataset.category === view || el.dataset.view === view || el.dataset.workspace === view;
      el.classList.toggle('is-active',active);
      if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
    });
    $('currentView').textContent = engine.categories[view]?.label || ({favorites:'Favoritos',history:'Histórico',compare:'Comparar IAs',prompts:'Criar prompts',responses:'Comparar respostas',library:'Biblioteca de IAs',profile:'Meu espaço',planner:'Planejador',projects:'Projetos',diagnostics:'Feedback local',information:'Privacidade e fontes',help:'Central de ajuda',news:'Novidades',how:'Como funciona',galaxy:'Galáxia de IAs',kit:'Monte seu kit de IA',pack:'Monte sua alcateia'}[view]) || 'Descobrir';
    $('favoritesCount').textContent = state.favorites.size;
  }
  function renderNav() {
    $('categoryNav').innerHTML=Object.entries(engine.categories).map(([key,c])=> `<button type="button" class="nav-item" data-category="${key}">${icon(c.icon)} ${escapeHTML(c.label)}</button>`).join('');
    document.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>selectCategory(el.dataset.category)));
  }
  function showWorkspace(which) {
    state.view=which;
    $('heroSection').hidden=true;$('resultSection').hidden=true;$('bottomBanner').hidden=true;if($('galaxyStage'))$('galaxyStage').hidden=true;
    $('workspace').hidden=false;
    setNav(which);
    window.NexusWorkspace.show(which);
    closeMobileMenu();
          $('workspace').querySelector('h1')?.focus();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  function showBrowse() {
    $('heroSection').hidden=false;$('resultSection').hidden=false;$('bottomBanner').hidden=false;if($('galaxyStage'))$('galaxyStage').hidden=false;
    $('workspace').hidden=true;
  }
  function selectCategory(category) {
    state.category=category;state.view='discover';showBrowse();setNav(category);
    const text = $('taskInput').value.trim();
    const defaultQueries={all:'Quero criar um site usando HTML, CSS e JavaScript',code:'Quero criar um site usando HTML, CSS e JavaScript',image:'Quero criar uma imagem de uma cidade futurista',video:'Quero criar um vídeo curto usando inteligência artificial',study:'Quero estudar matemática para uma prova',text:'Quero escrever e revisar uma redação',audio:'Quero criar uma narração com voz natural'};
    const query=text||defaultQueries[category]||engine.categories[category].description;
    $('taskInput').value=query;
    showRecommendations(engine.recommend(query,category));
    closeMobileMenu();
  }
  function renderCard(tool) {
    const liked = state.favorites.has(tool.id);
    const style=`--tool-start:${tool.colors[0]};--tool-end:${tool.colors[1]}`;
    const free=['free','freemium'].includes(tool.accessDetails?.app?.status);
    const cat=Object.keys(tool.ranks||{}).find(k=>engine.categories[k])||tool.tasks?.[0];
    const fam=state.result?.category,best=(fam&&tool.best?.[fam==='research'?'study':fam])||tool.facts?.description||Object.values(tool.best)[0]||'';
    const evidence=tool.matchedCapabilities?'<details class="fit-evidence"><summary>Fontes oficiais</summary>'+tool.matchedCapabilities.filter((m,i,a)=>a.findIndex(x=>x.capability===m.capability)===i&&!String(m.label).startsWith('Foco')).map(m=>'<p>'+escapeHTML(m.label)+' — '+escapeHTML(m.note)+' <a href="'+window.NexusCatalog.safeURL(m.source)+'" target="_blank" rel="noopener noreferrer">Fonte ('+escapeHTML(m.reviewedAt)+')</a></p>').join('')+'</details>':'';
    return `<article class="tool-card ${tool.position===1?'winner':''}" style="${style}">
      <div class="tool-card-top"><span class="rank">${tool.position===1?'✦ PRIMEIRA OPÇÃO':'#'+String(tool.position).padStart(2,'0')+' RECOMENDADA'}${tool.tiedWith?.length?' · empate':''}</span><button class="favorite-button ${liked?'is-favorite':''}" data-favorite="${tool.id}" aria-label="${liked?'Remover dos':'Adicionar aos'} favoritos: ${escapeHTML(tool.name)}" aria-pressed="${liked}">${icon('star')}</button></div>
      <div class="tool-identity"><div class="tool-logo">${escapeHTML(tool.initial)}${cat&&engine.categories[cat]?`<span class="tool-cat" title="${escapeHTML(engine.categories[cat].label)}">${icon(engine.categories[cat].icon)}</span>`:''}</div><div><h3>${escapeHTML(tool.name)}</h3><span>${escapeHTML(tool.owner)}</span></div></div>
      <div class="tool-badges">${free?'<span class="badge badge-free" title="'+escapeHTML(tool.accessDetails.app.note||'Plano gratuito documentado em fonte oficial')+'">Grátis para começar</span>':'<span class="badge">Plano: confira no site</span>'}${tool.facts?.technicalLevel&&tool.facts.technicalLevel!=='não avaliado'?'<span class="badge">'+escapeHTML({nenhum:'Sem conhecimento técnico',baixo:'Fácil de usar',medio:'Exige configuração',alto:'Para quem programa'}[tool.facts.technicalLevel]||'')+'</span>':''}</div>
      <p class="tool-best"><strong>Melhor para:</strong> ${escapeHTML(truncate(best,140))}</p>
      ${tool.explanation?`<p class="tool-reason">${escapeHTML(tool.explanation.why)}</p>`:''}
      <div class="limitations"><strong>O que considerar</strong>${escapeHTML((tool.facts?.limitations||[])[0]||tool.cons[0])}</div>
      ${tool.explanation?explanationHTML(tool):''}
      <div class="card-actions"><button class="open-panel" data-panel="${tool.id}">${icon('panel')} Ver detalhes e prompt</button><a class="visit-link" href="${escapeHTML(window.NexusCatalog.safeURL(tool.url)||'#')}" target="_blank" rel="noopener noreferrer" aria-label="Abrir site oficial de ${escapeHTML(tool.name)} (nova aba)" title="Site oficial (abre outra aba)">${icon('external')}</a></div>
      <details class="card-more"><summary>Mais ações</summary><div class="ws-actions"><button class="mini-button" data-studio-tool="${tool.id}">Criar prompt para esta IA</button><button class="mini-button" data-compare-card="${tool.id}">Adicionar ao comparador</button><button class="mini-button" data-feedback-tool="${tool.id}">Não serve para mim</button><form hidden class="task-feedback"><label class="ws-field"><span>Qual requisito não foi atendido?</span><textarea required maxlength="500" rows="2"></textarea></label><button class="mini-button" type="submit">Salvar feedback local</button></form></div>${evidence}</details>
    </article>`;
  }
  function explanationHTML(tool){
    const x=tool.explanation,list=items=>items.length?'<ul>'+items.map(i=>'<li>'+escapeHTML(i)+'</li>').join('')+'</ul>':'<p>Nada específico registrado.</p>';
    const first=tool.position===1&&state.result?.whyFirst;
    return `<details class="fit-evidence explain"><summary>Por que foi recomendada?</summary><p>${escapeHTML(x.why)}</p>
      <h4>Em que atende ao pedido</h4>${list(x.fits)}<h4>Limitações que podem atrapalhar</h4>${list(x.limitations)}
      <h4>Quando outra ferramenta seria melhor</h4>${list(x.whenOther)}<h4>Antes de usar</h4>${list(x.beforeUse)}
      ${x.uncertain.length?'<h4>Não confirmamos</h4>'+list(x.uncertain):''}${tool.tiedWith?.length?'<p class="ws-help">Empatada com: '+escapeHTML(tool.tiedWith.join(', '))+'. A ordem entre empatadas é alfabética.</p>':''}</details>
      ${first?`<details class="fit-evidence why-first"><summary>Por que esta IA ficou em primeiro lugar?</summary><p>${escapeHTML(first.summary)}</p>${first.reasons.length?list(first.reasons):''}
      <table class="score-table"><caption>Pontuação de ${escapeHTML(tool.name)}</caption><thead><tr><th scope="col">Critério</th><th scope="col">Pontos</th><th scope="col">Base</th></tr></thead><tbody>${tool.breakdown.map(b=>'<tr><td>'+escapeHTML(b.label)+'</td><td>'+(b.points>0?'+':'')+b.points+'</td><td>'+escapeHTML(b.detail)+'</td></tr>').join('')}</tbody></table>
      <p class="ws-help">Pontos medem adequação ao pedido segundo o catálogo documentado. Não são nota de qualidade. Método completo em “Privacidade e fontes”.</p></details>`:''}`;
  }
  function bindCards() {
    document.querySelectorAll('[data-studio-tool]').forEach(b=>b.onclick=()=>{if(!state.result)return;if(window.NexusStudio.prepare(state.result.intent,b.dataset.studioTool))showWorkspace('prompts');});
    document.querySelectorAll('[data-feedback-tool]').forEach(b=>b.onclick=()=>{
      const form=b.nextElementSibling;form.hidden=!form.hidden;
      form.onsubmit=e=>{e.preventDefault();const tool=engine.tools.find(t=>t.id===b.dataset.feedbackTool);const reason=form.querySelector('textarea').value.trim();if(!reason)return;
        try{window.NexusEvolution.repo.feedback({rating:'no',reason:'irrelevant',suggestedTool:'',note:(tool.name+': '+reason).slice(0,600),includeContext:false,category:state.result?.category||'',subtask:state.result?.intent?.subtask||'',toolIds:[tool.id]});toast('Feedback guardado neste navegador; não foi enviado e o ranking não muda.');form.hidden=true;}catch(e){toast(e.message);}
      };
    });
    document.querySelectorAll('[data-compare-card]').forEach(b=>b.onclick=()=>window.NexusWorkspace.addCompare(b.dataset.compareCard));
    document.querySelectorAll('[data-panel]').forEach(el=>el.addEventListener('click',()=>openPanel(el.dataset.panel)));
    document.querySelectorAll('[data-favorite]').forEach(el=>el.addEventListener('click',()=>toggleFavorite(el.dataset.favorite)));
  }
  function showRecommendations(data) {
    showBrowse();state.result=data;window.NexusGalaxy?.setHero(data);renderLiveIntent(data);
    if(typeof CustomEvent==='function'&&document.dispatchEvent)document.dispatchEvent(new CustomEvent('loopins:results',{detail:{count:data.items.length,top:data.items[0]?.name||'',family:data.category||data.intent?.taskFamily||''}}));
    $('sectionKicker').textContent=data.category === 'all' ? 'COMECE POR AQUI':'ESCOLHIDAS PARA SUA TAREFA';
    $('resultTitle').textContent=data.heading;
    $('resultsRationale').textContent=data.rationale;
    $('resultCount').textContent=`0${data.items.length} recomendações`;
    const tags=data.intent?.signals?.evidence||data.analysis?.signals||[];
    $('analysisSignals').innerHTML=tags.map(t=>`<span>${icon('check')} ${escapeHTML(t)}</span>`).join('');
    $('analysisSignals').hidden=!tags.length;
    $('recommendations').className='recommendation-grid';
    $('recommendations').innerHTML=data.items.map(renderCard).join('');
    $('recommendationChoices').innerHTML=data.alternatives?.length?'<p>Há mais de uma interpretação. Escolha a finalidade:</p>'+data.alternatives.map(k=>'<button class="outline-button" data-interpret="'+k+'">'+escapeHTML(engine.categories[k].label)+'</button>').join(''):'';
    $('recommendationChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>submitSearch(data.request,b.dataset.interpret));
          const choices=$('recommendationChoices');
      const qh=questionBlocks(data);
      choices.insertAdjacentHTML('beforeend',qh.top+(data.items.length>=2?'<div class="compare-inline-bar"><button type="button" class="outline-button" id="compareInline" aria-expanded="false" aria-controls="compareInlinePanel">'+icon('panel')+' Comparar estas '+data.items.length+' lado a lado</button></div><div id="compareInlinePanel" class="compare-inline" hidden></div>':'')+'<details class="refine-panel"><summary>Refinar ou entender este resultado</summary>'+qh.panel+'<div class="task-refinements" aria-label="Refinar finalidade">'+(data.refinements||[]).map(r=>'<button class="outline-button" data-refinement="'+r.id+'" aria-pressed="'+(data.pipeline.preferences.refinement===r.id)+'">'+escapeHTML(r.label)+'</button>').join('')+'</div>'+
        '<details class="intent-debug"><summary>Como interpretamos seu pedido</summary><p>Confiança da regra: '+escapeHTML(data.intent?.confidence||'low')+'. Não é uma probabilidade de acerto.</p><pre>'+escapeHTML(JSON.stringify({task:data.intent,ranking:data.trace},null,2))+'</pre></details>'+'</details>');
      const extras=$('resultExtras')||choices;extras.innerHTML='';
      extras.insertAdjacentHTML('beforeend',
        (data.workflow?.length?'<h3>Etapas complementares</h3><p>Estas etapas não substituem a tarefa principal.</p>'+data.workflow.map((w,i)=>'<button class="mini-button" data-workflow="'+i+'">'+escapeHTML(w.label)+'</button>').join(''):'')+
        (data.otherOptions?.length?'<details><summary>Outras opções elegíveis ('+data.otherOptions.length+')</summary>'+data.otherOptions.map(t=>'<p><button class="text-button" data-panel="'+t.id+'">'+escapeHTML(t.name)+'</button> — '+escapeHTML(t.why)+'</p>').join('')+'</details>':''));
      choices.querySelectorAll('[data-refinement]').forEach(b=>b.onclick=()=>submitSearch(data.request,state.category,{...recommendationPreferences(),refinement:b.dataset.refinement,constraintText:data.intent?.constraintText}));
      extras.querySelectorAll('[data-workflow]').forEach(b=>b.onclick=()=>{const w=data.workflow[Number(b.dataset.workflow)];submitSearch(w.query,'all',{...recommendationPreferences(),refinement:w.subtask});});
      extras.insertAdjacentHTML('beforeend','<div class="ws-actions"><button class="primary-button" id="resultPlan">Criar fluxo</button><button class="outline-button" id="resultPack">Montar uma alcateia para este projeto 🐺</button><button class="outline-button" id="resultProject">Salvar recomendação como projeto</button><button class="outline-button" id="resultCompare">Comparar para esta tarefa</button></div>'+window.NexusEvolution.feedbackForm(data));
    $('resultPlan').onclick=()=>{try{window.NexusEvolution.start(data.intent,data.pipeline.preferences);}catch(e){toast(e.message);}};
    $('resultProject').onclick=()=>window.NexusEvolution.capture(data);
    $('resultPack').onclick=()=>{if(window.NexusPack)window.NexusPack.pending=data.request;showWorkspace('pack');};
    $('resultCompare').onclick=()=>window.NexusWorkspace.compareTask(data);
    window.NexusEvolution.bindFeedback(data);
    bindQuestions(data);
    const ci=$('compareInline');
    if(ci)ci.onclick=()=>{const panel=$('compareInlinePanel'),open=ci.dataset.open!=='1';ci.dataset.open=open?'1':'0';panel.hidden=!open;ci.setAttribute('aria-expanded',String(open));
      if(open){panel.innerHTML=inlineCompareHTML(data);panel.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));const full=$('compareFull');if(full)full.onclick=()=>window.NexusWorkspace.compareTask(data);}};
    aiAssist(data);
    $('excludedWrap').hidden=!data.excluded?.length;
    $('excludedList').innerHTML=(data.excluded||[]).map(t=>'<li><strong>'+escapeHTML(t.name)+'</strong>: '+escapeHTML(t.reason)+'</li>').join('');
    bindCards();
  }
  /* IA externa opcional: só roda se o usuário ativou em "Meu espaço" e o servidor tem provedor.
     A sugestão aparece ao lado da interpretação local; o usuário decide se aplica. */
  async function aiAssist(data){
    const box=document.createElement('div');box.id='aiInterpretation';box.className='ai-box';box.setAttribute('aria-live','polite');
    const settings=window.NexusSettings?.read();
    if(!settings?.aiInterpret||!window.NexusProviders||data.pipeline.preferences.fromAI)return;
    const status=await window.NexusProviders.status();
    if(!status.enabled||state.result!==data)return;
    box.innerHTML='<p>'+icon('sparkles')+' Consultando '+escapeHTML(status.providerLabel)+' ('+escapeHTML(status.model)+') para interpretar o pedido…</p>';
    $('recommendationChoices').prepend(box);
    try{
      const r=await window.NexusProviders.interpret(data.request);
      if(state.result!==data)return;
      const i=r.interpretation,label=engine.subtasks[i.subtask]?.label||i.subtask,same=i.subtask===data.intent.subtask;
      box.innerHTML='<strong>Interpretação por IA externa</strong> <span class="ws-help">'+escapeHTML(r.providerLabel)+' · '+escapeHTML(r.model)+(r.cached?' · em cache':'')+'</span><p>'+escapeHTML(i.summary||label)+'</p><p>'+(same?'Concorda com a interpretação local ('+escapeHTML(label)+').':'Sugere outra finalidade: <strong>'+escapeHTML(label)+'</strong>. A interpretação local foi: '+escapeHTML(data.intent.deliverable)+'.')+'</p>'+(i.ambiguity?'<p class="ws-help">Dúvida apontada: '+escapeHTML(i.ambiguity)+'</p>':'')+(same?'':'<button class="outline-button" id="applyAI">Usar a interpretação da IA</button>')+'<p class="ws-help">A IA só interpreta. As ferramentas continuam sendo escolhidas pelo catálogo local e pelas regras documentadas.</p>';
      $('applyAI')?.addEventListener('click',()=>{const c=i.constraints,extra=[c.noCode&&'sem programar',c.freeOnly&&'grátis',c.offline&&'offline',c.privacy&&'dados não podem sair',c.outputFormat].filter(Boolean).join('; ');submitSearch(data.request,state.category,{...recommendationPreferences(),refinement:i.subtask,constraintText:[data.intent.constraintText,extra].filter(Boolean).join('; '),answered:true,fromAI:true});});
    }catch(e){if(state.result===data)box.innerHTML='<p>'+icon('alert')+' IA externa indisponível: '+escapeHTML(e.message)+' A recomendação local acima continua válida.</p>';}
  }
  /* Comparação rápida das recomendadas, na própria página de resultados. */
  function inlineCompareHTML(data){
    const tools=data.items,labels=window.NexusCatalog.capabilityLabels,fam=data.category==='research'?'study':data.category;
    const yes='<span class="cap-yes">✓ Confirmado</span>',no='<span class="cap-no">— Não verificado</span>';
    const level={nenhum:'Sem conhecimento técnico',baixo:'Fácil de usar',medio:'Exige configuração',alto:'Para quem programa'};
    const rows=[
      ['Posição e pontos',t=>'#'+t.position+' · '+t.score+' pontos'+(t.tiedWith?.length?' (empate)':'')],
      ['Melhor para',t=>escapeHTML(truncate(t.best?.[fam]||t.facts?.description||Object.values(t.best)[0]||'',120))],
      ['Plano gratuito',t=>['free','freemium'].includes(t.accessDetails?.app?.status)?'<span class="cap-yes">Documentado</span> — '+escapeHTML(truncate(t.accessDetails.app.note||'',110)):'Não verificado — confira no site'],
      ['Nível técnico',t=>escapeHTML(level[t.facts?.technicalLevel]||'Não avaliado')],
      ...Object.keys(data.trace?.weights||{}).map(k=>[escapeHTML(labels[k]||k),t=>t.capabilities[k]?.status==='supported'?yes:no]),
      ['Principal limitação',t=>escapeHTML((t.facts?.limitations||[])[0]||t.cons[0]||'—')],
      ['API',t=>t.accessDetails?.api?.status==='supported'?'Documentada (cobrança separada)':'Não verificada'],
      ['',t=>'<button type="button" class="mini-button" data-panel="'+escapeHTML(t.id)+'">Ver detalhes</button>']
    ];
    return '<p class="compare-verdict">'+escapeHTML(data.whyFirst?.summary||'')+'</p><div class="ws-table-scroll"><table class="ws-table compare-table"><caption class="sr-only">Comparação das ferramentas recomendadas</caption><thead><tr><th scope="col">Critério</th>'+tools.map(t=>'<th scope="col">'+escapeHTML(t.name)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(([label,f])=>'<tr><th scope="row">'+label+'</th>'+tools.map(t=>'<td>'+f(t)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="ws-help">“Não verificado” não significa que a ferramenta não faça; só que não confirmamos em fonte oficial. <button type="button" class="text-button" id="compareFull">Abrir o comparador completo →</button></p>';
  }
  function questionBlocks(data){
    const blocks=[],top=[];
    if(data.capabilitySearch){const c=data.capabilitySearch;top.push('<div class="ws-block capability-search"><strong>Ferramentas com '+escapeHTML(c.labels.join(' + '))+' confirmado ('+c.tools.length+')</strong>'+(c.tools.length?'<ul>'+c.tools.map(t=>'<li><button class="text-button" data-panel="'+escapeHTML(t.id)+'">'+escapeHTML(t.name)+'</button> — '+escapeHTML(t.notes.join(' '))+'</li>').join('')+'</ul>':'<p>Nenhuma ferramenta do catálogo tem essa funcionalidade confirmada.</p>')+'<p class="ws-help">Lista completa do catálogo para essa funcionalidade, em ordem alfabética.</p></div>');}
    if(data.questions?.length)top.push('<div class="ws-block clarify" role="group" aria-label="Perguntas opcionais"><strong>Quer resultados mais precisos? (opcional)</strong><p class="ws-help">As recomendações abaixo já valem para o pedido atual. Responder muda a interpretação.</p>'+data.questions.slice(0,1).map((q,qi)=>'<p class="clarify-q">'+escapeHTML(q.text)+'</p><div class="task-refinements">'+q.options.map((o,oi)=>'<button class="outline-button" data-question="'+qi+'" data-option="'+oi+'">'+escapeHTML(o.label)+'</button>').join('')+'</div>').join('')+'</div>');
    if(data.uncertainty?.length)blocks.push('<div class="uncertainty"><strong>Incertezas</strong><ul>'+data.uncertainty.map(u=>'<li>'+escapeHTML(u)+'</li>').join('')+'</ul></div>');
    blocks.push('<div class="ws-actions"><button class="text-button" id="reformulate">Reformular meu pedido com base na interpretação</button></div>');
    if(data.questions?.length>1)blocks.unshift('<div class="clarify-more">'+data.questions.slice(1).map((q,i)=>'<p class="clarify-q">'+escapeHTML(q.text)+'</p><div class="task-refinements">'+q.options.map((o,oi)=>'<button class="outline-button" data-question="'+(i+1)+'" data-option="'+oi+'">'+escapeHTML(o.label)+'</button>').join('')+'</div>').join('')+'</div>');
    return {top:top.join(''),panel:blocks.join('')};
  }
  function bindQuestions(data){
    const choices=$('recommendationChoices');
    choices.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{
      const option=data.questions[Number(b.dataset.question)].options[Number(b.dataset.option)];
      if(!option.refinement){$('taskInput').focus();toast('Descreva o tipo no campo de pesquisa e busque novamente.');return;}
      const constraintText=[data.intent?.constraintText,option.append].filter(Boolean).join('; ');
      submitSearch(data.request,state.category,{...recommendationPreferences(),refinement:option.refinement,constraintText,answered:true});
    });
    $('reformulate').onclick=()=>{$('taskInput').value=engine.reformulate(data.intent);$('taskInput').focus();toast('Pedido reformulado no campo de pesquisa. Revise e busque novamente.');};
  }
  const exampleGroups={
    'Sites e apps':['Quero criar um site sem saber programar','Tenho um site em HTML, CSS e JavaScript e preciso corrigir seus erros','Quero criar um aplicativo que reconheça minha voz','Quero criar um jogo de plataforma para o navegador'],
    'Imagens e design':['Quero criar uma fotografia realista de um bolo','Quero criar um cartaz de confeitaria com textos perfeitamente legíveis','Quero criar um logotipo vetorial editável','Quero remover o fundo de uma foto'],
    'Vídeo e áudio':['Quero criar um vídeo mostrando o funcionamento do meu site','Quero produzir um vídeo cinematográfico de uma paisagem','Quero gerar uma narração com voz natural','Quero transcrever uma reunião'],
    'Estudo e pesquisa':['Quero resumir um PDF','Quero pesquisar artigos científicos sobre energia solar','Quero estudar matemática para uma prova','Quero criar uma apresentação sobre a corrida espacial'],
    'Automação e dados':['Quero automatizar o envio de e-mails quando chegar um pedido na planilha','Quero analisar uma planilha de vendas e criar gráficos','Quero criar um chatbot de atendimento para o WhatsApp da minha loja','Ferramentas que geram SVG']
  };
  const allExamples=Object.values(exampleGroups).flat();
  function renderSearchHelpers(){
    const groups=$('exampleGroups');
    if(groups&&!groups.dataset.ready){groups.dataset.ready='1';groups.innerHTML=Object.entries(exampleGroups).map(([g,list])=>'<div class="example-group"><strong>'+escapeHTML(g)+'</strong>'+list.map(q=>'<button type="button" data-example-q="'+escapeHTML(q)+'">'+escapeHTML(q)+'</button>').join('')+'</div>').join('');groups.querySelectorAll('[data-example-q]').forEach(b=>b.onclick=()=>submitSearch(b.dataset.exampleQ));}
    const recent=$('recentSearches');
    if(recent){const list=state.history.slice(0,5);recent.hidden=!list.length;recent.innerHTML=list.length?'<span>Recentes:</span>'+list.map((h,i)=>'<button type="button" data-recent="'+i+'">'+escapeHTML(truncate(h.query,48))+'</button>').join(''):'';recent.querySelectorAll('[data-recent]').forEach(b=>b.onclick=()=>submitSearch(state.history[Number(b.dataset.recent)].query));}
  }
  let suggestionIndex=-1;
  function updateSuggestions(){
    const box=$('searchSuggestions');if(!box)return;
    const q=engine.normalize($('taskInput').value);
    if(q.length<3){box.hidden=true;box.innerHTML='';$('taskInput').setAttribute('aria-expanded','false');return;}
    const pool=[...state.history.map(h=>h.query),...allExamples].filter((x,i,a)=>a.indexOf(x)===i);
    const words=q.split(' ');
    const found=pool.filter(x=>{const n=engine.normalize(x);return n!==q&&words.every(w=>n.includes(w));}).slice(0,5);
    suggestionIndex=-1;
    box.hidden=!found.length;$('taskInput').setAttribute('aria-expanded',String(!!found.length));
    box.innerHTML=found.map((x,i)=>'<button type="button" role="option" id="sugg'+i+'" aria-selected="false" data-suggestion="'+escapeHTML(x)+'">'+escapeHTML(x)+'</button>').join('');
    box.querySelectorAll('[data-suggestion]').forEach(b=>b.onmousedown=e=>{e.preventDefault();box.hidden=true;submitSearch(b.dataset.suggestion);});
  }
  function suggestionKeys(ev){
    const box=$('searchSuggestions');if(!box||box.hidden)return;
    const options=[...box.querySelectorAll('[data-suggestion]')];if(!options.length)return;
    if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();suggestionIndex=(suggestionIndex+(ev.key==='ArrowDown'?1:-1)+options.length)%options.length;options.forEach((o,i)=>o.setAttribute('aria-selected',String(i===suggestionIndex)));$('taskInput').setAttribute('aria-activedescendant','sugg'+suggestionIndex);}
    else if(ev.key==='Enter'&&suggestionIndex>=0&&!ev.ctrlKey&&!ev.metaKey){ev.preventDefault();box.hidden=true;submitSearch(options[suggestionIndex].dataset.suggestion);}
    else if(ev.key==='Escape'){box.hidden=true;}
  }
  /* Pré-visualização ao vivo enquanto a pessoa digita: a galáxia reage e os chips mostram a interpretação. */
  let liveTimer=null;
  function scheduleLivePreview(){
    clearTimeout(liveTimer);
    liveTimer=setTimeout(()=>{
      const text=$('taskInput').value.trim();
      // Campo apagado ou muito curto: a galáxia volta ao estado inicial (não mostra o pedido anterior).
      if(text.length<6){renderLiveIntent(null);window.NexusGalaxy?.setHero(null);return;}
      const preview=engine.recommend(text,$('prefCategory')?.value||'all',recommendationPreferences());
      renderLiveIntent(preview,true);window.NexusGalaxy?.setHero(preview);
    },260);
  }
  function renderLiveIntent(data,live){
    const box=$('liveIntent');if(!box)return;
    if(!data){box.innerHTML='';box.hidden=true;return;}
    const i=data.intent,c=i.constraints,chips=[i.deliverable,c.noCode&&'sem programar',c.freeOnly&&'grátis',c.offline&&'offline',c.privacy&&'privacidade',c.outputFormat&&c.outputFormat.toUpperCase(),i.technologies.length&&i.technologies.join(', '),i.context?.audience==='beginner'&&'iniciante',...i.corrections.slice(0,2).map(x=>'“'+x.from+'” → “'+x.to+'”')].filter(Boolean);
    box.hidden=false;
    box.innerHTML='<span class="live-label">'+(live?'Entendendo seu pedido:':'Entendido:')+'</span>'+chips.map(t=>'<span class="live-chip">'+escapeHTML(t)+'</span>').join('')+'<span class="live-count">'+(data.items.length?data.eligible.length+' IAs elegíveis':'nenhuma IA confirmada')+'</span>';
  }
  function recordSearch(query) {
    if(window.NexusStore.isPrivate())return;
    state.history=[{query,time:new Date().toISOString()},...state.history.filter(h=>h.query.toLowerCase()!==query.toLowerCase())].slice(0,15);
    persist();renderSearchHelpers();
  }
  // Preferências salvas em "Meu espaço" (nexus:settings:v5) servem de padrão para os filtros.
  function applySettingsDefaults(){
    const st=window.NexusSettings?.read();if(!st)return;
    const set=(id,v)=>{if($(id)&&v)$(id).value=v;};
    set('prefBudget',st.budget);set('prefExperience',st.experience);set('prefPlatform',st.platform);
    if($('prefOffline'))$('prefOffline').checked=!!st.offline;
  }
  function submitSearch(query, forcedCategory, preferences, handoffPrompt) {
    if($('searchSuggestions'))$('searchSuggestions').hidden=true;
    const text=String(typeof query==='object'?query?.originalQuery:query||'').trim();
    if(!text){toast('Descreva primeiro o que você quer criar.');return;}
    state.category=forcedCategory||'all';state.view='discover';$('taskInput').value=text;
    state.handoffPrompt=handoffPrompt||'';
    const chosen=forcedCategory||$('prefCategory')?.value||'all';
    const data=engine.recommend(typeof query==='object'?query:text,chosen,preferences||recommendationPreferences());
    showRecommendations(data);recordSearch(text);setNav(state.category);
    ($('galaxyStage')&&!$('galaxyStage').hidden?$('galaxyStage'):$('resultSection')).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  function toggleFavorite(id) {
    if(!engine.tools.some(t=>t.id===id))return;
    if (state.favorites.has(id)){state.favorites.delete(id);toast('Removido dos favoritos.');}
    else {state.favorites.add(id);toast('Adicionado aos favoritos.');}
    persist();setNav(state.view);
    if(state.view==='favorites')renderFavorites();else if(['compare','prompts','responses','library','profile'].includes(state.view)) { /* Atualização realizada no módulo atual. */ } else if(state.result)showRecommendations(state.result);
  }
  function renderFavorites() {
    showBrowse();$('recommendationChoices').innerHTML='';if($('resultExtras'))$('resultExtras').innerHTML='';$('excludedWrap').hidden=true;$('analysisSignals').hidden=true;state.view='favorites';setNav('favorites');$('sectionKicker').textContent='SEU ESPAÇO';$('resultTitle').textContent='IAs favoritas';$('resultsRationale').textContent='Suas ferramentas favoritas ficam guardadas apenas neste navegador.';
    const favTools=engine.tools.filter(t=>state.favorites.has(t.id));$('resultCount').textContent=`${favTools.length} favoritas`;
    if(!favTools.length){$('recommendations').className='';$('recommendations').innerHTML=`<div class="empty-state"><h3>Nenhuma ferramenta favorita ainda</h3><p>Clique na estrela de qualquer recomendação para guardá-la aqui.</p><button class="outline-button" id="exploreAgain">Explorar ferramentas</button></div>`;$('exploreAgain').onclick=()=>selectCategory('all');}
    else {$('recommendations').className='recommendation-grid';$('recommendations').innerHTML=favTools.map((t,i)=>renderCard({...t,position:i+1,why:t.best.all||Object.values(t.best)[0]})).join('');bindCards();}
    closeMobileMenu();$('resultSection').scrollIntoView({behavior:'smooth'});
  }
  function renderHistory() {
    showBrowse();$('recommendationChoices').innerHTML='';if($('resultExtras'))$('resultExtras').innerHTML='';$('excludedWrap').hidden=true;$('analysisSignals').hidden=true;state.view='history';setNav('history');$('sectionKicker').textContent='SUA ÁREA';$('resultTitle').textContent='Buscas recentes';$('resultsRationale').textContent='Suas últimas 15 buscas ficam salvas somente neste navegador.';$('resultCount').textContent=`${state.history.length} buscas`;
    $('recommendations').className='';
    $('recommendations').innerHTML=state.history.length
      ?`<div class="history-actions"><button class="text-button" id="clearHistory">Limpar histórico</button></div><div class="history-list">${state.history.map((h,i)=>`<button class="history-item" data-history="${i}"><div><strong>${escapeHTML(truncate(h.query,120))}</strong><span>${new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(h.time))}</span></div>${icon('arrow')}</button>`).join('')}</div>`
      :`<div class="empty-state"><h3>Seu histórico está vazio</h3><p>Busque alguma tarefa e ela aparecerá aqui.</p><button class="outline-button" id="exploreAgain">Fazer uma busca</button></div>`;
    $('clearHistory')?.addEventListener('click',()=>{state.history=[];persist();renderHistory();toast('Histórico apagado.');});
    document.querySelectorAll('[data-history]').forEach(el=>el.addEventListener('click',()=>submitSearch(state.history[Number(el.dataset.history)].query)));
    $('exploreAgain')?.addEventListener('click',()=>selectCategory('all'));
    closeMobileMenu();$('resultSection').scrollIntoView({behavior:'smooth'});
  }
  function capabilityDetails(tool){
    return '<details class="fit-evidence"><summary>Competências verificadas e desconhecidas</summary>'+Object.entries(tool.capabilities||{}).map(([key,c])=>'<p><strong>'+escapeHTML(window.NexusCatalog.capabilityLabels[key])+'</strong>: '+escapeHTML(({supported:'Confirmado',unsupported:'Não suportado',unknown:'Não verificado'})[c.status])+' — '+escapeHTML(c.note)+(c.source?' — <a href="'+window.NexusCatalog.safeURL(c.source)+'" target="_blank" rel="noopener noreferrer">Fonte '+escapeHTML(c.reviewedAt)+'</a>':'')+(c.sources?c.sources.map(url=>' <a href="'+window.NexusCatalog.safeURL(url)+'" target="_blank" rel="noopener noreferrer">Fonte divergente</a>').join(''):'')+'</p>').join('')+'<p>API: '+escapeHTML(tool.accessDetails?.api.status==='unknown'?'Não verificado':tool.accessDetails?.api.status||'Não verificado')+'. O acesso ao aplicativo não confirma créditos de API.</p></details>';
  }
  function providerMessage(tool){
return `<div class="connection-state">${icon('info')} Integração não configurada — nenhum envio automático</div>
<div class="chat-message"><strong>${escapeHTML(tool.name)}</strong><p>${escapeHTML(Object.values(tool.best)[0]||'Consulte a fonte oficial.')}</p><p>${escapeHTML(tool.cons.join(' '))}</p></div>
<div class="chat-instructions"><p>Acesso: ${escapeHTML(window.NexusCatalog.accessLabels[tool.access])}</p><p>${escapeHTML(tool.availability)}</p><p>Revisão: ${escapeHTML(tool.reviewedAt||'Não revalidada nesta versão')}</p><a class="ws-link" href="${tool.source}" target="_blank" rel="noopener noreferrer">Consultar fonte oficial ↗</a></div>
${capabilityDetails(tool)}
  <label class="ws-field panel-prompt"><span>Pedido pronto para copiar</span><textarea id="panelPrompt" rows="8" maxlength="18000">${escapeHTML(state.handoffPrompt||state.result?.request||'')}</textarea></label>
${similarHTML(tool)}${panelHistoryHTML(tool)}`;
}
  function similarHTML(tool){const list=engine.similarTools(tool.id);return list.length?'<details class="fit-evidence"><summary>Ferramentas semelhantes</summary><ul>'+list.map(x=>'<li><button class="text-button" data-similar="'+escapeHTML(x.id)+'">'+escapeHTML(x.name)+'</button> — em comum: '+escapeHTML(x.shared.slice(0,4).join(', '))+'</li>').join('')+'</ul><p class="ws-help">Semelhança pelas competências confirmadas em comum, não por qualidade.</p></details>':'';}
  function panelHistoryHTML(tool){const list=window.NexusSettings?.read().panelHistory[tool.id]||[];return list.length?'<details class="fit-evidence"><summary>Pedidos que você copiou para '+escapeHTML(tool.name)+' ('+list.length+')</summary>'+list.map((x,i)=>'<p><button class="text-button" data-panel-history="'+i+'">Usar</button> '+escapeHTML(truncate(x.text,140))+'</p>').join('')+'<p class="ws-help">Histórico guardado só neste navegador.</p></details>':'';}
  function openPanel(id) {
    const tool=engine.tools.find(t=>t.id===id);if(!tool)return;
    if(!$('chatDrawer').classList.contains('is-open'))returnFocus=document.activeElement;
    state.provider=tool;state.chatMode='preview';state.chatMessages=[];
    $('chatToolIcon').textContent=tool.initial;
    $('chatToolIcon').style.background=`linear-gradient(135deg,${tool.colors[0]},${tool.colors[1]})`;
    $('chatToolName').textContent=tool.name;$('chatToolStatus').textContent='Não integrada · modo local';
    $('chatBody').innerHTML=providerMessage(tool);
    $('chatBottom').innerHTML=`<button class="outline-button" id="copyPrompt">${icon('copy')} Copiar seu pedido</button><button class="outline-button" id="tryGuide">${icon('sparkles')} Testar o guia local do Loopins</button><p class="drawer-note">A conexão com ${escapeHTML(tool.name)} ainda não está disponível. Não solicitamos senhas.</p>`;
    $('copyPrompt').onclick=()=>{const text=$('panelPrompt')?.value||state.handoffPrompt||state.result?.request||'';copyText(text);if(text.trim()&&!window.NexusStore.isPrivate()){try{window.NexusSettings?.recordPanelPrompt(tool.id,text.trim().slice(0,4000));}catch(_){}}};
    const official=document.createElement('a');official.className='primary-button';official.href=window.NexusCatalog.safeURL(tool.url)||'#';official.target='_blank';official.rel='noopener noreferrer';official.textContent='Abrir site oficial ↗';official.addEventListener('click',()=>{if(!window.NexusStore.isPrivate()){try{window.NexusSettings?.recordToolUse(tool.id);}catch(_){}}});$('chatBottom').prepend(official);
    $('tryGuide').onclick=startGuide;
    $('chatBody').querySelectorAll('[data-similar]').forEach(b=>b.onclick=()=>openPanel(b.dataset.similar));
    $('chatBody').querySelectorAll('[data-panel-history]').forEach(b=>b.onclick=()=>{const list=window.NexusSettings.read().panelHistory[tool.id]||[];$('panelPrompt').value=list[Number(b.dataset.panelHistory)]?.text||'';});
    window.NexusProviders?.status().then(st=>{if(!st.enabled||state.provider!==tool||state.chatMode!=='preview')return;const b=document.createElement('button');b.className='outline-button';b.id='startAIChat';b.innerHTML=icon('send')+' Conversar com o assistente do Loopins ('+escapeHTML(st.providerLabel)+')';b.onclick=startAIChat;$('chatBottom').insertBefore(b,$('tryGuide'));});
    $('chatDrawer').inert=false;$('chatDrawer').classList.add('is-open');$('chatDrawer').setAttribute('aria-hidden','false');$('drawerBackdrop').hidden=false;
    $('chatDrawer').setAttribute('aria-modal','true');document.querySelector('.app-shell').inert=true;$('closeChat').focus();document.body.style.overflow='hidden';
  }
  function closePanel() { $('chatDrawer').inert=true;$('chatDrawer').classList.remove('is-open');$('chatDrawer').setAttribute('aria-hidden','true');$('drawerBackdrop').hidden=true;document.body.style.overflow='';document.querySelector('.app-shell').inert=false;returnFocus?.focus(); }
  async function copyText(text) {
    const content=String(text||'').trim();if(!content){toast('Nenhum pedido para copiar.');return;}
    try { await navigator.clipboard.writeText(content);toast('Pedido copiado!'); }
    catch(_) {const field=document.createElement('textarea');try{field.value=content;document.body.appendChild(field);field.select();const ok=document.execCommand('copy');toast(ok?'Pedido copiado!':'Não foi possível copiar automaticamente; selecione o texto e use Ctrl+C.');}catch(e){toast('Cópia indisponível. Selecione o texto e use Ctrl+C.');}finally{field.remove();}}
  }
  /* Chat real via servidor do Loopins. Mostra provedor e modelo; não é a ferramenta escolhida. */
  async function startAIChat(){
    const st=await window.NexusProviders.status();if(!st.enabled){toast(st.reason||'IA externa indisponível.');return;}
    if(!confirm('As mensagens deste chat serão enviadas a '+st.providerLabel+' ('+st.model+') pelo servidor do Loopins. Não envie senhas ou dados pessoais. Continuar?'))return;
    state.chatMode='ai';state.chatMessages=[];state.aiStatus=st;
    $('chatToolIcon').textContent='N';$('chatToolName').textContent='Assistente do Loopins';$('chatToolStatus').textContent='IA externa: '+st.providerLabel+' · '+st.model;
    renderAIChat();
  }
  function renderAIChat(pending=false){
    const st=state.aiStatus;
    $('chatBody').innerHTML='<div class="connection-state">'+icon('info')+' Chat real com '+escapeHTML(st.providerLabel)+' ('+escapeHTML(st.model)+'). Este assistente não é '+escapeHTML(state.provider.name)+' e não acessa suas contas.</div>'+state.chatMessages.map(m=>'<div class="chat-message '+(m.role==='user'?'user':'')+'"><strong>'+(m.role==='user'?'Você':escapeHTML(m.error?'Erro':st.providerLabel+' · '+st.model))+'</strong><p>'+escapeHTML(m.content)+'</p></div>').join('')+(pending?'<div class="chat-message"><p>Aguardando resposta…</p></div>':'');
    $('chatBottom').innerHTML='<button class="drawer-back" type="button" id="backPreview">← Voltar para '+escapeHTML(state.provider.name)+'</button><form class="chat-input-line" id="aiForm"><label class="sr-only" for="aiInput">Mensagem</label><textarea id="aiInput" rows="2" maxlength="4000" required placeholder="Pergunte como planejar ou escrever o pedido..." '+(pending?'disabled':'')+'></textarea><button type="submit" aria-label="Enviar mensagem" '+(pending?'disabled':'')+'>'+icon('send')+'</button></form><p class="drawer-note">Enviado a '+escapeHTML(st.providerLabel)+'. Histórico mantido só enquanto o painel estiver aberto.</p>';
    $('backPreview').onclick=()=>openPanel(state.provider.id);
    $('aiForm').onsubmit=async ev=>{ev.preventDefault();const text=$('aiInput').value.trim();if(!text)return;
      state.chatMessages.push({role:'user',content:text});renderAIChat(true);
      try{const r=await window.NexusProviders.chat(state.chatMessages.filter(m=>!m.error).map(({role,content})=>({role,content})),{toolName:state.provider.name});state.chatMessages.push({role:'assistant',content:r.reply});}
      catch(e){state.chatMessages.push({role:'assistant',content:e.message,error:true});}
      if(state.chatMode==='ai')renderAIChat(false);};
    $('aiInput').onkeydown=ev=>{if(ev.key==='Enter'&&!ev.shiftKey){ev.preventDefault();$('aiForm').requestSubmit();}};
    $('chatBody').scrollTop=$('chatBody').scrollHeight;if(!pending)$('aiInput').focus();
  }
  function startGuide() {
    state.chatMode='guide';state.chatMessages=[{by:'guide',text:'Oi! Sou o guia local do Loopins. Posso explicar as recomendações, categorias ou como funciona o projeto. Minhas respostas são regras programadas, não vêm de uma IA externa.'}];
    $('chatToolIcon').textContent='N';$('chatToolIcon').style.background='linear-gradient(135deg,#a19cff,#4bbfc5)';$('chatToolName').textContent='Guia Loopins';$('chatToolStatus').textContent='Demonstração local · sem IA externa';renderGuide();
  }
  function guideReply(text) {
    const n=engine.normalize(text);
    if(/^(oi|ola|e ai|bom dia|boa tarde|boa noite)/.test(n))return 'Olá! Posso explicar o Loopins, recomendar como melhorar um pedido ou mostrar onde visualizar vantagens e limitações.';
    if(/api|integr|conta|login|assinatura|gratis|credito/.test(n))return 'O Loopins ainda não acessa contas de outras IAs. Para um chat real precisamos de integração oficial; assinaturas dos sites e créditos de API geralmente são sistemas separados. Nunca compartilhe senhas aqui.';
    if(/site|html|css|javascript|program|codigo/.test(n))return 'Para um projeto web, experimente descrever a linguagem, o tipo de site e o que ele deve fazer. Exemplo: “Quero criar uma loja usando HTML, CSS e JavaScript, com carrinho de compras”.';
    if(/imagem|foto|logo|ilustr|desenh/.test(n))return 'Para imagens, descreva assunto, estilo, iluminação, cores e formato. Em seguida, pesquise no Loopins para ver três ferramentas especializadas.';
    if(/video|animac|filme|clipe/.test(n))return 'Para vídeos, diga o tipo de cena, movimento, duração desejada e estilo. Confira as limitações de créditos do serviço antes de gerar.';
    if(/escolh|melhor|ranking|recomen|compar/.test(n))return 'O Loopins identifica categoria, intenções e palavras-chave para ordenar três opções do catálogo inicial. O ranking é demonstrativo, e vale conferir as ferramentas na prática.';
    if(/privac|dados|seguran/.test(n))return 'Nesta versão estática, busca, favoritos, perfil e prompts são processados e armazenados apenas no navegador. Não coletamos senhas nem conectamos contas.';
    return 'Este guia é uma demonstração com respostas prontas, não uma IA generativa. Tente perguntar sobre integração, ranking, imagens, programação ou privacidade.';
  }
  function renderGuide() {
    $('chatBody').innerHTML=`<div class="connection-state" style="background:#172b31;border-color:#2e5861;color:#91e5df">${icon('info')} Guia local com respostas pré-programadas</div><div class="chat-date">DEMONSTRAÇÃO</div>${state.chatMessages.map(m=>`<div class="chat-message ${m.by==='user'?'user':''}"><strong>${m.by==='user'?'Você':'Guia Loopins'}</strong><p>${escapeHTML(m.text)}</p></div>`).join('')}`;
    $('chatBottom').innerHTML=`<button class="drawer-back" type="button" id="backPreview">← Voltar para ${escapeHTML(state.provider.name)}</button><form class="chat-input-line" id="guideForm"><label class="sr-only" for="guideInput">Mensagem ao guia local</label><textarea id="guideInput" placeholder="Pergunte sobre o Loopins..." rows="2" maxlength="280" required></textarea><button type="submit" aria-label="Enviar mensagem">${icon('send')}</button></form><p class="drawer-note">Este chat não utiliza IA nem envia suas mensagens para terceiros.</p>`;
    $('backPreview').onclick=()=>openPanel(state.provider.id);
    $('guideForm').onsubmit=(event)=>{event.preventDefault();const text=$('guideInput').value.trim();if(!text)return;state.chatMessages.push({by:'user',text},{by:'guide',text:guideReply(text)});renderGuide();};
    $('guideInput').onkeydown=(event)=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();$('guideForm').requestSubmit();}};
    $('chatBody').scrollTop=$('chatBody').scrollHeight;$('guideInput').focus();
  }
  function showAbout() { const dlg=$('aboutDialog');if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open',''); }
  function closeAbout() { const dlg=$('aboutDialog');if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open'); }
  function closeMobileMenu() { $('sidebar').classList.remove('is-open');$('menuButton').setAttribute('aria-expanded','false'); }
  function init() {
    renderNav();
    document.addEventListener('keydown',trapPanel);
    $('prefCategory').innerHTML='<option value="all">Automática</option>'+Object.entries(engine.categories).filter(([k])=>k!=='all').map(([k,c])=>'<option value="'+k+'">'+escapeHTML(c.label)+'</option>').join('');
    $('searchForm').addEventListener('submit',ev=>{ev.preventDefault();submitSearch($('taskInput').value);});
    $('taskInput').addEventListener('keydown',ev=>{suggestionKeys(ev);if((ev.ctrlKey||ev.metaKey)&&ev.key==='Enter'){$('searchForm').requestSubmit();}});
    $('taskInput').addEventListener('input',updateSuggestions);
    $('taskInput').addEventListener('input',scheduleLivePreview);
    $('taskInput').addEventListener('blur',()=>setTimeout(()=>{if($('searchSuggestions'))$('searchSuggestions').hidden=true;},150));
    renderSearchHelpers();applySettingsDefaults();
    document.querySelectorAll('[data-example]').forEach(el=>el.addEventListener('click',()=>submitSearch(el.dataset.example)));
    document.querySelector('[data-view="favorites"]').addEventListener('click',renderFavorites);
    document.querySelector('[data-view="history"]').addEventListener('click',renderHistory);
    document.querySelectorAll('[data-workspace]').forEach(el=>el.addEventListener('click',()=>showWorkspace(el.dataset.workspace)));
    window.NexusWorkspace.init({
      notify:toast, copy:copyText, search:submitSearch, switchView:showWorkspace, openPanel,
      applyImported:data=>{state.favorites=new Set(data.favorites||[]);state.history=data.history||[];setNav(state.view);},
      isFavorite:id=>state.favorites.has(id), toggleFavorite, history:()=>[...state.history],
      importData:data=>{state.favorites=new Set(data.favorites||[]);state.history=(data.history||[]).slice(0,15);persist();setNav(state.view);}
    });
          ['prefCategory','prefBudget','prefExperience','prefPlatform','prefOffline','prefFormat','prefPrivacy','prefIntegration'].forEach(id=>$(id)?.addEventListener('change',()=>{
        if(!state.result)return;
        submitSearch($('taskInput').value||state.result.request,$('prefCategory').value,{...recommendationPreferences(),refinement:id==='prefCategory'?undefined:state.result.pipeline?.preferences?.refinement,constraintText:state.result.intent?.constraintText});
      }));
      $('closeChat').onclick=closePanel;$('drawerBackdrop').onclick=()=>{closePanel();closeMobileMenu();};
          $('aboutSidebar').onclick=()=>showWorkspace('how');$('aboutTop').onclick=showAbout;$('privacyButton').onclick=()=>showWorkspace('information');
    $('gotIt').onclick=closeAbout;$('closeAbout').onclick=closeAbout;
    $('menuButton').onclick=()=>{const open=$('sidebar').classList.toggle('is-open');$('menuButton').setAttribute('aria-expanded',String(open));};
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if($('chatDrawer').classList.contains('is-open'))closePanel();else closeMobileMenu();}});
    $('taskInput').value='Quero criar um site usando HTML, CSS e JavaScript';
    $('taskInput').value='';$('resultSection').hidden=true;setNav('all');
    window.NexusProviders?.status().then(st=>{const b=$('aiStatusBadge');if(b&&st.enabled)b.innerHTML='<span class="online-dot"></span> IA externa disponível: '+escapeHTML(st.providerLabel);});
    window.NexusApp={submitSearch,openPanel,showWorkspace,selectCategory,renderFavorites,renderHistory,toast,closePanel};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
