(function studioModule(){
'use strict';
const F=window.NexusFeatures,E=window.NexusEngine,S=window.NexusStore,P=window.NexusPromptEditor;
let activePromptId='',history=P.createHistory('');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let ctx,options={category:'auto',level:'complete',goal:'',language:'Português brasileiro'},output='',baseline='',edited=false;
const saved=()=>{const list=S.read('nexus:prompts:v2',[]);return Array.isArray(list)?list.filter(p=>p&&typeof p.text==='string'):[];};
const $=id=>document.getElementById(id);
const presets={
builder:{goal:'Criar site sem programar',category:'code',refinement:'site_builder'},poster:{goal:'Criar cartaz com título e preço legíveis',category:'image',refinement:'typography'},logo:{goal:'Criar logotipo SVG editável',category:'image',refinement:'vector'},photo:{goal:'Criar fotografia realista de produto',category:'image',refinement:'photo'},
voice:{goal:'Criar um assistente virtual que responda por voz no meu computador',platform:'Windows',details:'Ativação por palavra-chave, captura de microfone, reconhecimento de fala, comandos permitidos e resposta falada.',constraints:'Preferir alternativas gratuitas e locais; não executar comandos arbitrários.',category:'auto'},
site:{goal:'Criar um site responsivo usando HTML, CSS e JavaScript',details:'Navegação, formulário validado e acessibilidade.',category:'auto'},
debug:{goal:'Identificar e corrigir um bug no JavaScript',details:'Vou fornecer o código, o comportamento esperado e a mensagem de erro.',category:'code'},
image:{goal:'Criar uma imagem de uma cidade futurista sob chuva',details:'Plano aberto, reflexos nas ruas e luz azul e violeta',format:'16:9',category:'image'},
video:{goal:'Criar um vídeo mostrando meu aplicativo',details:'Mostrar o fluxo principal e o resultado final',category:'video'},
audio:{goal:'Gerar uma narração para meu vídeo',style:'Voz clara e ritmo calmo',category:'audio'},
study:{goal:'Estudar matemática a partir dos meus PDFs',audience:'Ensino médio',category:'study'},
research:{goal:'Pesquisar artigos científicos com fontes sobre energia solar',category:'research'},
slides:{goal:'Criar uma apresentação escolar sobre a corrida espacial',category:'presentation'},
text:{goal:'Escrever um roteiro de apresentação do meu projeto',category:'text'}};
function specFieldsHTML(){
 const seen=new Map();
 for(const [group,list] of Object.entries(F.specializedFields))for(const [k,label] of list){if(!seen.has(k))seen.set(k,{label,groups:[]});seen.get(k).groups.push(group);}
 return [...seen].map(([k,v])=>`<label class="ws-field" data-spec="${v.groups.join(' ')}"><span>${esc(v.label)}</span><input name="${k}" maxlength="600"></label>`).join('');
}
function field(name,label,type='input',max=180){return `<label class="ws-field" data-field="${name}"><span>${label}</span>${type==='textarea'?`<textarea name="${name}" maxlength="${max}" rows="3"></textarea>`:`<input name="${name}" maxlength="${max}">`}</label>`;}
function render(context){
ctx=context;
$('workspace').innerHTML=`<div class="workspace-heading"><span class="section-kicker">PROMPT STUDIO 5.0</span><h1>Da ideia ao pedido completo.</h1><p>Prepare, refine e salve instruções prontas para colar na ferramenta escolhida.</p></div>
<div class="prompt-examples">${Object.entries(presets).map(([id,p])=>`<button type="button" data-preset="${id}">${esc(({builder:'Site sem código',poster:'Cartaz',logo:'Logo SVG',photo:'Fotografia',voice:'Assistente por voz',site:'Site',debug:'Corrigir código',image:'Imagem',video:'Vídeo',audio:'Narração',study:'Estudos',research:'Pesquisa',slides:'Slides',text:'Roteiro'})[id])}</button>`).join('')}</div>
<div class="studio-layout"><div class="ws-block"><form id="studioForm" class="ws-form">
${field('goal','O que você quer que a IA faça? *','textarea',1400)}
<label class="ws-field"><span>Ferramenta de destino (opcional)</span><select name="targetTool"><option value="">Sem destino específico</option>${E.tools.map(t=>'<option value="'+t.id+'">'+esc(t.name)+'</option>').join('')}</select></label>
<input type="hidden" name="refinement">
<div class="ws-form-row"><label class="ws-field"><span>Tipo de tarefa</span><select name="category"><option value="auto">Detectar automaticamente</option>${Object.entries(F.labels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="ws-field"><span>Modo</span><select name="level"><option value="direct">Objetivo</option><option value="complete">Detalhado</option><option value="advanced">Técnico / Profissional</option></select></label></div>
${field('details','Requisitos, contexto e detalhes','textarea',2500)}
<div class="ws-form-row">${field('platform','Plataforma ou destino')}${field('audience','Público / nível de experiência')}</div>
<div class="ws-form-row">${field('style','Estilo / tom')}${field('format','Resultado esperado / tecnologias e formatos')}</div>
${field('constraints','Restrições','textarea',600)}
<div class="ws-form-row">${field('language','Idioma da saída', 'input',80)}${field('project','Projeto / pasta','input',80)}</div>
${field('tags','Etiquetas separadas por vírgula')}
${field('success','Como saberemos que o resultado está correto?','textarea',900)}
${field('examples','Exemplos ou materiais de referência','textarea',1800)}
<details class="spec-fields" id="studioSpecFields"><summary>Campos específicos da categoria</summary><p class="ws-help">Preencha só o que importa; campos vazios não entram no prompt.</p>${specFieldsHTML()}</details>
<details><summary>Três perguntas para refinar (opcionais)</summary><p>Quem usará o resultado? Em qual ambiente ele precisa funcionar? O que é indispensável para considerá-lo concluído?</p><p>Use os campos público, plataforma e critérios de sucesso para responder.</p></details>
<div id="studioDiagnosis" class="prompt-diagnosis" role="status"></div>
<div class="ws-actions"><button class="primary-button" type="submit">Atualizar a partir dos campos</button><button class="outline-button" type="button" id="studioClear">Limpar</button></div>
</form></div>
<div class="ws-block studio-output"><div class="field-heading"><strong>Prévia editável</strong><span id="studioState">Local · sem API</span></div>
<label class="ws-field"><span>Prompt final</span><textarea id="studioOutput" rows="22" maxlength="18000" spellcheck="false"></textarea></label>
<p class="ws-help">Ao editar o texto final, a prévia automática pausa para preservar suas mudanças. A busca continua usando o objetivo e a categoria dos campos.</p>
<div class="ws-actions"><button id="studioCopy" class="outline-button">Copiar</button><button id="studioSave" class="primary-button">Salvar</button><button id="studioFind" class="outline-button">Encontrar IAs</button><button id="studioRestore" class="outline-button">Restaurar prévia</button><button id="studioDuplicate" class="outline-button">Duplicar</button><button id="studioTxt" class="outline-button">Exportar .txt</button><button id="studioMd" class="outline-button">Exportar .md</button></div>
<div class="ws-actions"><button id="studioUndo" class="outline-button">Desfazer</button><button id="studioRedo" class="outline-button">Refazer</button><button id="studioFlow" class="outline-button">Criar fluxo</button><button id="studioProject" class="outline-button">Adicionar versão a projeto</button><a id="studioOfficial" class="outline-button" target="_blank" rel="noopener noreferrer" hidden>Abrir IA oficial</a></div>
<details><summary>Editar ou regenerar somente uma seção</summary><p>Regeneração determinística a partir dos campos; as outras seções são preservadas.</p><label class="ws-field"><span>Seção</span><select id="studioSectionChoice"></select></label><label class="ws-field"><span>Texto da seção</span><textarea id="studioSectionText" rows="6" maxlength="6000"></textarea></label><button id="studioSectionApply" class="outline-button">Aplicar edição da seção</button><button id="studioSectionRegenerate" class="outline-button">Regenerar somente esta seção</button></details>
<details><summary>Comparar duas versões de prompt</summary><label class="ws-field"><span>Outra versão</span><textarea id="studioOther" rows="5" maxlength="18000"></textarea></label><button class="outline-button" id="studioCompare">Comparar com o atual</button><p id="studioDiff" role="status"></p></details></div></div>
<div class="ws-block"><div class="field-heading"><strong>Ferramentas do Studio</strong><span id="studioAIState">Local</span></div>
<div class="studio-tools"><button class="outline-button" id="studioImprove" type="button">Melhorar o prompt atual (local)</button><button class="outline-button" id="studioVariants" type="button">Gerar versões alternativas</button><button class="outline-button" id="studioSpec" type="button">Ideia → especificação completa</button><button class="outline-button" id="studioAIGenerate" type="button" hidden>Gerar com IA externa</button><button class="outline-button" id="studioAIImprove" type="button" hidden>Melhorar com IA externa</button></div>
<div id="studioExtra" aria-live="polite"></div></div>
<div class="ws-block"><div class="field-heading"><strong>Biblioteca de modelos</strong><span>${F.templates.length} modelos por tipo de ferramenta</span></div><label class="ws-field"><span>Filtrar por ferramenta</span><select id="templateTool"><option value="">Todas</option>${[...new Set(F.templates.flatMap(t=>t.tools))].map(id=>E.tools.find(t=>t.id===id)).filter(Boolean).map(t=>'<option value="'+t.id+'">'+esc(t.name)+'</option>').join('')}</select></label><div class="template-grid" id="templateGrid"></div></div>
<div class="ws-block"><div class="field-heading"><strong>Biblioteca de prompts</strong><span>Até 30, no navegador</span></div><label class="ws-checkbox"><input type="checkbox" id="studioOnlyFav"> Só favoritos</label><label class="ws-field"><span>Buscar por objetivo, projeto ou etiqueta</span><input id="studioSavedSearch" type="search"></label><div id="studioSaved"></div></div>`;
const form=$('studioForm');
for(const [k,v] of Object.entries(options)){const f=form.elements.namedItem(k);if(f)f.value=v;}
form.elements.namedItem('goal').required=true;form.elements.namedItem('goal').minLength=6;
$('studioOutput').value=output;
form.oninput=()=>update(false);form.onchange=()=>update(false);
form.onsubmit=e=>{e.preventDefault();if(edited&&!confirm('Substituir as edições manuais pela prévia dos campos?'))return;edited=false;update(true);};
$('studioOutput').oninput=e=>{history.push(output);output=e.target.value;history.push(output);edited=true;$('studioState').textContent='Edição manual preservada';};
$('studioCopy').onclick=()=>ctx.copy(output);
$('studioSave').onclick=()=>save(false);
$('studioDuplicate').onclick=()=>save(true);
$('studioRestore').onclick=()=>{if(edited&&!confirm('Restaurar a prévia e descartar as edições manuais?'))return;edited=false;update(true);};
$('studioFind').onclick=()=>{try{const p=F.getPromptPlan(options);ctx.search(p.taskIntent,p.category,{refinement:options.refinement,constraintText:p.taskIntent.constraintText},output);}catch(e){ctx.notify(e.message);}};
$('studioClear').onclick=()=>{if((output||options.goal)&&!confirm('Limpar o rascunho atual? Prompts salvos serão mantidos.'))return;options={category:'auto',level:'complete',goal:'',language:'Português brasileiro'};activePromptId='';history.reset('');output='';edited=false;render(ctx);};
$('studioTxt').onclick=()=>download('txt');$('studioMd').onclick=()=>download('md');
$('studioCompare').onclick=()=>{if(!output||!$('studioOther').value.trim()){ctx.notify('Preencha as duas versões.');return;}const d=F.compareLines($('studioOther').value,output);$('studioDiff').textContent=d.added+' linhas distintas presentes só no atual; '+d.removed+' só na outra versão. Comparação literal, sem avaliação de qualidade.';};
$('studioOutput').onchange=refreshSections;
$('studioUndo').onclick=()=>applyOutput(history.undo(),false);
$('studioRedo').onclick=()=>applyOutput(history.redo(),false);
$('studioSectionChoice').onchange=()=>{$('studioSectionText').value=P.sections(output)[Number($('studioSectionChoice').value)]?.text||'';};
$('studioSectionApply').onclick=()=>{try{applyOutput(P.replaceSection(output,Number($('studioSectionChoice').value),$('studioSectionText').value));}catch(e){ctx.notify(e.message);}};
$('studioSectionRegenerate').onclick=()=>{try{const i=Number($('studioSectionChoice').value),part=P.sections(baseline)[i];if(!part)throw Error('A prévia não contém esta seção.');if(!confirm('Substituir somente esta seção pelo texto determinístico dos campos?'))return;applyOutput(P.replaceSection(output,i,part.text));}catch(e){ctx.notify(e.message);}};
$('studioFlow').onclick=()=>{try{window.NexusEvolution.start(F.getPromptPlan(options).taskIntent,{refinement:options.refinement,constraintText:options.constraints});}catch(e){ctx.notify(e.message);}};
$('studioProject').onclick=()=>{if(!output.trim()){ctx.notify('Gere um prompt primeiro.');return;}window.NexusEvolution.attachPrompt({goal:options.goal,text:output,options:{...options}});};
$('studioSavedSearch').oninput=renderSaved;$('studioOnlyFav').onchange=renderSaved;
$('studioImprove').onclick=()=>{try{const r=F.improvePrompt(output||options.goal,{category:F.getPromptPlan(options).category,targetTool:options.targetTool});showExtra('<h3>Melhoria local</h3><p class="ws-help">'+esc(r.note)+'</p>'+(r.unchanged?'<p>O prompt já contém objetivo, contexto, formato, restrições e critérios.</p>':'<ul>'+r.changes.map(c=>'<li><strong>'+esc(({objective:'Objetivo',context:'Contexto',format:'Formato',constraints:'Restrições',criteria:'Critérios de aceitação',quality:'Boas práticas',tool:'Ferramenta'})[c.section]||c.section)+':</strong> '+esc(c.why)+'</li>').join('')+'</ul><button class="primary-button" id="applyImprove">Aplicar melhoria ao prompt</button>'),()=>{$('applyImprove')?.addEventListener('click',()=>{applyOutput(r.improved);ctx.notify('Melhoria aplicada. Preencha os marcadores [preencha: ...].');});});}catch(e){ctx.notify(e.message);}};
$('studioVariants').onclick=()=>{try{const list=F.promptVariants(options);showExtra('<h3>Versões alternativas</h3><div class="variant-list">'+list.map((v,i)=>'<div><strong>'+esc(v.label)+'</strong> <span class="ws-help">'+esc(v.note)+'</span><pre>'+esc(v.text)+'</pre><button class="mini-button" data-variant="'+i+'">Usar esta versão</button></div>').join('')+'</div>',()=>{document.querySelectorAll('[data-variant]').forEach(b=>b.onclick=()=>{applyOutput(list[Number(b.dataset.variant)].text);ctx.notify('Versão aplicada ao prompt.');});});}catch(e){ctx.notify(e.message);}};
$('studioSpec').onclick=()=>{try{const r=F.ideaToSpec(options.goal,options);applyOutput(r.text);showExtra('<h3>Especificação gerada</h3><p>Responda às perguntas em aberto no final do prompt ou nos campos do formulário.</p><ul>'+r.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>');}catch(e){ctx.notify(e.message);}};
$('templateTool').onchange=renderTemplates;renderTemplates();
const aiCall=async mode=>{try{const st=await window.NexusProviders.status();if(!st.enabled)throw Error(st.reason);if(!confirm('O objetivo'+(mode==='improve'?' e o prompt atual':'')+' serão enviados a '+st.providerLabel+' ('+st.model+'). Não inclua dados pessoais. Continuar?'))return;showExtra('<p>Aguardando '+esc(st.providerLabel)+'…</p>');const r=await window.NexusProviders.prompt({mode,goal:options.goal,draft:output,category:F.getPromptPlan(options).category,targetTool:options.targetTool});showExtra('<h3>Resposta de '+esc(r.providerLabel)+' · '+esc(r.model)+'</h3>'+(r.changes.length?'<ul>'+r.changes.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul>':'')+'<pre>'+esc(r.prompt)+'</pre><button class="primary-button" id="applyAIPrompt">Usar este prompt</button><p class="ws-help">Gerado por IA externa: revise antes de usar.</p>',()=>{$('applyAIPrompt').onclick=()=>applyOutput(r.prompt);});}catch(e){showExtra('<p>IA externa indisponível: '+esc(e.message)+' Use as ferramentas locais acima.</p>');}};
$('studioAIGenerate').onclick=()=>aiCall('generate');$('studioAIImprove').onclick=()=>aiCall('improve');
window.NexusProviders?.status().then(st=>{if(!$('studioAIState'))return;$('studioAIState').textContent=st.enabled?'IA externa: '+st.providerLabel:'Local · sem API';$('studioAIGenerate').hidden=!st.enabled;$('studioAIImprove').hidden=!st.enabled;});
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{if(edited&&!confirm('Carregar exemplo e substituir o rascunho?'))return;options={category:'auto',level:options.level,language:'Português brasileiro',...presets[b.dataset.preset]};activePromptId='';history.reset('');edited=false;output='';render(ctx);});
update(false);renderSaved();
}
function showExtra(html,after){$('studioExtra').innerHTML='<div class="improve-out">'+html+'</div>';after?.();$('studioExtra').scrollIntoView({block:'nearest'});}
function renderTemplates(){const tool=$('templateTool').value;const list=F.templates.filter(t=>!tool||t.tools.includes(tool));$('templateGrid').innerHTML=list.map(t=>'<button type="button" data-template="'+t.id+'">'+esc(t.label)+'<small>'+esc(t.options.goal)+'</small></button>').join('');$('templateGrid').querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{const t=F.templates.find(x=>x.id===b.dataset.template);if(edited&&!confirm('Carregar o modelo e substituir o rascunho?'))return;options={level:options.level,language:'Português brasileiro',...t.options,targetTool:tool||t.tools[0]};activePromptId='';history.reset('');edited=false;output='';render(ctx);ctx.notify('Modelo carregado. Substitua os trechos entre colchetes.');});}
function update(force){
const form=$('studioForm');const next=Object.fromEntries(new FormData(form));if(options.goal!==next.goal){next.refinement='';form.elements.namedItem('refinement').value='';}options={...options,...next};
let plan;
try{plan=F.getPromptPlan(options);baseline=F.generatePrompt(options);$('studioDiagnosis').textContent='Tarefa: '+F.labels[plan.category]+'. '+(F.promptMissing(options).length?'Você ainda pode informar: '+F.promptMissing(options).join(', ')+'.':'Objetivo, formato e critérios preenchidos.');
if(!edited||force){history.push(output);output=baseline;history.push(output);$('studioOutput').value=output;$('studioState').textContent='Prévia atualizada';}}
catch(e){$('studioDiagnosis').textContent=e.message;if(!edited){output='';$('studioOutput').value='';}}
refreshSections();const official=E.tools.find(t=>t.id===options.targetTool);$('studioOfficial').hidden=!official;if(official)$('studioOfficial').href=official.url;
const quick=options.level==='direct',advanced=options.level==='advanced';
for(const name of ['details','platform','audience','style','format','constraints','success','language'])document.querySelector('[data-field="'+name+'"]').hidden=quick&&!['details','format'].includes(name);
for(const name of ['examples'])document.querySelector('[data-field="'+name+'"]').hidden=!advanced;
if(plan){document.querySelectorAll('[data-spec]').forEach(f=>{f.hidden=!f.dataset.spec.split(' ').includes(plan.category);});const any=[...document.querySelectorAll('[data-spec]')].some(f=>!f.hidden);$('studioSpecFields').hidden=!any||quick;const p=document.querySelector('[data-field="platform"] span');p.textContent=['image','video'].includes(plan.category)?'Cenário / destino de uso':'Plataforma / contexto';document.querySelector('[data-field="style"] span').textContent=plan.category==='image'?'Direção artística / iluminação':'Estilo / tom';}
}
function save(duplicate){
if(!output.trim()){ctx.notify('Crie um prompt antes de salvar.');return;}
try{const plan=F.getPromptPlan(options),all=saved();if(!duplicate&&all.some(p=>p.text===output)){ctx.notify('Este prompt já está salvo.');return;}
if(all.length>=30&&(duplicate||!activePromptId)){ctx.notify('Limite de 30 prompts. Exporte ou exclua um item antes de salvar.');return;}
const item={id:!duplicate&&activePromptId?activePromptId:'p'+Date.now()+Math.random().toString(36).slice(2,6),goal:plan.objective,category:plan.category,text:output,options:{...options},project:options.project||'',tags:options.tags||'',created:new Date().toISOString()};
if(duplicate)item.goal+=' (cópia)';
const previous=!duplicate?all.find(p=>p.id===activePromptId):null;item.versions=P.snapshot(previous||{},output);
const result=S.write('nexus:prompts:v2',[item,...all.filter(p=>p.id!==item.id)]);if(result.ok)activePromptId=item.id;ctx.notify(result.ok?(result.persistent?'Prompt salvo.':'Prompt guardado só nesta sessão privada.'):result.error);if(result.ok)renderSaved();
}catch(e){ctx.notify(e.message);}
}
function renderSaved(){
const favs=new Set(window.NexusSettings?.read().promptFavorites||[]),onlyFav=$('studioOnlyFav')?.checked;
const q=E.normalize($('studioSavedSearch').value),items=saved().filter(p=>E.normalize([p.goal,p.project,p.tags].join(' ')).includes(q)).filter(p=>!onlyFav||favs.has(p.id)).sort((a,b)=>Number(favs.has(b.id))-Number(favs.has(a.id)));
$('studioSaved').innerHTML=items.length?items.map(p=>`<div class="saved-item"><div><strong>${esc(p.goal)}</strong><span>${esc(p.project||'Sem projeto')} · ${esc(p.tags||F.labels[p.category]||'Prompt')}</span></div><div class="ws-actions"><button class="mini-button" data-studio-fav="${esc(p.id)}" aria-pressed="${favs.has(p.id)}" aria-label="Favoritar prompt">${favs.has(p.id)?'★':'☆'}</button><button class="mini-button" data-studio-load="${esc(p.id)}">Abrir</button><button class="mini-button" data-studio-versions="${esc(p.id)}">Versões (${p.versions?.length||1})</button><button class="mini-button danger" data-studio-delete="${esc(p.id)}">Excluir</button></div></div>`).join(''):'<p class="ws-help">Nenhum prompt encontrado.</p>';
$('studioSaved').querySelectorAll('[data-studio-fav]').forEach(b=>b.onclick=()=>{try{window.NexusSettings.toggleFavoritePrompt(b.dataset.studioFav);renderSaved();}catch(e){ctx.notify(e.message);}});
$('studioSaved').querySelectorAll('[data-studio-load]').forEach(b=>b.onclick=()=>{const p=saved().find(x=>x.id===b.dataset.studioLoad);if(!p)return;if(edited&&!confirm('Substituir o rascunho pelo prompt salvo?'))return;activePromptId=p.id;options={category:p.category,level:'complete',language:'Português brasileiro',...p.options,goal:p.goal,project:p.project||'',tags:p.tags||''};output=p.text;edited=true;render(ctx);});
$('studioSaved').querySelectorAll('[data-studio-versions]').forEach(b=>b.onclick=()=>{const p=saved().find(x=>x.id===b.dataset.studioVersions);if(!p)return;const versions=p.versions?.length?p.versions:[{text:p.text,created:p.created}];$('studioOther').value=versions[Math.max(0,versions.length-2)].text;const panel=document.createElement('div');panel.className='ws-block';panel.innerHTML='<h3>Versões de '+esc(p.goal)+'</h3>'+versions.map((v,i)=>'<details><summary>Versão '+(i+1)+' — '+esc(v.created)+'</summary><pre class="version-text">'+esc(v.text)+'</pre><button class="mini-button" data-restore-version="'+i+'">Editar esta versão</button></details>').join('');b.closest('.saved-item').appendChild(panel);panel.querySelectorAll('[data-restore-version]').forEach(btn=>btn.onclick=()=>{if(edited&&!confirm('Substituir o rascunho pela versão escolhida?'))return;activePromptId=p.id;options={...p.options,goal:p.goal};output=versions[Number(btn.dataset.restoreVersion)].text;edited=true;history.reset(output);render(ctx);});b.disabled=true;});
$('studioSaved').querySelectorAll('[data-studio-delete]').forEach(b=>b.onclick=()=>{if(!confirm('Excluir este prompt salvo?'))return;const r=S.write('nexus:prompts:v2',saved().filter(p=>p.id!==b.dataset.studioDelete));ctx.notify(r.ok?'Prompt excluído.':r.error);renderSaved();});
}
function download(ext){if(!output){ctx.notify('Gere um prompt primeiro.');return;}const url=URL.createObjectURL(new Blob([output],{type:ext==='md'?'text/markdown;charset=utf-8':'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='loopins-prompt.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function prepare(intent,toolId){
 if(edited&&!confirm('Substituir o rascunho atual por esta tarefa?'))return false;
 options={category:intent.taskFamily==='all'?'auto':intent.taskFamily,level:intent.experience==='advanced'?'advanced':'complete',audience:intent.experience==='beginner'?'Iniciante: explique cada etapa e pré-requisito.':intent.experience==='advanced'?'Experiente: seja técnico e conciso.':'',language:'Português brasileiro',goal:intent.originalQuery,constraints:intent.constraintText||'',refinement:intent.subtask,targetTool:toolId||''};
 output='';baseline='';edited=false;activePromptId='';history.reset('');return true;
}
function applyOutput(value,record=true){if(record){history.push(output);history.push(value);}output=value;edited=true;$('studioOutput').value=output;$('studioState').textContent='Edição manual preservada';refreshSections();}
function refreshSections(){if(!$('studioSectionChoice'))return;const current=$('studioSectionChoice').value;$('studioSectionChoice').innerHTML=P.sections(output).map(s=>'<option value="'+s.index+'">'+esc((s.index+1)+'. '+s.title)+'</option>').join('');if(P.sections(output)[Number(current)])$('studioSectionChoice').value=current;$('studioSectionText').value=P.sections(output)[Number($('studioSectionChoice').value)]?.text||'';const status=history.state();$('studioUndo').disabled=!status.canUndo;$('studioRedo').disabled=!status.canRedo;}
function loadDraft(fields,text){if(edited&&!confirm('Substituir o rascunho atual?'))return false;options={category:'auto',level:'advanced',language:'Português brasileiro',...fields};output=String(text||'');baseline='';edited=!!output;activePromptId='';history.reset(output);return true;}
window.NexusStudio={render,prepare,loadDraft,setProjectLink:(projectId,promptId)=>{options.projectId=projectId;options.promptId=promptId;}};
})();