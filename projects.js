(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./engine.js'):root.NexusEngine,typeof module!=='undefined'&&module.exports?require('./features.js'):root.NexusFeatures,typeof module!=='undefined'&&module.exports?require('./catalog.js'):root.NexusCatalog);if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusProjects=api;})(globalThis,function(E,F,C){
'use strict';
const KEY='nexus:workspace:v4',VERSION=4,engineVersion='evolution-4';
const copy=x=>JSON.parse(JSON.stringify(x));
const text=(x,n=2000)=>String(x??'').trim().slice(0,n);
const uid=()=>globalThis.crypto?.randomUUID?.()||'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
const now=()=>new Date().toISOString();
const tool=id=>E.tools.find(t=>t.id===id);
const statuses=['todo','doing','done'],statusNames={todo:'A fazer',doing:'Em andamento',done:'Concluído'};
function safeLink(value){if(!value)return '';const url=C.safeURL(value);if(!url)throw Error('Use um link HTTPS sem credenciais.');return url;}
const templates={
voice:[
['Arquitetura e permissões','Definir componentes e limites do assistente','Diagrama e lista de dependências','Defina ativação, microfone, reconhecimento, roteador de comandos, síntese e encerramento. Separe interfaces de fala de execução de comandos.','software','moderada'],
['Implementação local','Construir o núcleo no Windows','Arquivos executáveis e instruções de instalação','Implemente configuração, lista permitida de comandos, logs sem áudio sensível e inicialização. Considere o hardware e dependências informados.','manual_code','alta'],
['Reconhecimento e resposta falada','Conectar entrada e saída de voz','Pipeline de voz testável','Implemente captura de microfone, reconhecimento e síntese com adaptadores substituíveis. Trate silêncio, permissão negada e comandos desconhecidos. Não execute texto arbitrário no terminal.','software','alta'],
['Testes no Windows e falhas','Verificar funcionamento e consumo','Casos de teste e resultados registrados','Teste inicialização, ativação falsa, latência percebida, uso de RAM, microfone indisponível, rede ausente, comandos em sequência e encerramento. Registre resultados reais.','repository_fix','alta'],
['Distribuição e execução independente','Executar fora do editor','Launcher e guia de reversão','Prepare ambiente, atalho e instruções para executar sem VS Code. Só configure inicialização automática depois de validar; documente como desativar.','manual_code','moderada']],
builder:[
['Conteúdo e navegação','Definir estrutura do site','Mapa de páginas e conteúdo','Liste público, páginas, ações principais, conteúdo disponível e campos dos formulários. Marque conteúdo ausente sem inventar depoimentos.','text','baixa'],
['Construção por descrição','Criar o site no builder','Site navegável em prévia','Implemente páginas, navegação e estados de erro a partir do briefing. Preserve identidade visual; não apresente formulários sem destino como integrados.','site_builder','moderada'],
['Revisão e publicação','Validar a experiência antes de publicar','Checklist testado e plano de publicação','Teste celular, teclado, links e formulários. Revise privacidade, domínio e custos. Publique somente com autorização explícita.','site_builder','moderada']],
edit:[
['Reproduzir e localizar','Entender o defeito e o código atual','Diagnóstico com reprodução','Inspecione estrutura, dependências e testes; reproduza a falha e identifique causa antes de editar.','repository_fix','moderada'],
['Correção incremental','Modificar arquivos sem regressões','Diff revisável','Aplique mudanças pequenas e preserve funcionalidades existentes. Explique decisões e evite alterações fora do escopo.','repository_fix','alta'],
['Testes e entrega','Verificar correção e reversão','Relatório de testes e rollback','Execute casos do defeito, testes existentes e verifique UI quando disponível. Documente comandos e limites não testados.','repository_fix','moderada']],
poster:[
['Mensagem e texto exato','Definir conteúdo legível','Briefing com título e preço','Confirme ortografia, preço, público, proporção e hierarquia. Use apenas dados fornecidos.','text','baixa'],
['Composição tipográfica','Produzir a peça visual','Cartaz com texto','Crie composição com título e preço exatos, contraste e margens; inclua referências autorizadas.','typography','moderada'],
['Revisão e entrega','Conferir texto e formato','Arquivo final revisado','Compare cada palavra e número com o briefing. Revise legibilidade e proporção antes de exportar.','typography','moderada']],
video:[
['Roteiro e storyboard','Organizar cenas e intenção','Roteiro por cenas','Defina público, cenas, duração pretendida e continuidade. Não invente uma duração suportada pelo provedor.','text','moderada'],
['Produção das cenas','Gerar a mídia solicitada','Clipes por cena','Descreva enquadramento, movimento de câmera, ação, transições e referências; confira limites do serviço.','video','alta'],
['Montagem e revisão','Conferir continuidade e áudio','Vídeo final e lista de ajustes','Revise cortes, sincronização, créditos e direitos. Ferramenta de geração não substitui um editor quando a montagem exigir edição manual.','video','moderada']],
research:[
['Pergunta e protocolo','Delimitar a busca','Pergunta e critérios de inclusão','Defina escopo, termos, período, população quando relevante e critérios de inclusão/exclusão.','science','moderada'],
['Coleta e triagem','Encontrar estudos relevantes','Tabela de estudos com fontes','Busque literatura e registre título, autores, ano, DOI/URL e motivo da seleção. Diferencie revisão por pares e preprints.','science','alta'],
['Síntese crítica','Comparar evidências','Síntese com limites e referências','Extraia método, resultados e limitações. Não invente estudos nem transforme associação em causalidade; confira cada fonte.','science','alta']],
portfolio:[
['Identidade e projetos','Selecionar trabalhos reais','Conteúdo do portfólio','Defina apresentação, projetos, evidências e contato fornecido. Não invente experiência ou clientes.','text','baixa'],
['Implementação do portfólio','Organizar apresentação pública','Portfólio navegável','Crie páginas responsivas, cartões de projetos e navegação clara; mantenha dados de contato sob controle do autor.','site_builder','moderada'],
['Verificação e entrega','Revisar acessibilidade e links','Portfólio pronto para revisão','Teste teclado, celular, contraste e links. Confira dados pessoais e autorização antes de publicar.','site_builder','moderada']],
software:[
['Arquitetura','Definir componentes e contratos','Plano técnico','Liste requisitos, dados, entradas/saídas e dependências; justifique escolhas conforme a plataforma.','software','moderada'],
['Implementação','Construir comportamento real','Código funcional','Implemente os arquivos necessários; não substitua serviços ausentes por respostas fingidas.','manual_code','alta'],
['Testes e distribuição','Validar e documentar execução','Testes e guia de uso','Execute testes do objetivo, trate erros e explique instalação, execução e limitações.','repository_fix','moderada']],
image:[
['Direção visual','Definir composição e entrega','Briefing visual','Defina assunto, iluminação, paleta, proporção, referências e uso final.','illustration','baixa'],
['Produção visual','Gerar ou editar a imagem','Imagem no formato solicitado','Siga o briefing e preserve os requisitos de edição/vetor/fotografia; não substitua um formato por outro.','illustration','moderada'],
['Revisão visual','Conferir artefatos e formato','Imagem revisada','Confira bordas, elementos, transparência, texto e dimensões. Se exigir SVG, inspecione os caminhos editáveis.','illustration','moderada']],
presentation:[
['Roteiro e mensagem','Definir público, mensagem central e sequência','Roteiro por slide','Liste público, tempo disponível, mensagem principal e tópicos. Use somente dados que você pode citar.','text','baixa'],
['Montagem dos slides','Gerar os slides a partir do roteiro','Apresentação editável','Crie os slides com títulos curtos, uma ideia por slide e indicação de imagens. Revise fatos e números.','presentation','moderada'],
['Diagramas e visuais','Explicar processos com imagens','Diagramas ou infográficos','Transforme processos e comparações em diagramas simples; confira se os rótulos estão corretos.','diagram','baixa'],
['Ensaio e revisão','Ajustar tempo e clareza','Apresentação revisada e notas','Ensaie com cronômetro, corte excessos e prepare respostas para perguntas prováveis.','text','baixa']],
automation:[
['Mapear o processo','Entender gatilho, dados e exceções','Diagrama do processo atual','Descreva o que dispara a tarefa, quais aplicativos participam, que dados passam entre eles e o que pode dar errado.','text','baixa'],
['Construir o fluxo','Montar a automação','Fluxo configurado em modo de teste','Configure gatilho e ações com permissões mínimas. Use dados fictícios; não envie mensagens reais.','automation','moderada'],
['Testar falhas','Verificar erros e repetições','Registro de testes','Teste dados ausentes, duplicados, falha de conexão e limite de uso. Configure aviso em caso de erro.','automation','moderada'],
['Ativar e monitorar','Colocar em uso com segurança','Fluxo ativo e checklist de monitoramento','Ative somente após os testes, acompanhe as primeiras execuções e documente como desligar.','automation','baixa']],
data:[
['Preparar os dados','Conferir colunas e qualidade','Planilha limpa e dicionário de colunas','Verifique valores ausentes, duplicados, formatos de data e unidades. Não altere a planilha original.','data_analysis','baixa'],
['Analisar','Responder às perguntas com cálculos','Tabelas e cálculos explicados','Faça os cálculos pedidos e explique cada fórmula. Indique quando a amostra não permite conclusões.','data_analysis','moderada'],
['Visualizar e concluir','Comunicar os resultados','Gráficos e resumo','Escolha gráficos adequados a cada pergunta e escreva conclusões com limitações.','data_analysis','moderada']],
chatbot:[
['Conteúdo aprovado','Reunir o que o bot pode responder','Base de conhecimento','Junte perguntas frequentes, horários e políticas aprovadas. Marque o que o bot não deve responder.','text','baixa'],
['Construir o agente','Montar fluxos e base de conhecimento','Agente em modo de teste','Configure saudação, respostas, coleta mínima de dados e transferência para humano.','chatbot','moderada'],
['Testar e publicar','Validar com perguntas reais','Relatório de testes e canal publicado','Teste perguntas difíceis e fora do escopo. Publique no site ou WhatsApp somente após aprovação.','chatbot','moderada']],
game:[
['Conceito do jogo','Definir regras e objetivo','Documento curto de design','Descreva gênero, controles, objetivo, condição de vitória e derrota.','text','baixa'],
['Protótipo jogável','Gerar a primeira versão','Jogo jogável no navegador','Construa um nível simples com as regras principais e itere por conversa.','game','moderada'],
['Teste e publicação','Ajustar dificuldade e publicar','Jogo revisado e link','Peça para outras pessoas testarem, corrija bugs e confira direitos de imagens e sons antes de publicar.','game','moderada']],
study:[
['Diagnóstico','Saber o que estudar','Lista de tópicos e prazos','Liste conteúdos da prova, o que você já sabe e quanto tempo tem.','study','baixa'],
['Explicações e materiais','Aprender os tópicos','Resumos e exemplos resolvidos','Estude cada tópico com explicações passo a passo; use seus próprios materiais quando tiver.','study','moderada'],
['Exercícios e revisão','Fixar e conferir','Exercícios com gabarito e revisão de erros','Resolva exercícios sem consultar a resposta e revise os erros. Confira fatos em fonte confiável.','study','moderada']],
audio:[
['Roteiro','Definir o que será falado ou tocado','Roteiro com duração','Escreva o texto ou estrutura musical, tom e duração. Respeite direitos e consentimento de vozes.','text','baixa'],
['Produção do áudio','Gerar ou gravar','Arquivo de áudio','Produza a narração, música ou gravação conforme o roteiro.','voice','moderada'],
['Tratamento e revisão','Limpar e conferir','Áudio final','Remova ruídos, ajuste volume e confira pronúncia e trechos.','audio_clean','baixa']],
demo:[
['Roteiro da demonstração','Escolher o que mostrar','Roteiro com passos','Liste o problema, o fluxo principal a demonstrar e o resultado. Prepare dados de exemplo sem informações pessoais.','text','baixa'],
['Gravação da tela','Capturar o funcionamento','Gravação bruta','Grave a tela seguindo o roteiro; feche notificações e abas com dados pessoais.','screen_video','baixa'],
['Edição e legendas','Deixar o vídeo claro','Vídeo editado com legendas','Corte pausas, acrescente legendas e, se quiser, narração.','video_edit','moderada']],
general:[
['Definir a entrega','Organizar o trabalho','Briefing com requisitos','Identifique objetivo, materiais, critérios de sucesso e o que ainda falta informar.','text','baixa'],
['Executar a tarefa','Produzir o resultado solicitado','Primeira versão utilizável','Siga o briefing, use os materiais fornecidos e sinalize qualquer informação não confirmada.','text','moderada'],
['Revisar a entrega','Verificar os critérios','Versão revisada','Compare com requisitos, corrija lacunas e registre como o resultado foi verificado.','text','moderada']]
};
function makeStep(row,index,intent,preferences={}){
 const [title,purpose,deliverable,instruction,subtask,difficulty]=row;
 const query=title+' — '+purpose+': '+deliverable;
 const result=E.recommend(query,'all',{...preferences,refinement:subtask,constraintText:intent.constraintText||''});
 return {id:uid(),title,purpose,deliverable,instruction,subtask,difficulty,dependencies:index?[index-1]:[],status:'todo',notes:'',links:[],toolId:result.items[0]?.id||'',candidates:result.eligible.map(t=>t.id),reason:result.items[0]?.why||'Nenhuma ferramenta confirmada para esta etapa com os filtros atuais.',prompt:'',promptEdited:false};
}
function createPlan(input,preferences={}){
 const intent=typeof input==='object'?copy(input):E.parseTask(input,preferences);
 if(text(intent.originalQuery).length<6)throw Error('Descreva um objetivo com pelo menos 6 caracteres.');
 const n=E.normalize(intent.originalQuery);
 let kind=intent.subtask==='screen_video'?'demo':intent.subtask==='game'?'game':intent.taskFamily==='automation'?'automation':intent.taskFamily==='data'?'data':intent.taskFamily==='agents'?'chatbot':intent.taskFamily==='presentation'?'presentation':['study','documents'].includes(intent.subtask)?'study':intent.taskFamily==='audio'&&!['transcription'].includes(intent.subtask)?'audio':intent.taskFamily==='code'&&/\b(assistente|fala|voz)\b/.test(n)?'voice':/portfolio/.test(n)?'portfolio':intent.subtask==='repository_fix'?'edit':['site_builder','landing','fullstack','wordpress'].includes(intent.subtask)?'builder':intent.subtask==='typography'?'poster':['science','web','documents'].includes(intent.subtask)?'research':intent.taskFamily==='video'?'video':intent.taskFamily==='code'?'software':intent.taskFamily==='image'?'image':'general';
 const rows=copy(templates[kind]);
 if(kind==='image')rows.forEach(r=>r[4]=intent.subtask);
 if(kind==='video')rows[1][4]=intent.subtask;
 if(kind==='research')rows.forEach(r=>r[4]=intent.subtask);
 if(kind==='builder'&&intent.subtask!=='site_builder')rows.slice(1).forEach(r=>r[4]=intent.subtask);
 if(kind==='audio')rows[1][4]=intent.subtask;
 if(kind==='general')rows.slice(1).forEach(r=>r[4]=intent.subtask==='general'?'text':intent.subtask);
 const plan={id:uid(),objective:intent.originalQuery,intent,preferences:{...preferences},kind,created:now(),updated:now(),steps:rows.map((r,i)=>makeStep(r,i,intent,preferences))};
 return plan;
}
function stepPrompt(plan,index,options={}){
 const s=plan.steps[index];if(!s)throw Error('Etapa inexistente.');
 const generated=F.generatePrompt({goal:plan.objective,category:E.subtasks[s.subtask]?.family||'auto',refinement:s.subtask,targetTool:s.toolId,level:'advanced',details:s.instruction+'\nEntregável: '+s.deliverable+'\nDependências: '+s.dependencies.map(i=>plan.steps[i]?.title).filter(Boolean).join(', '),constraints:plan.intent.constraintText||'',...options});
 return 'OBJETIVO: '+plan.objective+'\n\nETAPA: '+s.title+'\nFINALIDADE: '+s.purpose+'\n\n'+generated;
}
function moveStep(plan,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=plan.steps.length||to>=plan.steps.length)throw Error('Ordem inválida.');
 const steps=plan.steps,ids=steps.map(s=>s.id),deps=new Map(steps.map(s=>[s.id,s.dependencies.map(i=>ids[i])]));
 steps.splice(to,0,steps.splice(from,1)[0]);
 for(const s of steps)s.dependencies=deps.get(s.id).map(id=>steps.findIndex(x=>x.id===id)).filter(i=>i>=0&&steps[i].id!==s.id);
 plan.updated=now();return plan;
}
function removeStep(plan,index){if(plan.steps.length<=1)throw Error('Mantenha pelo menos uma etapa.');const removed=plan.steps[index];if(!removed)throw Error('Etapa inexistente.');plan.steps.splice(index,1);for(const s of plan.steps)s.dependencies=s.dependencies.filter(i=>i!==index).map(i=>i>index?i-1:i);return plan;}
function duplicateStep(plan,index){if(plan.steps.length>=30)throw Error('Limite de 30 etapas.');const s=copy(plan.steps[index]);s.id=uid();s.title+=' (cópia)';s.status='todo';plan.steps.push(s);return plan;}
function projectFrom(input,recommendation=null){
 const plan=input?.steps?copy(input):createPlan(input);
 return {id:uid(),title:text(plan.objective,100),description:'',category:plan.intent.taskFamily,created:now(),updated:now(),intent:copy(plan.intent),recommendation:recommendation?{query:text(recommendation.request,1400),ids:recommendation.items.map(t=>t.id),capturedAt:now(),engineVersion}:null,plan,toolIds:[...new Set(plan.steps.map(s=>s.toolId).filter(Boolean))],prompts:[],notes:'',links:[],tags:[],favorite:false,status:'active',checklist:[],deletedAt:null,activity:[{at:now(),text:'Projeto criado'+(recommendation?' a partir de uma recomendação':'')}]};
}
function versionPrompt(project,record){
 if(!text(record.text,18000))throw Error('Prompt vazio.');
 let p=project.prompts.find(p=>p.id===record.id||(record.stepId&&p.stepId===record.stepId));if(!p){p={id:uid(),goal:text(record.goal,1400),options:copy(record.options||{}),stepId:record.stepId||'',versions:[]};project.prompts.push(p);}
 if(p.versions.at(-1)?.text===record.text)return p;
 if(p.versions.length>=30)throw Error('Limite de 30 versões por prompt; exporte antes de remover.');
 p.versions.push({id:uid(),text:text(record.text,18000),created:now()});p.options=copy(record.options||p.options);project.updated=now();return p;
}
function array(x,label,max){if(!Array.isArray(x)||x.length>max)throw Error('Lista inválida: '+label);return x;}
function validatePlan(p){
 if(!p||!Array.isArray(p.steps))throw Error('Plano inválido.');
 const preferences={budget:['free','free-strict','any','paid'].includes(p.preferences?.budget)?p.preferences.budget:'any',experience:['beginner','advanced','any'].includes(p.preferences?.experience)?p.preferences.experience:'any',offline:!!p.preferences?.offline,refinement:E.subtasks[p.intent?.subtask]?p.intent.subtask:undefined,constraintText:text(p.intent?.constraintText,800),outputFormat:['svg','html'].includes(p.intent?.constraints?.outputFormat)?p.intent.constraints.outputFormat:null,privacy:!!p.intent?.constraints?.privacy,integration:p.preferences?.integration==='connected'?'connected':'any'};
 const intent=E.parseTask(text(p.objective,1400),preferences),steps=array(p.steps,'etapas',30).map(s=>{
 if(!s||!text(s.title)||!statuses.includes(s.status))throw Error('Etapa inválida.');
 const links=array(s.links||[],'links',20).map(safeLink);
 if((s.dependencies||[]).some(i=>!Number.isInteger(i)||i<0||i>=p.steps.length||p.steps[i]?.id===s.id))throw Error('Dependência inválida na etapa.');
 return {id:text(s.id,80)||uid(),title:text(s.title,160),purpose:text(s.purpose,600),deliverable:text(s.deliverable,600),instruction:text(s.instruction,3000),subtask:E.subtasks[s.subtask]?s.subtask:intent.subtask,difficulty:['baixa','moderada','alta'].includes(s.difficulty)?s.difficulty:'moderada',dependencies:array(s.dependencies||[],'dependências',30).filter(i=>Number.isInteger(i)&&i>=0&&i<p.steps.length),status:s.status,notes:text(s.notes,4000),links,toolId:tool(s.toolId)?s.toolId:'',candidates:array(s.candidates||[],'candidatas',100).filter(id=>tool(id)),reason:text(s.reason,1200),prompt:text(s.prompt,18000),promptEdited:!!s.promptEdited};
 });
 if(!steps.length||new Set(steps.map(s=>s.id)).size!==steps.length)throw Error('Etapas vazias ou IDs duplicados.');
 return {id:text(p.id,80)||uid(),objective:text(p.objective,1400),intent:{...intent,subtask:E.subtasks[p.intent?.subtask]?p.intent.subtask:intent.subtask,constraintText:text(p.intent?.constraintText,800)},preferences,kind:text(p.kind,40),created:text(p.created,40),updated:text(p.updated,40),steps};
}
function validateProject(p){
 if(!p||!text(p.id)||!text(p.title))throw Error('Projeto inválido.');
 const plan=validatePlan(p.plan);
 const prompts=array(p.prompts||[],'prompts do projeto',100).map(x=>({id:text(x.id,80)||uid(),goal:text(x.goal,1400),stepId:text(x.stepId,80),options:Object.fromEntries(['goal','category','level','details','audience','constraints','format','platform','style','success','language','examples','targetTool','refinement','environment','composition','lighting','framing','colors','aspect','keyDetails','preserve','characters','motion','camera','duration','continuity','projectContext','tech','features','architecture','files','errors','security','tests','delivery','depth','structure','sources','tone'].map(k=>[k,text(x.options?.[k],2500)])),versions:array(x.versions||[],'versões',30).map(v=>({id:text(v.id,80)||uid(),text:text(v.text,18000),created:text(v.created,40)}))}));
 return {id:text(p.id,80),title:text(p.title,100),description:text(p.description,2000),category:plan.intent.taskFamily,created:text(p.created,40)||now(),updated:text(p.updated,40)||now(),intent:plan.intent,plan,recommendation:p.recommendation?{query:text(p.recommendation.query,1400),ids:array(p.recommendation.ids||[],'recomendações',100).filter(id=>tool(id)),capturedAt:text(p.recommendation.capturedAt,40),engineVersion:text(p.recommendation.engineVersion,40)}:null,toolIds:array(p.toolIds||[],'ferramentas',100).filter(id=>tool(id)),prompts,notes:text(p.notes,8000),links:array(p.links||[],'referências',30).map(safeLink),tags:array(p.tags||[],'tags',20).map(x=>text(x,40)),favorite:!!p.favorite,status:['active','archived'].includes(p.status)?p.status:'active',checklist:array(p.checklist||[],'checklist',50).map(x=>({text:text(x.text,300),done:!!x.done})),deletedAt:p.deletedAt?text(p.deletedAt,40):null,activity:(Array.isArray(p.activity)?p.activity:[]).slice(0,100).filter(x=>x&&typeof x.text==='string').map(x=>({at:text(x.at,40),text:text(x.text,200)}))};
}
function feedbackRecord(input){
 if(!['yes','partial','no'].includes(input.rating))throw Error('Escolha uma avaliação.');
 return {id:text(input.id,80)||uid(),date:now(),engineVersion,category:text(input.category,40),subtask:text(input.subtask,50),rating:input.rating,reason:text(input.reason,120),suggestedTool:text(input.suggestedTool,100),note:text(input.note,600),context:input.includeContext?text(input.context,300).replace(/\b\S+@\S+\.\S+\b/g,'[email omitido]'):'',toolIds:array(input.toolIds||[],'ferramentas',100).filter(id=>tool(id))};
}
function validateState(raw){
 if(!raw||raw.version!==VERSION)throw Error('Dados de projetos incompatíveis. Exporte o original antes de recuperar.');
 const projects=array(raw.projects,'projetos',100).map(validateProject);
 if(new Set(projects.map(p=>p.id)).size!==projects.length)throw Error('IDs de projetos duplicados.');
 const feedback=array(raw.feedback||[],'feedback',300).map(f=>({...feedbackRecord({...f,includeContext:!!f.context}),date:text(f.date,40)||now()}));
 return {version:VERSION,projects,feedback,draft:raw.draft?validatePlan(raw.draft):null,migratedAt:text(raw.migratedAt,40)};
}
function createRepository(S){
 function read(){
 const raw=S.readStrict?S.readStrict(KEY,null):S.read(KEY,null);if(raw!==null)return validateState(raw);
 const legacy=S.read('nexus:prompts:v2',[]);const projects=[];
 if(Array.isArray(legacy))for(const name of [...new Set(legacy.map(p=>text(p.project,80)).filter(Boolean))].slice(0,100)){
 const records=legacy.filter(p=>text(p.project,80)===name),p=projectFrom(records[0].goal||'Organizar projeto '+name);p.title=name;
 records.slice(0,30).forEach(r=>{if(r.text)versionPrompt(p,r);});projects.push(p);
 }
 const state={version:VERSION,projects,feedback:[],draft:null,migratedAt:now()};
 const result=S.write(KEY,state);if(!result.ok)throw Error(result.error);return state;
 }
 function write(state){const data=validateState(state);if(JSON.stringify(data).length>4000000)throw Error('Dados acima de 4 MB. Exporte e reduza versões antes de salvar.');const r=S.write(KEY,data);if(!r.ok)throw Error(r.error);return data;}
 function mutate(fn){const data=read(),value=fn(data);write(data);return value;}
 function saveProject(p){const valid=validateProject({...p,updated:now()});return mutate(d=>{const i=d.projects.findIndex(x=>x.id===valid.id);if(i<0)d.projects.push(valid);else d.projects[i]=valid;return valid;});}
 function change(id,fn,label){return mutate(d=>{const p=d.projects.find(x=>x.id===id);if(!p)throw Error('Projeto não encontrado.');fn(p);p.updated=now();if(label){p.activity=[{at:now(),text:text(label,200)},...(p.activity||[])].slice(0,100);}return p;});}
 function duplicate(id){const p=read().projects.find(p=>p.id===id);if(!p)throw Error('Projeto não encontrado.');const next=copy(p);next.id=uid();next.title=text(p.title+' (cópia)',100);next.created=now();next.deletedAt=null;next.activity=[{at:now(),text:'Duplicado de “'+text(p.title,80)+'”'}];return saveProject(next);}
 function exportProject(id){const p=read().projects.find(p=>p.id===id);if(!p)throw Error('Projeto não encontrado.');return {format:'nexus-project',version:5,exportedAt:now(),project:copy(p)};}
 function importProject(raw){
  if(!raw||raw.format!=='nexus-project'||!raw.project)throw Error('Arquivo não é um projeto exportado pelo Loopins.');
  const valid=validateProject(raw.project);
  return mutate(d=>{if(d.projects.length>=100)throw Error('Limite de 100 projetos.');if(d.projects.some(x=>x.id===valid.id)){valid.id=uid();valid.title=text(valid.title+' (importado)',100);}valid.activity=[{at:now(),text:'Importado de arquivo'},...valid.activity].slice(0,100);d.projects.push(valid);return valid;});
 }
 function exportAll(){return {version:4,exportedAt:now(),legacy:{version:3,favorites:S.read('nexus:favorites:v1',[]),history:S.read('nexus:history:v1',[]),prompts:S.read('nexus:prompts:v2',[]),profile:S.read('nexus:profile:v2',{}),feedback:S.read('nexus:feedback:v3',[])},workspace:read(),settings:S.read('nexus:settings:v5',null)};}
 function importAll(raw,mode='merge'){
 if(!['merge','copy','replace'].includes(mode))throw Error('Modo de importação inválido.');
 const incoming=raw?.version===4?validateState(raw.workspace):null;
 if(raw?.version===4&&(!raw.legacy||!raw.workspace))throw Error('Backup v4 incompleto.');
 const legacy=F.validateBackup(raw?.version===4?raw.legacy:raw,E.tools.map(t=>t.id));
 const current=read(),next=incoming||{version:4,projects:[],feedback:[],draft:null,migratedAt:now()};
 if(!incoming){for(const name of [...new Set(legacy.prompts.map(p=>text(p.project,80)).filter(Boolean))]){if(mode!=='replace'&&current.projects.some(p=>p.title===name))continue;const records=legacy.prompts.filter(p=>p.project===name),p=projectFrom(records[0].goal||'Organizar projeto '+name);p.title=name;for(const r of records)if(r.text)versionPrompt(p,r);next.projects.push(p);}}
 if(mode!=='replace'){
 const merged=copy(current);
 for(const p of next.projects){const existing=merged.projects.find(x=>x.id===p.id);if(!existing)merged.projects.push(p);else if(mode==='copy'){p.id=uid();p.title=text(p.title+' (importado)',100);merged.projects.push(p);}}
 for(const f of next.feedback)if(!merged.feedback.some(x=>x.id===f.id))merged.feedback.push(f);
 next.projects=merged.projects;next.feedback=merged.feedback;next.draft=current.draft||next.draft;
 }
 const valid=validateState(next);
 const mergeList=(key,items,identity,max)=>{if(mode==='replace')return items;const existing=S.read(key,[]);return [...(Array.isArray(existing)?existing:[]),...items].filter((x,i,a)=>a.findIndex(v=>identity(v)===identity(x))===i).slice(0,max);};
 const entries={[KEY]:valid,'nexus:favorites:v1':mergeList('nexus:favorites:v1',legacy.favorites,x=>x,100),'nexus:history:v1':mergeList('nexus:history:v1',legacy.history,x=>x.query,15),'nexus:prompts:v2':mergeList('nexus:prompts:v2',legacy.prompts,x=>x.id,30),'nexus:feedback:v3':mergeList('nexus:feedback:v3',legacy.feedback,x=>x.date+x.text,50),'nexus:profile:v2':mode==='replace'?legacy.profile:S.read('nexus:profile:v2',legacy.profile)};
 if(raw?.settings&&typeof raw.settings==='object'){
  const Settings=typeof module!=='undefined'&&module.exports?require('./settings.js'):globalThis.NexusSettingsFactory;
  const incomingSettings=Settings.sanitize(raw.settings),local=S.read('nexus:settings:v5',null);
  if(mode==='replace'||!local)entries['nexus:settings:v5']=incomingSettings;
  else{const merged=Settings.sanitize(local);for(const [k,v] of Object.entries(incomingSettings.toolUsage))merged.toolUsage[k]=(merged.toolUsage[k]||0)+v;entries['nexus:settings:v5']=merged;}
 }
 if(JSON.stringify(entries).length>6000000)throw Error('Backup excede o limite local de 6 MB.');
 const result=S.writeMany(entries);if(!result.ok)throw Error(result.error);return valid;
 }
 return {read,write,saveProject,change,duplicate,exportProject,importProject,exportAll,importAll,saveDraft:p=>mutate(d=>d.draft=p),feedback:f=>mutate(d=>d.feedback.unshift(feedbackRecord(f))),deleteFeedback:id=>mutate(d=>d.feedback=d.feedback.filter(f=>f.id!==id))};
}
function planMarkdown(p){return '# '+p.objective+'\n\nPlano local determinístico; execução e validação são responsabilidade do usuário.\n\n'+p.steps.map((s,i)=>`## ${i+1}. ${s.title}\n\n- Estado: ${statusNames[s.status]}\n- Entregável: ${s.deliverable}\n- Ferramenta: ${tool(s.toolId)?.name||'Não selecionada'}\n- Dificuldade qualitativa: ${s.difficulty}\n- Dependências: ${s.dependencies.map(i=>p.steps[i]?.title).filter(Boolean).join('; ')||'Nenhuma'}\n\n${s.purpose}\n\n${s.instruction}\n\n${s.notes}\n\n${s.links.join('\n')}${s.prompt?'\n\n### Prompt\n\n'+s.prompt:''}`).join('\n\n');}
function projectMarkdown(p){return '# '+p.title+'\n\n'+p.description+'\n\nCriado: '+p.created+' · Última modificação: '+p.updated+'\n\n'+planMarkdown(p.plan)+'\n\n## Notas\n\n'+p.notes+'\n\n## Referências\n\n'+p.links.join('\n')+'\n\n## Checklist\n\n'+p.checklist.map(x=>'- ['+(x.done?'x':' ')+'] '+x.text).join('\n')+'\n\n## Histórico de alterações\n\n'+(p.activity||[]).map(a=>'- '+a.at+' — '+a.text).join('\n')+'\n\n## Prompts e versões\n\n'+p.prompts.map(x=>'### '+x.goal+'\n\n'+x.versions.map((v,i)=>'#### Versão '+(i+1)+' — '+v.created+'\n\n'+v.text).join('\n\n')).join('\n\n');}
function diagnostics(records){const byCategory={};for(const f of records){const key=f.category||'desconhecida';byCategory[key]??={total:0,negative:0};byCategory[key].total++;if(f.rating!=='yes')byCategory[key].negative++;}return {total:records.length,byCategory,regressionCandidates:records.filter(f=>f.rating!=='yes').map(f=>({context:f.context||'[contexto não armazenado]',subtask:f.subtask,reason:f.reason,suggestion:f.suggestedTool}))};}
function responseCoverage(input,requirements){const n=E.normalize(input),terms=text(requirements,2000).split('\n').map(x=>text(x,200)).filter(Boolean);return {requirements:terms.map(requirement=>{const words=E.normalize(requirement).split(' ').filter(w=>w.length>2);return {requirement,mentioned:words.length>0&&words.every(w=>n.includes(w))};}),citations:[...new Set((String(input).match(/https:\/\/[^\s)\]]+/g)||[]).filter(C.safeURL))],headings:(String(input).match(/^#{1,6}\s+.+/gm)||[]).length,warning:'Presença lexical e links fornecidos não verificam fatos nem completude semântica.'};}
return {VERSION,KEY,engineVersion,statuses,statusNames,templates,createPlan,makeStep,stepPrompt,moveStep,removeStep,duplicateStep,projectFrom,validatePlan,validateProject,validateState,createRepository,feedbackRecord,diagnostics,versionPrompt,planMarkdown,projectMarkdown,responseCoverage,uid,safeLink,copy};
});