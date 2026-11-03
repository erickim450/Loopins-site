/* Loopins 2.0 — módulos interativos que funcionam localmente, sem API externa. */
(function(){
'use strict';
const engine=window.NexusEngine,F=window.NexusFeatures;
const el=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const catNames=Object.fromEntries(Object.entries(engine.categories).map(([k,v])=>[k,v.label]));
const byId=id=>engine.tools.find(t=>t.id===id);
const store={profile:'nexus:profile:v2',prompts:'nexus:prompts:v2'};
let ctx=null,view='compare',libraryQuery='',libraryCat='all',libraryFavorites=false,promptOutput='',responseResult=null;
let compareIds=['claude','chatgpt','gemini'],comparisonTask=null;
const defaults=()=>({name:''});
function read(key,fallback){try{const val=window.NexusStore.read(key,fallback);return val??fallback;}catch(_){return fallback;}}
function write(key,data){const r=window.NexusStore.write(key,data);if(!r.ok)ctx.notify(r.error);return r.ok;}
function profile(){const x=read(store.profile,defaults());return x&&typeof x==='object'?x:defaults();}
function saved(){const x=read(store.prompts,[]);return Array.isArray(x)?x.filter(p=>p&&typeof p.text==='string'):[];}
function inputOptions(selected=''){return engine.tools.map(t=>`<option value="${t.id}" ${selected===t.id?'selected':''}>${esc(t.name)}</option>`).join('');}
function header(eyebrow,title,description){return `<div class="workspace-heading"><span class="section-kicker">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div>`;}
function toolLogo(tool){return `<span class="ws-logo" style="--tool-start:${tool.colors[0]};--tool-end:${tool.colors[1]}">${esc(tool.initial)}</span>`;}
function link(tool){return `<a class="ws-link" target="_blank" rel="noopener noreferrer" href="${tool.url}">Site oficial ↗</a>`;}
function titleFor(id){return byId(id)?.name||id;}
function show(which){view=which;const w=el('workspace');if(!w)return;
 if(['planner','projects','diagnostics','information'].includes(view))window.NexusEvolution.show(view);
 if(view==='compare')renderCompare();
 if(view==='prompts')window.NexusStudio.render(ctx);
 if(view==='responses')renderResponses();
 if(view==='library')renderLibrary();
 if(view==='profile')renderProfile();
 if(['help','news','how'].includes(view))window.NexusExtras?.show(view);
 if(view==='loopino')window.NexusMascot?.showPage();
 if(view==='packmap')window.NexusPackMap?.show();
 if(view==='galaxy')window.NexusGalaxy?.showView();
 if(view==='kit')window.NexusKit?.show();
 if(view==='pack'){const pre=window.NexusPack?.pending;if(window.NexusPack)window.NexusPack.pending=null;window.NexusPack?.show(pre);}
}
function renderCompare(){
 const picks=compareIds.filter((id,i,a)=>byId(id)&&a.indexOf(id)===i);
 el('workspace').innerHTML=header('COMPARAÇÃO','Comparar ferramentas','Escolha de duas a três IAs para ver especialidades, vantagens e limitações lado a lado. A análise é editorial e não compara respostas reais.')+
 `<div class="ws-block"><div class="field-heading"><strong>Selecione as ferramentas</strong><span>Até 3 IAs</span></div><div class="ws-picker">${[0,1,2].map(i=>`<label class="ws-field"><span>Ferramenta ${i+1}</span><select data-compare-pick="${i}"><option value="">${i===2?'Nenhuma (opcional)':'Escolher...'}</option>${inputOptions(compareIds[i])}</select></label>`).join('')}</div><p class="ws-help">A comparação não indica vencedores universais. O melhor serviço depende do seu objetivo e do plano disponível.</p></div>
 <div class="ws-block"><form id="compareTaskForm" class="ws-form"><label class="ws-field"><span>Tarefa para comparar adequação</span><input name="goal" minlength="6" maxlength="1400" value="${esc(comparisonTask?.request||'')}"></label><button class="outline-button">Avaliar requisitos desta tarefa</button></form><p>${esc(comparisonTask?.rationale||'Preencha a tarefa ou abra a comparação a partir da descoberta.')}</p></div><div id="compareBody"></div>`;
 el('compareTaskForm').onsubmit=e=>{e.preventDefault();comparisonTask=engine.recommend(new FormData(e.currentTarget).get('goal'));renderCompare();};
 el('workspace').querySelectorAll('[data-compare-pick]').forEach(select=>{select.value=compareIds[Number(select.dataset.comparePick)]||'';select.onchange=()=>{const index=Number(select.dataset.comparePick);const next=[...compareIds];next[index]=select.value;compareIds=next;renderCompare();};});
 if(picks.length<2){el('compareBody').innerHTML='<div class="ws-empty">Selecione pelo menos duas IAs diferentes para comparar.</div>';return;}
 const tools=picks.map(byId);
 const share=document.createElement('button');share.className='outline-button';share.textContent='Copiar resumo da comparação';share.onclick=()=>ctx.copy(tools.map(t=>t.name+'\n'+Object.values(t.best)[0]+'\nLimitações: '+t.cons.join('; ')+'\nFonte: '+t.source+'\nRevisão: '+(t.reviewedAt||'não revalidada')).join('\n\n'));el('workspace').querySelector('.ws-block').appendChild(share);
    const rows=[{label:'Especialidades',f:t=>Object.keys(t.ranks).filter(k=>k!=='all').map(k=>catNames[k]).join(' · ')},
 {label:'Melhor aplicação',f:t=>Object.values(t.best)[0]},
 {label:'Vantagens',f:t=>`<ul>${t.pros.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`,html:true},
 {label:'Limitações',f:t=>`<ul>${t.cons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`,html:true},
 {label:'Integração no Loopins',f:()=> 'Não integrada · link externo'},
 {label:'Modelo de acesso',f:t=>window.NexusCatalog.accessLabels[t.access]},
 {label:'Plataformas confirmadas',f:t=>t.platforms.join(', ')||'Não verificadas'},
 {label:'Revisão',f:t=>t.reviewedAt||'Não revalidada nesta versão'},
 {label:'Fonte oficial',f:t=>'<a href="'+t.source+'" target="_blank" rel="noopener noreferrer">Consultar fonte</a>',html:true},
 {label:'Acesso',f:t=>link(t),html:true}];
    if(comparisonTask)rows.unshift({label:'Adequação a esta tarefa',f:t=>{const match=comparisonTask.eligible.find(x=>x.id===t.id);const eliminated=comparisonTask.excluded.find(x=>x.id===t.id);return match?'Elegível: '+match.why:'Fora dos requisitos: '+(eliminated?.reason||'Sem capacidade confirmada.');}},{label:'Requisitos obrigatórios',f:()=>comparisonTask.requirements.map(k=>window.NexusCatalog.capabilityLabels[k]||k).join(', ')||'Objetivo amplo'});
   rows.splice(1,0,...['noCode','codeExport','staticHTML','repository','svg','typography','imageEdit','videoAudio','science'].map(k=>({label:window.NexusCatalog.capabilityLabels[k],f:t=>{const c=t.capabilities[k];return ({supported:'Confirmado',unsupported:'Não suportado',unknown:'Não verificado'})[c.status]+(c.reviewedAt?' — '+c.reviewedAt:'');}})));
   rows.splice(rows.findIndex(r=>r.label==='Modelo de acesso')+1,0,
  {label:'Plano gratuito documentado',f:t=>{const a=t.accessDetails?.app;return a?.note?a.note:'Não verificado pelo Loopins';}},
  {label:'API',f:t=>{const a=t.accessDetails?.api;return a?.status==='supported'?'Documentada'+(a.note?' — '+a.note:''):'Não verificada';}},
  {label:'Nível técnico (editorial)',f:t=>t.facts?.technicalLevel||'Não avaliado'},
  {label:'Funciona localmente / código aberto',f:t=>[t.facts?.local?'Execução local documentada':'',t.facts?.openSource===true?'Código aberto':t.facts?.openSource?'Código disponível ('+t.facts.openSource+')':''].filter(Boolean).join(' · ')||'Não documentado'},
  {label:'Limitações documentadas',f:t=>`<ul>${(t.facts?.limitations||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>Nenhuma registrada além das gerais.</li>'}</ul>`,html:true});
 el('compareBody').innerHTML=verdictHTML(tools)+differencesHTML(tools)+`<div class="ws-table-scroll"><table class="ws-table"><thead><tr><th scope="col">Critério</th>${tools.map(t=>`<th scope="col"><div class="ws-table-tool">${toolLogo(t)}<span>${esc(t.name)}</span></div></th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${r.label}</th>${tools.map(t=>`<td>${r.html?r.f(t):esc(r.f(t)||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="ws-disclaimer">Preços, cotas e funcionalidades podem mudar. Confira as condições no site oficial de cada ferramenta. Não usamos benchmarks.</p>`;
}
/* "Qual delas faz mais sentido para meu objetivo?" — usa o mesmo ranking da descoberta. */
function verdictHTML(tools){
 if(!comparisonTask)return '<div class="verdict"><strong>Qual delas faz mais sentido para meu objetivo?</strong><p>Descreva sua tarefa no campo acima para uma resposta baseada nos requisitos dela.</p></div>';
 const ranked=tools.map(t=>({t,e:comparisonTask.eligible.find(x=>x.id===t.id),x:comparisonTask.excluded.find(x=>x.id===t.id)})).sort((a,b)=>(b.e?.score??-1)-(a.e?.score??-1)||a.t.name.localeCompare(b.t.name,'pt-BR'));
 const fit=ranked.filter(r=>r.e),best=fit[0];
 const spec=engine.subtasks[comparisonTask.intent.subtask];
 const uncertain=tools.flatMap(t=>Object.keys(spec.weights).filter(k=>t.capabilities[k]?.status==='unknown').map(k=>t.name+': '+window.NexusCatalog.capabilityLabels[k]+' não verificado'));
 let summary;
 if(!best)summary='Nenhuma das ferramentas selecionadas tem as competências exigidas confirmadas para “'+comparisonTask.intent.deliverable+'”. Veja as recomendações da descoberta.';
 else if(fit[1]&&fit[1].e.score===best.e.score)summary=best.t.name+' e '+fit[1].t.name+' empatam para esta tarefa ('+best.e.score+' pontos). A escolha depende de preferências como preço, plataforma ou conta que você já tem.';
 else summary=best.t.name+' parece a mais apropriada para “'+comparisonTask.intent.deliverable+'”: '+best.e.explanation.why;
 return '<div class="verdict"><strong>Qual delas faz mais sentido para meu objetivo?</strong><p>'+esc(summary)+'</p><h3>Critérios usados</h3><ul><li>Requisitos obrigatórios: '+esc(comparisonTask.requirements.map(k=>window.NexusCatalog.capabilityLabels[k]||k).join(', ')||'nenhum além da finalidade')+'</li><li>Pontos por competência relevante: '+esc(Object.entries(spec.weights).map(([k,v])=>(window.NexusCatalog.capabilityLabels[k]||k)+' '+v).join(', '))+'</li><li>Critérios menores: facilidade de uso, gratuidade quando pedida, qualidade da evidência.</li></ul><h3>Resultado por ferramenta</h3><ul>'+ranked.map(r=>'<li><strong>'+esc(r.t.name)+'</strong>: '+(r.e?esc(r.e.score+' pontos — '+r.e.breakdown.map(b=>b.label+' '+(b.points>0?'+':'')+b.points).join(', ')):'fora dos requisitos — '+esc(r.x?.reason||'sem competência confirmada'))+'</li>').join('')+'</ul>'+(uncertain.length?'<h3>Incertezas</h3><ul>'+uncertain.slice(0,8).map(u=>'<li>'+esc(u)+'</li>').join('')+'</ul>':'')+'</div>';
}
/* Diferenças importantes em linguagem simples. */
function differencesHTML(tools){
 const keys=Object.keys(window.NexusCatalog.capabilityLabels);
 const lines=[];
 for(const t of tools){
  const only=keys.filter(k=>t.capabilities[k]?.status==='supported'&&tools.every(o=>o===t||o.capabilities[k]?.status!=='supported'));
  if(only.length)lines.push(t.name+' tem confirmado, e as outras não: '+only.map(k=>window.NexusCatalog.capabilityLabels[k].toLowerCase()).join(', ')+'.');
 }
 const shared=keys.filter(k=>tools.every(t=>t.capabilities[k]?.status==='supported'));
 if(shared.length)lines.push('Todas servem para: '+shared.map(k=>window.NexusCatalog.capabilityLabels[k].toLowerCase()).join(', ')+'. Para isso, escolha pela facilidade, preço ou plataforma.');
 const levels=tools.map(t=>t.name+' ('+(t.facts?.technicalLevel||'não avaliado')+')');
 lines.push('Nível técnico necessário (editorial): '+levels.join(', ')+'.');
 return '<div class="ws-block"><h2>Diferenças em linguagem simples</h2><ul>'+lines.map(l=>'<li>'+esc(l)+'</li>').join('')+'</ul><p class="ws-help">“Não confirmado” não significa que a ferramenta não faça; significa que não verificamos em fonte oficial.</p></div>';
}
let responseCount=2;
function renderResponses(){
 const slots=[0,1,2,3].slice(0,responseCount),defaults=['claude','chatgpt','gemini','perplexity'];
 el('workspace').innerHTML=header('ANÁLISE LADO A LADO','Comparar respostas','Cole respostas de 2 a 4 IAs para comparar cobertura do pedido, estrutura, informações ausentes e números divergentes. A análise manual não envia nada a ninguém.')+
 `<div class="ws-block"><form id="responseForm" class="ws-form"><label class="ws-field"><span>Pedido original (opcional, melhora a análise de cobertura)</span><textarea name="request" rows="2" maxlength="2000" placeholder="O que você pediu às IAs?"></textarea></label>
 <label class="ws-field"><span>Quantas respostas?</span><select id="responseCount">${[2,3,4].map(n=>`<option value="${n}" ${n===responseCount?'selected':''}>${n}</option>`).join('')}</select></label>
 <div class="ws-form-row ws-response-row">${slots.map(i=>`<div><label class="ws-field"><span>IA da resposta ${'ABCD'[i]}</span><select name="tool${i}">${inputOptions(defaults[i])}</select></label><label class="ws-field"><span>Resposta ${'ABCD'[i]}</span><textarea name="response${i}" rows="9" maxlength="40000" ${i<2?'required':''} placeholder="Cole aqui a resposta ${'ABCD'[i]}..."></textarea></label></div>`).join('')}</div>
 <label class="ws-field"><span>Requisitos esperados (um por linha; conferência lexical)</span><textarea name="requirements" rows="3" maxlength="2000"></textarea></label><div class="ws-actions"><button class="primary-button" type="submit">Analisar diferenças</button><button class="outline-button" type="reset">Limpar respostas</button></div><p class="ws-help">Os textos não são salvos. Semelhança de vocabulário não mede qualidade nem correção.</p></form></div>
 <div class="ws-block" id="integratedCompare" hidden></div><div id="responseOutput"></div>`;
 el('responseCount').onchange=e=>{responseCount=Number(e.target.value);renderResponses();};
 el('responseForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget);try{
  const list=slots.map(i=>({label:titleFor(d.get('tool'+i))+' ('+'ABCD'[i]+')',text:d.get('response'+i)||''})).filter(r=>r.text.trim());
  const analysis=F.analyzeResponses(list,d.get('request'));
  el('responseOutput').innerHTML=analysisHTML(analysis);
  if(list.length>=2){const data=F.compareResponses(list[0].text,list[1].text);responseResult={...data,a:list[0].label,b:list[1].label};el('responseOutput').insertAdjacentHTML('beforeend',responseResultHTML());}
  const coverage=list.map(r=>window.NexusProjects.responseCoverage(r.text,d.get('requirements')));const coveragePanel=document.createElement('div');coveragePanel.className='ws-block';coveragePanel.innerHTML='<h2>Requisitos que você listou</h2><p>Presença lexical não prova atendimento semântico; links não foram verificados.</p>'+coverage.map((r,i)=>'<h3>'+esc(list[i].label)+'</h3><p>'+r.headings+' títulos e '+r.citations.length+' URLs HTTPS fornecidas.</p><ul>'+(r.requirements.map(x=>'<li>'+esc(x.requirement)+': '+(x.mentioned?'termos encontrados':'termos não encontrados')+'</li>').join('')||'<li>Nenhum requisito listado.</li>')+'</ul>').join('');el('responseOutput').appendChild(coveragePanel);
  const diff=F.compareLines(list[0].text,list[1].text);const section=document.createElement('div');section.className='ws-block';section.innerHTML='<h2>Trechos comuns e diferentes (A × B)</h2><p class="ws-help">Linhas idênticas aparecem destacadas. Diferenças literais não indicam erros.</p><div class="ws-form-row diff-columns">'+['left','right'].map((side,i)=>'<div><h3>'+esc(list[i].label)+'</h3><pre>'+diff[side].map(line=>'<span class="diff-line '+(line.shared?'shared':'distinct')+'">'+esc(line.text||' ')+'</span>').join('')+'</pre></div>').join('')+'</div><fieldset class="review-checklist"><legend>Revisão humana (não avaliada automaticamente)</legend>'+['Clareza','Completude','Exemplos úteis','Aderência às instruções','Fontes verificadas'].map(label=>'<label class="ws-checkbox"><input type="checkbox"> '+label+'</label>').join('')+'</fieldset>';el('responseOutput').appendChild(section);el('responseOutput').scrollIntoView({behavior:'smooth',block:'nearest'});}catch(error){ctx.notify(error.message);}};
 el('responseForm').onreset=()=>{responseResult=null;el('responseOutput').innerHTML='';};
 window.NexusProviders?.status().then(st=>{
  const box=el('integratedCompare');if(!box)return;
  const configured=(st.providers||[]).filter(p=>p.configured);
  if(!st.enabled||!(st.features||[]).includes('compare')){box.hidden=false;box.innerHTML='<h2>Modo integrado</h2><p class="ws-help">'+esc(st.enabled?'Exige pelo menos dois provedores configurados no servidor do Loopins.':(st.reason||'Servidor de IA não configurado.'))+' O modo manual acima funciona sem servidor.</p>';return;}
  box.hidden=false;box.innerHTML='<h2>Modo integrado</h2><p>Envia a mesma solicitação a provedores configurados no servidor e mostra provedor e modelo de cada resposta.</p><form id="integratedForm" class="ws-form"><label class="ws-field"><span>Solicitação</span><textarea name="prompt" rows="3" maxlength="6000" required></textarea></label><fieldset><legend>Provedores</legend>'+configured.map(p=>'<label class="ws-checkbox"><input type="checkbox" name="p" value="'+esc(p.id)+'" checked> '+esc(p.label)+' · '+esc(p.model)+'</label>').join('')+'</fieldset><button class="outline-button">Enviar aos provedores</button></form><div id="integratedOut" aria-live="polite"></div>';
  el('integratedForm').onsubmit=async e=>{e.preventDefault();const d=new FormData(e.currentTarget);const ids=d.getAll('p');if(!confirm('A solicitação será enviada a '+ids.length+' provedor(es) externo(s). Continuar?'))return;el('integratedOut').innerHTML='<p>Aguardando respostas…</p>';
   try{const r=await window.NexusProviders.compare(d.get('prompt'),ids);el('integratedOut').innerHTML=r.results.map(x=>'<div class="ws-block"><h3>'+esc(x.providerLabel)+' · '+esc(x.model)+'</h3>'+(x.error?'<p>Erro: '+esc(x.error)+'</p>':'<pre class="version-text">'+esc(x.text)+'</pre>')+'</div>').join('');
    const ok=r.results.filter(x=>!x.error);if(ok.length>=2)el('integratedOut').insertAdjacentHTML('beforeend',analysisHTML(F.analyzeResponses(ok.map(x=>({label:x.providerLabel+' · '+x.model,text:x.text})),d.get('prompt'))));}
   catch(err){el('integratedOut').innerHTML='<p>Falha: '+esc(err.message)+'</p>';}};
 });
}
function analysisHTML(a){
 return `<div class="ws-block"><h2>Visão geral</h2><p class="ws-help">${esc(a.warning)}</p><div class="ws-table-scroll"><table class="ws-table"><thead><tr><th scope="col">Medida</th>${a.items.map(i=>`<th scope="col">${esc(i.label)}</th>`).join('')}</tr></thead><tbody>
 <tr><th scope="row">Cobertura dos termos do pedido</th>${a.items.map(i=>`<td>${i.coverage===null?'Informe o pedido':i.coverage+'%'}</td>`).join('')}</tr>
 <tr><th scope="row">Termos do pedido ausentes</th>${a.items.map(i=>`<td>${esc(i.missing.slice(0,8).join(', ')||'—')}</td>`).join('')}</tr>
 <tr><th scope="row">Palavras</th>${a.items.map(i=>`<td>${i.measures.words}</td>`).join('')}</tr>
 <tr><th scope="row">Títulos / listas / código</th>${a.items.map(i=>`<td>${i.headings} / ${i.measures.listLines} / ${i.measures.codeBlocks}</td>`).join('')}</tr>
 <tr><th scope="row">Links</th>${a.items.map(i=>`<td>${i.measures.links}</td>`).join('')}</tr>
 <tr><th scope="row">Termos exclusivos</th>${a.unique.map(u=>`<td>${esc(u.terms.join(', ')||'—')}</td>`).join('')}</tr></tbody></table></div>
 <h3>Contradições aparentes</h3>${a.contradictions.length?'<ul>'+a.contradictions.map(c=>'<li class="contradiction">“'+esc(c.term)+'”: '+c.values.map(v=>esc(v.label)+' diz '+esc(v.values.join(' ou '))).join('; ')+'</li>').join('')+'</ul><p class="ws-help">Números diferentes perto da mesma palavra. Confira na fonte qual está certo — ou se nenhum está.</p>':'<p>Nenhum número divergente detectado. Isso não garante que as respostas concordem.</p>'}
 <h3>Semelhança de vocabulário entre pares</h3><ul>${a.pairs.map(p=>'<li>'+esc(p.a)+' × '+esc(p.b)+': '+p.similarity+'%</li>').join('')}</ul></div>`;
}
function responseResultHTML(){if(!responseResult)return '';
 const r=responseResult;
 const stat=(text,a,b)=>`<tr><th scope="row">${text}</th><td>${a}</td><td>${b}</td></tr>`;
 return `<div class="ws-block"><div class="field-heading"><strong>Diferenças identificadas</strong><span>Comparação objetiva</span></div><div class="metric-strip"><div class="metric"><span>Semelhança de vocabulário</span><strong>${r.similarity}%</strong><small>Índice de Jaccard, não nota de qualidade</small></div><div class="metric"><span>Termos compartilhados</span><strong>${r.sharedWords.length}</strong><small>Exibindo até 12 termos úteis</small></div></div><div class="ws-table-scroll"><table class="ws-table"><thead><tr><th>Medida</th><th>${esc(r.a)}</th><th>${esc(r.b)}</th></tr></thead><tbody>${stat('Palavras',r.left.words,r.right.words)}${stat('Caracteres',r.left.characters,r.right.characters)}${stat('Parágrafos',r.left.paragraphs,r.right.paragraphs)}${stat('Blocos de código',r.left.codeBlocks,r.right.codeBlocks)}${stat('Itens de lista',r.left.listLines,r.right.listLines)}${stat('Links encontrados',r.left.links,r.right.links)}</tbody></table></div><div class="response-terms"><div><strong>Termos nas duas</strong><p>${esc(r.sharedWords.join(' · ')||'Nenhum destaque')}</p></div><div><strong>Exclusivos da A</strong><p>${esc(r.differentA.join(' · ')||'Nenhum destaque')}</p></div><div><strong>Exclusivos da B</strong><p>${esc(r.differentB.join(' · ')||'Nenhum destaque')}</p></div></div><div class="ws-actions"><button class="outline-button" id="copySummary">Copiar resumo</button></div></div>`;
}
function attachResponseEvents(){el('copySummary')?.addEventListener('click',()=>{const r=responseResult;ctx.copy(`Comparação de respostas\n${r.a}: ${r.left.words} palavras e ${r.left.paragraphs} parágrafos\n${r.b}: ${r.right.words} palavras e ${r.right.paragraphs} parágrafos\nSimilaridade de vocabulário: ${r.similarity}% (não mede qualidade).`);});}
function renderLibrary(){
el('workspace').innerHTML=header('CATÁLOGO · '+engine.tools.length+' FERRAMENTAS','Biblioteca de IAs','Busque por finalidade, confira as limitações e escolha uma ferramenta. Planos desconhecidos são identificados.')+
`<div class="ws-block"><div class="ws-picker"><label class="ws-field"><span>Buscar</span><input id="librarySearch" type="search" value="${esc(libraryQuery)}" placeholder="Nome, finalidade ou funcionalidade: svg, transcrição, offline..."></label><label class="ws-field"><span>Modelo de acesso</span><select id="libraryAccess"><option value="any">Todos</option>${Object.entries(window.NexusCatalog.accessLabels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="ws-field"><span>Ordenar</span><select id="librarySort"><option value="name">Nome</option><option value="reviewed">Revisadas primeiro</option></select></label></div>
<div class="ws-actions"><label class="ws-checkbox"><input type="checkbox" id="libraryOnlyFav" ${libraryFavorites?'checked':''}> Só favoritas</label><label class="ws-checkbox"><input type="checkbox" id="libraryOffline"> Modo offline confirmado</label><label class="ws-checkbox"><input type="checkbox" id="libraryFree"> Plano gratuito documentado</label><label class="ws-checkbox"><input type="checkbox" id="libraryApi"> API documentada</label><label class="ws-checkbox"><input type="checkbox" id="libraryOpen"> Código aberto</label><label class="ws-checkbox"><input type="checkbox" id="libraryLocal"> Funciona localmente</label></div>
<div class="ws-categories" id="libraryCategories">${Object.entries(engine.categories).map(([k,c])=>`<button class="filter-pill ${libraryCat===k?'active':''}" aria-pressed="${libraryCat===k}" data-library-cat="${k}">${esc(c.label)}</button>`).join('')}</div><div id="libraryResults"></div></div>
<div class="ws-block"><h2>Ajude a revisar o catálogo</h2><form id="catalogFeedback" class="ws-form"><label class="ws-field"><span>Tipo</span><select name="kind"><option>Informação desatualizada</option><option>Sugerir ferramenta</option></select></label><label class="ws-field"><span>Ferramenta, fonte e observação</span><textarea name="text" required maxlength="1200" rows="3"></textarea></label><button class="outline-button" type="submit">Salvar observação local</button><p class="ws-help">Este registro fica neste navegador e não é enviado a ninguém.</p></form><div id="feedbackRecords"></div></div>`;
el('librarySearch').oninput=e=>{libraryQuery=e.target.value;renderLibraryItems();};
for(const id of ['libraryOnlyFav','libraryAccess','librarySort','libraryOffline','libraryFree','libraryApi','libraryOpen','libraryLocal'])el(id).onchange=()=>{libraryFavorites=el('libraryOnlyFav').checked;renderLibraryItems();};
el('libraryCategories').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{libraryCat=btn.dataset.libraryCat;el('libraryCategories').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderLibraryItems();});
const records=()=>{const x=window.NexusStore.read('nexus:feedback:v3',[]);return Array.isArray(x)?x:[];};
const showFeedback=()=>{el('feedbackRecords').innerHTML=records().map(x=>`<p><strong>${esc(x.kind)}:</strong> ${esc(x.text)}</p>`).join('');};
el('catalogFeedback').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));if(!d.text.trim())return;const r=window.NexusStore.write('nexus:feedback:v3',[{kind:d.kind,text:d.text.trim(),date:new Date().toISOString()},...records()].slice(0,50));ctx.notify(r.ok?'Observação guardada localmente; não enviada.':r.error);if(r.ok){e.currentTarget.reset();showFeedback();}};
showFeedback();renderLibraryItems();
}
function renderLibraryItems(){
const filtered=window.NexusCatalog.filter(engine.tools,{query:libraryQuery,category:libraryCat,access:el('libraryAccess')?.value,offline:el('libraryOffline')?.checked,freePlan:el('libraryFree')?.checked,api:el('libraryApi')?.checked,openSource:el('libraryOpen')?.checked,local:el('libraryLocal')?.checked,sort:el('librarySort')?.value}).filter(t=>!libraryFavorites||ctx.isFavorite(t.id));
el('libraryResults').innerHTML=`<div class="field-heading"><strong>${filtered.length} ferramenta(s)</strong><span>Sem notas de qualidade ou preços em tempo real</span></div>${filtered.length?`<div class="library-grid">${filtered.map(t=>`<article class="library-card"><div class="library-card-head">${toolLogo(t)}<div><h3>${esc(t.name)}</h3><small>${esc(t.owner)}</small></div><button class="mini-button" data-library-favorite="${t.id}" aria-pressed="${ctx.isFavorite(t.id)}" aria-label="Favoritar ${esc(t.name)}">${ctx.isFavorite(t.id)?'★':'☆'}</button></div><div class="library-tags">${t.tasks.map(k=>`<span>${esc(catNames[k])}</span>`).join('')}<span>${esc(window.NexusCatalog.accessLabels[t.access])}</span></div><p>${esc(Object.values(t.best)[0])}</p><p class="library-limit">${esc(t.cons[0])}</p><details><summary>Detalhes e fonte</summary><p>${esc(t.availability)}</p><p>Tipo: ${esc(t.productType)} · Plataforma: ${esc(t.platforms.join(', ')||'não verificada')}</p><p>Integração Loopins: não integrada. Conta: ${esc(t.account)}.</p><p>Competências confirmadas: ${esc(Object.entries(t.capabilities).filter(([,c])=>c.status==='supported').map(([k])=>window.NexusCatalog.capabilityLabels[k]).join(', ')||'nenhuma verificada')}</p><p>Plano: ${esc(t.accessDetails?.app?.note||'não verificado')}</p><p>Nível técnico (editorial): ${esc(t.facts?.technicalLevel||'não avaliado')}</p>${engine.similarTools(t.id,3).length?'<p>Semelhantes: '+esc(engine.similarTools(t.id,3).map(x=>x.name).join(', '))+'</p>':''}<p>Revisão: ${esc(t.reviewedAt||'não revalidada nesta versão')}</p><a class="ws-link" href="${t.source}" target="_blank" rel="noopener noreferrer">Fonte oficial ↗</a></details><div class="library-actions"><button class="mini-button" data-compare-from="${t.id}">Comparar</button><button class="mini-button" data-library-panel="${t.id}">Abrir painel</button>${link(t)}</div></article>`).join('')}</div>`:'<div class="ws-empty">Nenhuma ferramenta confirmada atende aos filtros. Tente relaxar um deles.</div>'}`;
el('libraryResults').querySelectorAll('[data-library-favorite]').forEach(b=>b.onclick=()=>{ctx.toggleFavorite(b.dataset.libraryFavorite);renderLibraryItems();});
el('libraryResults').querySelectorAll('[data-compare-from]').forEach(b=>b.onclick=()=>{compareIds=[b.dataset.compareFrom,...compareIds.filter(x=>x!==b.dataset.compareFrom)].slice(0,3);ctx.switchView('compare');});
el('libraryResults').querySelectorAll('[data-library-panel]').forEach(b=>b.onclick=()=>ctx.openPanel(b.dataset.libraryPanel));
}
function renderProfile(){
const S=window.NexusStore,p=profile(),ps=saved(),history=ctx.history(),favorites=engine.tools.filter(t=>ctx.isFavorite(t.id));
const feedback=S.read('nexus:feedback:v3',[]);
el('workspace').innerHTML=header('SEU ESPAÇO','Perfil e dados locais','Sem conta online e sem sincronização. Faça um backup antes de mudar de navegador ou endereço do site.')+
`<div class="profile-stats"><div class="metric"><span>Favoritos</span><strong>${favorites.length}</strong></div><div class="metric"><span>Buscas</span><strong>${history.length}</strong></div><div class="metric"><span>Prompts</span><strong>${ps.length}</strong></div></div>
<div class="ws-block"><form id="profileForm" class="ws-form"><label class="ws-field"><span>Seu apelido</span><input name="name" maxlength="48" value="${esc(p.name)}" autocomplete="nickname"></label><button class="primary-button" type="submit">Salvar nome</button></form><p class="ws-help">O Loopino, o lobo guia, vai te chamar por esse nome. Fica só neste navegador.</p><p class="ws-help">Uso estimado das chaves Loopins: ${S.bytes()===null?'indisponível':(S.bytes()/1024).toFixed(1)+' KB'} (UTF-16; não é a cota do navegador).</p>
<label class="ws-checkbox"><input id="privateMode" type="checkbox" ${S.isPrivate()?'checked':''}> Sessão privada: sem gravar novas alterações ou pesquisas</label><p class="ws-help">Dados anteriores continuam disponíveis. As mudanças desta sessão são temporárias; exporte antes de sair do modo privado.</p></div>
<div class="ws-block"><h2>Preferências de recomendação</h2><p class="ws-help">Viram o padrão dos filtros da pesquisa neste navegador.</p><form id="prefsForm" class="ws-form"><div class="ws-form-row">
<label class="ws-field"><span>Orçamento</span><select name="budget"><option value="any">Qualquer</option><option value="free">Grátis ou freemium confirmado</option><option value="free-strict">Somente totalmente grátis</option></select></label>
<label class="ws-field"><span>Experiência</span><select name="experience"><option value="any">Qualquer</option><option value="beginner">Iniciante</option><option value="advanced">Experiente</option></select></label>
<label class="ws-field"><span>Plataforma</span><select name="platform"><option value="any">Qualquer</option><option value="web">Web</option><option value="desktop">Desktop</option></select></label></div>
<label class="ws-checkbox"><input type="checkbox" name="offline"> Exigir modo offline confirmado</label>
<h3>Aparência</h3><div class="ws-form-row"><label class="ws-field"><span>Tema</span><select name="theme"><option value="auto">Automático (sistema)</option><option value="dark">Escuro</option><option value="light">Claro</option></select></label><label class="ws-field"><span>Tamanho do texto</span><select name="fontScale"><option value="normal">Normal</option><option value="large">Maior</option></select></label></div>
<h3>Efeitos</h3><label class="ws-checkbox"><input type="checkbox" name="sound"> Sons (abertura, uivo do lobo)</label><label class="ws-checkbox"><input type="checkbox" name="mascot"> Mostrar o Loopino (lobo guia)</label>
<button class="primary-button" type="submit">Salvar preferências</button></form></div>
<div class="ws-block"><h2>IA externa (opcional)</h2><p id="aiProfileStatus" class="ws-help">Verificando…</p><label class="ws-checkbox"><input type="checkbox" id="aiInterpret"> Usar IA externa para sugerir a interpretação das minhas pesquisas</label><p class="ws-help">Quando ativado e disponível, o texto da pesquisa é enviado ao provedor indicado pelo servidor do Loopins. O ranking continua local. Chat, Studio e comparação integrada pedem confirmação a cada uso.</p></div>
<div class="ws-block"><h2>Ferramentas que você abriu</h2><div id="toolUsage"></div><p class="ws-help">Contagem local de cliques em “Abrir site oficial”. Não sai do navegador.</p></div>
<div class="ws-block"><h2>O que fica onde</h2><ul><li><strong>Neste navegador:</strong> favoritos, histórico, prompts, projetos, feedback, preferências e contagem de uso.</li><li><strong>Enviado a terceiros:</strong> nada, exceto quando você usa um recurso de IA externa e confirma; nesse caso o texto vai ao provedor exibido.</li><li><strong>Nunca:</strong> senhas, credenciais de outros serviços ou rastreamento de navegação.</li></ul></div>
<div class="ws-block"><h2>Backup do seu espaço</h2><p class="ws-help">Inclui perfil, favoritos, pesquisas, prompts com projetos e etiquetas, e observações do catálogo. Backups 2.x continuam aceitos. Backup v4 inclui projetos, fluxos, versões e feedback. Mesclar mantém os objetos locais em conflito; copiar cria uma segunda versão dos projetos; substituir exige confirmação.</p><label class="ws-field"><span>Conflitos na importação</span><select id="backupMode"><option value="merge">Mesclar e manter dados locais em conflito</option><option value="copy">Importar projetos conflitantes como cópias</option><option value="replace">Substituir todos os dados</option></select></label><div class="ws-actions"><button id="exportBackup" class="outline-button">Exportar meus dados</button><button id="chooseBackup" class="outline-button">Importar backup</button><input id="importBackup" type="file" accept=".json,application/json" hidden><button id="clearLocal" class="outline-button danger">Apagar meus dados locais</button></div></div>`;
const st=window.NexusSettings.read(),pf=el('prefsForm');
for(const k of ['budget','experience','platform','theme','fontScale'])pf.elements.namedItem(k).value=st[k];pf.elements.namedItem('offline').checked=st.offline;pf.elements.namedItem('sound').checked=st.sound!==false;pf.elements.namedItem('mascot').checked=st.mascot!==false;
pf.onsubmit=e=>{e.preventDefault();const d=new FormData(pf);try{window.NexusSettings.update(x=>{for(const k of ['budget','experience','platform','theme','fontScale'])x[k]=d.get(k);x.offline=d.get('offline')==='on';x.sound=d.get('sound')==='on';x.mascot=d.get('mascot')==='on';});window.NexusExtras?.applyTheme();window.NexusMascot?.applyVisibility();ctx.notify(S.isPrivate()?'Preferências aplicadas só nesta sessão privada.':'Preferências salvas.');}catch(err){ctx.notify(err.message);}};
el('aiInterpret').checked=st.aiInterpret;
window.NexusProviders?.status().then(x=>{if(!el('aiProfileStatus'))return;el('aiProfileStatus').textContent=x.enabled?'Disponível: '+x.providerLabel+' · '+x.model+'. '+(x.dataNotice||''):(x.reason||'Indisponível.');el('aiInterpret').disabled=!x.enabled&&!st.aiInterpret;});
el('aiInterpret').onchange=e=>{try{if(e.target.checked&&!confirm('Ao ativar, o texto de cada pesquisa será enviado ao provedor de IA configurado no servidor do Loopins. Continuar?')){e.target.checked=false;return;}window.NexusSettings.update(x=>{x.aiInterpret=e.target.checked;x.aiConsentAt=e.target.checked?new Date().toISOString():null;});ctx.notify(e.target.checked?'IA externa ativada para interpretar pesquisas.':'IA externa desativada.');}catch(err){ctx.notify(err.message);}};
const usage=Object.entries(st.toolUsage).sort((a,b)=>b[1]-a[1]);el('toolUsage').innerHTML=usage.length?'<ul>'+usage.map(([id,n])=>'<li>'+esc(titleFor(id))+': '+n+'</li>').join('')+'</ul>':'<p class="ws-help">Nenhuma ainda.</p>';
el('profileForm').onsubmit=e=>{e.preventDefault();const r=S.write(store.profile,{name:F.clean(new FormData(e.currentTarget).get('name'),48)});ctx.notify(r.ok?(r.persistent?'Perfil salvo.':'Perfil alterado só nesta sessão.'):r.error);if(r.ok)window.NexusMascot?.nameSaved?.();};
el('privateMode').onchange=e=>{if(!e.target.checked&&!confirm('Sair da sessão privada e descartar mudanças temporárias? Exporte antes para preservá-las.')){e.target.checked=true;return;}S.setPrivate(e.target.checked);window.NexusEvolution.resetTransient();ctx.applyImported({favorites:S.read('nexus:favorites:v1',[]),history:S.read('nexus:history:v1',[])});renderProfile();};
el('exportBackup').onclick=()=>{try{downloadJSON(window.NexusEvolution.repo.exportAll());}catch(e){ctx.notify(e.message);}};
el('chooseBackup').onclick=()=>el('importBackup').click();
el('importBackup').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>8000000){ctx.notify('Limite de 8 MB para importação.');return;}
 try{const parsed=JSON.parse(await file.text()),mode=el('backupMode').value;
 if(mode==='replace'&&!confirm('Substituir TODOS os dados locais? Exporte um backup antes de continuar.'))return;
 window.NexusEvolution.repo.importAll(parsed,mode);window.NexusEvolution.resetTransient();
 ctx.applyImported({favorites:S.read('nexus:favorites:v1',[]),history:S.read('nexus:history:v1',[])});
 ctx.notify(S.isPrivate()?'Backup importado nesta sessão privada.':'Backup importado.');renderProfile();
 }catch(error){ctx.notify('Importação recusada: '+error.message);}
};
el('clearLocal').onclick=()=>{
if(S.isPrivate()){ctx.notify('Saia da sessão privada antes de apagar os dados persistentes.');return;}
if(!confirm('Apagar perfil, preferências, prompts, buscas, favoritos, projetos e observações deste navegador? Exporte um backup antes.'))return;
const r=S.writeMany({'nexus:settings:v5':window.NexusSettingsFactory.defaults(),[store.profile]:{name:''},[store.prompts]:[],'nexus:favorites:v1':[],'nexus:history:v1':[],'nexus:feedback:v3':[],[window.NexusProjects.KEY]:{version:4,projects:[],feedback:[],draft:null,migratedAt:new Date().toISOString()}});
if(!r.ok){ctx.notify(r.error);return;}window.NexusEvolution.resetTransient();ctx.applyImported({favorites:[],history:[]});window.NexusExtras?.applyTheme();ctx.notify('Dados locais apagados.');renderProfile();
};
}
function downloadJSON(obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='loopins-ai-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);ctx.notify('Backup exportado.');}
// Delegação após renderização: botões produzidos dinamicamente continuam funcionais.
function init(context){ctx=context;window.NexusEvolution.init(context);el('workspace').addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;

 if(button.id==='copySummary')attachResponseEventsOnce(button);
 });}
function attachResponseEventsOnce(){if(!responseResult)return;const r=responseResult;ctx.copy(`Comparação de respostas\n${r.a}: ${r.left.words} palavras, ${r.left.paragraphs} parágrafos\n${r.b}: ${r.right.words} palavras, ${r.right.paragraphs} parágrafos\nSimilaridade de vocabulário: ${r.similarity}% (não mede qualidade).`);}
window.NexusWorkspace={init,show,compareTask:data=>{comparisonTask=data;compareIds=data.items.map(t=>t.id);ctx.switchView('compare');},addCompare:id=>{if(!byId(id))return;compareIds=[id,...compareIds.filter(x=>x!==id)].slice(0,3);ctx.switchView('compare');}};
})();
