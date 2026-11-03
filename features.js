/* Loopins v2 — funções locais puras e testáveis. Nenhuma API ou login externo. */
(function(root,factory){const features=factory();if(typeof module!=='undefined'&&module.exports)module.exports=features;root.NexusFeatures=features;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./engine.js'):globalThis.NexusEngine;
const labels={code:'Programação',image:'Imagens',video:'Vídeos',study:'Estudos',text:'Textos',audio:'Áudio',research:'Pesquisa',presentation:'Apresentações',design:'Design',automation:'Automação',data:'Dados e planilhas',agents:'Agentes e atendimento'};
const clean=(value,max=2500)=>String(value??'').trim().slice(0,max);
const nrm=str=>clean(str,5000).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function inferCategory(goal){
  const engine=typeof globalThis!=='undefined'?globalThis.NexusEngine:null;
  if(engine&&typeof engine.classify==='function'){const found=engine.classify(goal).category;if(found==='study'&&engine.analyzeTask(goal).intent==='pesquisa')return 'research';return found==='all'?'text':found;}
  const n=nrm(goal);
  if(/\b(criar|gerar|produzir|fazer)\s+(uma?\s+)?(video|clipe|animacao)\b/.test(n))return 'video';
  if(/\b(criar|gerar|produzir|fazer|desenhar)\s+(uma?\s+)?(imagem|foto|ilustracao|cartaz|poster)\b/.test(n))return 'image';
  if(/\b(criar|gerar|produzir|fazer)\s+(uma?\s+)?(narracao|audio|voz|musica|cancao)\b/.test(n))return 'audio';
  // O objetivo é programar uma ferramenta que usa voz, não sintetizar áudio.
  if(/\b(assistente virtual|assistente de voz|assistente por voz|chatbot|bot|app|aplicativo|software|programa|site|sistema|script|automacao)\b/.test(n)&&/\b(criar|fazer|montar|programar|desenvolver|construir|implementar|codificar)\b/.test(n))return 'code';
  if(/\b(html|css|javascript|python|api|codigo|programar|desenvolver|debug|react)\b/.test(n))return 'code';
  if(/\b(video|clipe|animacao|filme)\b/.test(n))return 'video';
  if(/\b(imagem|foto|ilustracao|desenho|logotipo|logo|cartaz)\b/.test(n))return 'image';
  if(/\b(narracao|voz|audio|musica|trilha|podcast)\b/.test(n))return 'audio';
  if(/\b(estudar|aprender|prova|exercicios|resumo|aula|pesquisa)\b/.test(n))return 'study';
  return 'text';
}
function getPromptPlan({category='auto',goal='',refinement='',constraints='',format=''}){
 const objective=clean(goal,1400);
 if(objective.length<6)throw Error('Descreva melhor o objetivo (mínimo de 6 caracteres).');
 if(category!=='auto'&&!labels[category])throw Error('Categoria desconhecida.');
 const detected=inferCategory(objective);
 const resolved=category==='auto'?detected:category;
 // Evita que um menu marcado em "Áudio" converta um pedido inequívoco de desenvolvimento em narração.
 const overridden=resolved==='audio'&&detected==='code'&&/\b(assistente|software|programa|app|sistema|script|bot)\b/.test(nrm(objective));
 const taskIntent=E.parseTask(objective,{refinement,constraintText:[constraints,format].filter(Boolean).join('; ')});
   return {category:overridden?'code':resolved,detected,overridden,objective,taskIntent};
}
function generateBasePrompt(options={}){
 const {goal='',details='',style='',format='',constraints='',category='auto',level='complete',audience='',platform=''}=options;
 const plan=getPromptPlan({category,goal});
 const {objective}=plan,cat=plan.category;
 const d=clean(details,2500),s=clean(style,180),f=clean(format,180),c=clean(constraints,600),a=clean(audience,180),p=clean(platform,180);
 const brief=level==='direct';
 // Prompts para imagem e vídeo devem descrever o RESULTADO, não fingir que se trata de chat técnico.
 if(cat==='image'){
  const chunks=[`Crie uma imagem de: ${objective}.`];
  if(d)chunks.push(`Elementos e contexto: ${d}.`);
  if(s)chunks.push(`Direção artística: ${s}.`);
  if(p)chunks.push(`Cenário / destino de uso: ${p}.`);
  if(f)chunks.push(`Formato e enquadramento: ${f}.`);
  const img=specialized(options,[['environment','Ambiente'],['composition','Composição'],['lighting','Iluminação'],['framing','Enquadramento / lente'],['colors','Cores'],['aspect','Proporção'],['keyDetails','Detalhes importantes'],['preserve','Preserve sem alterar']]);
  chunks.push(...img);
  if(c)chunks.push(`Evite: ${c}.`);
  if(!brief)chunks.push('Composição coerente, detalhes consistentes e foco no assunto principal. Não acrescente letras, logos ou marcas d’água sem solicitação.');
  return chunks.join('\n');
 }
 if(cat==='video'){
  const chunks=[`Gere um vídeo baseado nesta cena: ${objective}.`];
  if(d)chunks.push(`Ação e acontecimentos: ${d}.`);
  if(s)chunks.push(`Estética e iluminação: ${s}.`);
  if(p)chunks.push(`Local / plataforma de exibição: ${p}.`);
  if(f)chunks.push(`Duração, proporção ou formato: ${f}.`);
  chunks.push(...specialized(options,[['characters','Personagens / objetos'],['motion','Movimento do assunto'],['camera','Movimento de câmera'],['duration','Duração pretendida'],['lighting','Iluminação'],['aspect','Proporção (aspect ratio)'],['continuity','Continuidade entre planos']]));
  if(c)chunks.push(`Restrições: ${c}.`);
  if(!brief)chunks.push('Descreva o movimento do assunto e da câmera de modo claro e consistente. Preserve continuidade visual, sem cortes ou mudanças de cena não solicitados.');
  return chunks.join('\n');
 }
 const roles={
  code:'Atue como um desenvolvedor de software experiente e mentor técnico. Seu trabalho é projetar uma solução implementável, explicar as decisões e entregar código que possa ser testado.',
  study:'Atue como professor particular. Explique os conceitos com precisão e didática, sem pular etapas essenciais.',
  research:'Investigue o pedido usando evidências verificáveis e fontes primárias. Separe conclusão, evidência e incerteza.',
  presentation:'Prepare uma apresentação com narrativa clara e hierarquia visual adequada ao público.',
  design:'Desenvolva uma proposta de interface ou protótipo, descrevendo fluxos e decisões de layout.',
  text:'Atue como redator e editor profissional. Produza conteúdo claro, consistente e adaptado ao objetivo.',
  audio:'Atue como especialista em produção de áudio. Converta a ideia em orientações concretas para voz, música ou edição de som.',
  automation:'Atue como especialista em automação de processos. Desenhe um fluxo confiável entre aplicativos, com gatilhos, ações, tratamento de falhas e permissões mínimas.',
  data:'Atue como analista de dados. Trabalhe somente com os dados fornecidos, explique cada cálculo e aponte limitações dos dados.',
  agents:'Atue como especialista em atendimento automatizado. Projete um agente que responda com base em conteúdo aprovado e saiba transferir para um humano.'
 };
 const list=[`# PAPEL\n${roles[cat]}`,`# OBJETIVO\nOBJETIVO: ${objective}`];
 const context=[];
 if(a)context.push(`PÚBLICO-ALVO: ${a}`);
 if(p)context.push(`PLATAFORMA / CONTEXTO: ${p}`);
 if(d)context.push(`DETALHES: ${d}`);
 if(s)context.push(`ESTILO / TOM: ${s}`);
 if(f)context.push(`FORMATO FINAL: ${f}`);
 if(c)context.push(`RESTRIÇÕES: ${c}`);
 const extraContext=cat==='code'?specialized(options,[['projectContext','Contexto do projeto'],['tech','Tecnologias'],['features','Funcionalidades'],['architecture','Arquitetura'],['files','Organização dos arquivos'],['errors','Tratamento de erros'],['security','Segurança'],['tests','Testes'],['delivery','Formato da entrega']]):['study','text','research','presentation'].includes(cat)?specialized(options,[['depth','Profundidade'],['structure','Estrutura'],['sources','Fontes'],['tone','Linguagem']]):[];
 context.push(...extraContext);
 if(context.length)list.push(`# CONTEXTO E EXIGÊNCIAS\n${context.join('\n')}`);
 const voiceProject=cat==='code'&&/\b(assistente|chatbot|bot)\b/.test(nrm(objective))&&/\b(voz|audio|fala|microfone|escut|ouvir|falad|responda|wake word)\b/.test(nrm(objective));
 if(cat==='code'){
  if(voiceProject&&!brief)list.push('# REQUISITOS IMPORTANTES\n- Proponha uma arquitetura que separe entrada pelo microfone, reconhecimento de fala, interpretação de comandos, execução e resposta falada.\n- Inclua ativação por palavra-chave, captura de microfone, reconhecimento de fala, lista permitida de comandos e resposta falada. Nunca execute texto livre como comando de terminal.\n- Considere privacidade, permissões do microfone, tratamento de erros e encerramento seguro.\n- Se houver alternativas locais e gratuitas, compare com opções que utilizam APIs.\n- Não presuma que tudo já está instalado ou funcionando: explicite dependências e instruções de configuração.');
  list.push(brief?'# O QUE ENTREGAR\nForneça uma solução inicial executável, o código essencial e como testar.':'# ENTREGÁVEIS\n1. Resumo da arquitetura e escolhas técnicas, com justificativa.\n2. Estrutura de pastas e arquivos necessários.\n3. Código completo por arquivo, em blocos identificados (sem trechos fictícios).\n4. Dependências, comandos e passos para executar no ambiente indicado.\n5. Testes práticos para validar as funcionalidades e corrigir possíveis falhas.\n6. Limitações, decisões pendentes e próximos aprimoramentos.');
  list.push('# CRITÉRIOS\nNão invente resultados de testes. Não omita etapas de instalação. Caso falte informação essencial, faça até 3 perguntas objetivas; se não impedir o protótipo, assuma uma opção simples e declare a suposição.');
 }else if(cat==='research'){
 list.push('Defina o escopo da pesquisa. Cite fontes primárias com links verificáveis e data quando disponível. Não invente autores, artigos, DOI ou referências. Se não tiver acesso às fontes, declare a limitação. Diferencie consenso, hipótese e evidência conflitante.');
 }else if(cat==='presentation'){
 list.push('Entregue uma sequência de slides com título, mensagem central, conteúdo conciso, sugestão visual e notas de apresentação. Use apenas a quantidade fornecida; se ausente, proponha uma estrutura ajustável.');
 }else if(cat==='design'){
 list.push('Descreva telas, hierarquia, navegação, estados vazios e de erro, acessibilidade, adaptação móvel e interações do protótipo. Não presuma implementação de backend.');
 }else if(cat==='study'){
  list.push(brief?'# RESPOSTA ESPERADA\nExplique de modo objetivo e use um exemplo resolvido.':'# RESPOSTA ESPERADA\nExplique os conceitos por etapas, apresente exemplos práticos, destaque erros comuns e termine com exercícios curtos para verificar a compreensão.');
  list.push('Não invente fatos ou referências. Avise quando houver incerteza.');
 }else if(cat==='text'){
  list.push(brief?'# RESPOSTA ESPERADA\nEntregue o texto final, pronto para uso.':'# RESPOSTA ESPERADA\nEntregue a versão final organizada, com linguagem adequada ao público. Revise clareza, coesão, gramática e estrutura. Acrescente observações somente quando forem úteis.');
  list.push('Não invente fatos, números ou fontes.');
 }else if(cat==='automation'){
  list.push(brief?'# ENTREGA\nDescreva gatilho, ações e como testar.':'# ENTREGA\n1. Gatilho e condições.\n2. Passos/ações por aplicativo, com dados mapeados.\n3. Tratamento de falhas, repetições e notificações.\n4. Permissões mínimas e dados pessoais envolvidos.\n5. Plano de teste com dados fictícios antes de ativar.');
  list.push('Não ative o fluxo nem envie mensagens reais sem minha confirmação. Não presuma integrações que não existem.');
 }else if(cat==='data'){
  list.push(brief?'# ENTREGA\nResponda à pergunta com o cálculo e um gráfico adequado.':'# ENTREGA\n1. Entendimento das colunas e qualidade dos dados (faltantes, duplicados, formatos).\n2. Cálculos ou fórmulas usados, explicados passo a passo.\n3. Gráficos indicados para cada pergunta.\n4. Conclusões com limitações.');
  list.push('Não invente valores nem complete dados ausentes sem avisar. Indique quando a amostra não permitir conclusões.');
 }else if(cat==='agents'){
  list.push(brief?'# ENTREGA\nDefina objetivo, base de conhecimento e regras de transferência para humano.':'# ENTREGA\n1. Objetivo e público do agente.\n2. Base de conhecimento aprovada e o que fica fora do escopo.\n3. Fluxos principais e respostas de exemplo.\n4. Quando transferir para um atendente humano.\n5. Dados pessoais coletados e como são protegidos.\n6. Testes com perguntas reais e difíceis.');
  list.push('O agente não deve inventar preços, prazos ou políticas: responda apenas com o conteúdo aprovado.');
 }else if(cat==='audio'){
  list.push(brief?'# RESULTADO ESPERADO\nIndique a produção de áudio e as configurações essenciais.':'# RESULTADO ESPERADO\nDefina voz ou instrumentação, tom, ritmo, duração, atmosfera e orientações práticas de captação ou edição, conforme a tarefa.');
  list.push('Respeite consentimento e direitos autorais, sem reproduzir vozes reais sem autorização.');
 }
 return list.join('\n\n');
}
const normWords=(text)=>String(text??'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[\p{L}\p{N}]+/gu)||[];
function compareResponses(a,b){
  const left=clean(a,40000),right=clean(b,40000);
  if(!left||!right)throw Error('Cole as duas respostas para compará-las.');
  const wa=normWords(left),wb=normWords(right);
  const A=new Set(wa), B=new Set(wb), common=[...A].filter(w=>B.has(w));
  const union=new Set([...A,...B]);
  const measures=(content,words)=>({characters:content.length,words:(content.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[]).length,paragraphs:content.split(/\n\s*\n/).filter(x=>x.trim()).length,
    codeBlocks:(content.match(/```/g)||[]).length>=2?Math.floor((content.match(/```/g)||[]).length/2):0,
    listLines:content.split('\n').filter(line=>/^\s*(?:[-*•]|\d+[.)])\s+/.test(line)).length,
    links:(content.match(/https?:\/\/[^\s)\]]+/g)||[]).length});
  const stop=new Set(['para','com','uma','que','não','nao','dos','das','the','and','por','como','seus','suas','isso','mais','esse','esta','este','sao','são']);
  return {left:measures(left,wa),right:measures(right,wb),similarity:union.size?Math.round(common.length/union.size*100):100,
    sharedWords:common.filter(x=>!stop.has(x)).slice(0,12),differentA:[...A].filter(x=>!B.has(x)&&!stop.has(x)).slice(0,8),differentB:[...B].filter(x=>!A.has(x)&&!stop.has(x)).slice(0,8)};
}
/* Análise de várias respostas coladas pelo usuário (2 a 4).
 * Mede propriedades observáveis. Semelhança entre respostas não indica que estejam corretas. */
const STOP=new Set('para com uma que nao dos das por como seus suas isso mais esse esta este sao uns umas pelo pela entre sobre quando onde qual quais voce pode podem deve devem tambem muito mais menos ser sera foram tem ter the and for with you are this that from quero preciso gostaria'.split(' '));
function keyTerms(text,limit=40){const counts=new Map();for(const w of normWords(text))if(w.length>3&&!STOP.has(w)&&!/^\d+$/.test(w))counts.set(w,(counts.get(w)||0)+1);return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit).map(([w])=>w);}
function numericClaims(text){
 const out=[];const re=/([\p{L}]{4,})(?:\s+[\p{L}]{1,3})?\s*(?:é|e|=|:|de|com|tem|são|sao|foi)?\s*(\d+(?:[.,]\d+)?)\s*(%|[\p{L}]+)?/gu;let m;
 const plain=String(text).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 while((m=re.exec(plain)))if(!STOP.has(m[1]))out.push({term:m[1],value:m[2].replace(',','.'),unit:m[3]||''});
 return out;
}
function analyzeResponses(responses,request=''){
 const list=(Array.isArray(responses)?responses:[]).map(r=>({label:clean(r.label,60)||'Resposta',text:clean(r.text,40000)})).filter(r=>r.text);
 if(list.length<2)throw Error('Cole pelo menos duas respostas para comparar.');
 if(list.length>4)throw Error('Compare no máximo quatro respostas por vez.');
 const req=keyTerms(request,25);
 const sets=list.map(r=>new Set(normWords(r.text)));
 const items=list.map((r,i)=>{
  const covered=req.filter(w=>sets[i].has(w)),missing=req.filter(w=>!sets[i].has(w));
  return {label:r.label,measures:compareResponses(r.text,r.text).left,coverage:req.length?Math.round(covered.length/req.length*100):null,covered,missing,headings:(r.text.match(/^#{1,6}\s+.+/gm)||[]).length};
 });
 const pairs=[];
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const c=compareResponses(list[i].text,list[j].text);pairs.push({a:list[i].label,b:list[j].label,similarity:c.similarity});}
 const claims=list.map(r=>numericClaims(r.text));
 const contradictions=[];
 const terms=new Set(claims.flat().map(c=>c.term));
 for(const term of terms){
  const byResp=claims.map((cs,i)=>({label:list[i].label,values:[...new Set(cs.filter(c=>c.term===term).map(c=>c.value+(c.unit?' '+c.unit:'')))]})).filter(x=>x.values.length);
  if(byResp.length>=2){const all=new Set(byResp.map(x=>x.values.join('|')));if(all.size>1)contradictions.push({term,values:byResp});}
 }
 const unique=list.map((r,i)=>({label:r.label,terms:keyTerms(r.text,60).filter(w=>sets.every((s,k)=>k===i||!s.has(w))).slice(0,8)}));
 return {items,pairs,contradictions:contradictions.slice(0,10),unique,requestTerms:req,warning:'Medidas observáveis: tamanho, estrutura, termos do pedido e números divergentes. Não verificam se alguma resposta está correta; respostas parecidas podem estar igualmente erradas.'};
}
function validateBackup(data,allowedIds){
 if(!data||typeof data!=='object'||![2,3].includes(data.version))throw Error('Backup incompatível. Use um arquivo de backup Loopins 2.x ou 3.x.');
 for(const key of ['favorites','history','prompts','feedback'])if(data[key]!==undefined&&!Array.isArray(data[key]))throw Error('Campo inválido no backup: '+key);
 if(data.profile!==undefined&&(!data.profile||typeof data.profile!=='object'||Array.isArray(data.profile)))throw Error('Perfil inválido.');
 const allowed=new Set(allowedIds);
 const favorites=(Array.isArray(data.favorites)?data.favorites:[]).filter(x=>typeof x==='string'&&allowed.has(x)).slice(0,100);
 const history=(Array.isArray(data.history)?data.history:[]).filter(x=>x&&typeof x.query==='string'&&typeof x.time==='string'&&Number.isFinite(Date.parse(x.time))).map(x=>({query:clean(x.query,500),time:new Date(x.time).toISOString()})).slice(0,15);
 const prompts=(Array.isArray(data.prompts)?data.prompts:[]).filter(x=>x&&typeof x.text==='string').map(x=>({id:typeof x.id==='string'?x.id.slice(0,64):'importado',goal:clean(x.goal,1400),project:clean(x.project,80),tags:clean(x.tags,180),options:x.options&&typeof x.options==='object'?Object.fromEntries(['category','goal','level','details','style','format','constraints','audience','platform','language','success','examples','project','tags','targetTool','refinement','projectId','stepId','promptId','environment','composition','lighting','framing','colors','aspect','keyDetails','preserve','characters','motion','camera','duration','continuity','projectContext','tech','features','architecture','files','errors','security','tests','delivery','depth','structure','sources','tone'].map(k=>[k,clean(x.options[k],2500)])):{},category:labels[x.category]?x.category:'code',text:clean(x.text,18000),created:typeof x.created==='string'?x.created:'',versions:Array.isArray(x.versions)?x.versions.slice(0,30).filter(v=>v&&typeof v.text==='string').map(v=>({text:clean(v.text,18000),created:clean(v.created,40)})):[]})).slice(0,30);
 const profile={name:clean(data.profile?.name,48)};
 const feedback=(Array.isArray(data.feedback)?data.feedback:[]).filter(x=>x&&typeof x.text==='string').map(x=>({kind:clean(x.kind,80),text:clean(x.text,1200),date:clean(x.date,40)})).slice(0,50);
 return {favorites:[...new Set(favorites)],history,prompts,profile,feedback};
}
function generatePrompt(options={}){
 const plan=getPromptPlan(options),intent=plan.taskIntent;
   const selected=E.tools.find(t=>t.id===options.targetTool);
   const builder=plan.category==='code'&&['site_builder','landing','fullstack'].includes(intent.subtask)&&(!selected||selected.capabilities.builder.status==='supported');
   const output=builder&&options.level==='direct'?['BRIEFING PARA CONSTRUIR O SITE','OBJETIVO: '+plan.objective,clean(options.details,2500)&&'DETALHES: '+clean(options.details,2500),'Crie as páginas principais, navegação e versão para celular. Publicação só com minha autorização.'].filter(Boolean).join('\n\n'):builder?['BRIEFING PARA CONSTRUIR O SITE','OBJETIVO: '+plan.objective,'Estruture páginas, navegação, conteúdo, identidade visual e comportamento responsivo.','DETALHES: '+clean(options.details,2500),'Público: '+clean(options.audience,180),'Estilo: '+clean(options.style,180),'Formato: '+clean(options.format,180),'RESTRIÇÕES: '+clean(options.constraints,600),intent.subtask==='fullstack'?'Defina dados, autenticação, permissões e estados vazios. Não simule login ou banco como se estivessem integrados.':'Prepare o fluxo de navegação e os estados dos formulários.','Peça os dados que faltarem. Testes práticos: revise acessibilidade e teste os fluxos. Explique como pré-visualizar; publicação depende da minha autorização.'].filter(Boolean).join('\n\n'):generateBasePrompt(options),extra=[];
   const subtypeInstructions={typography:'Reproduza título, preço e demais textos EXATAMENTE como fornecidos. Defina hierarquia, contraste, margens e área segura. Revise palavra por palavra e não invente preços.',vector:'Entregue vetor SVG verdadeiro, com caminhos editáveis, fundo conforme solicitado e sem incorporar bitmap como substituto do vetor.',photo:'Descreva iluminação, lente/perspectiva, materiais, fundo e composição fotográfica; mantenha proporções plausíveis e evite artefatos.',image_edit:'Use a imagem fornecida como entrada; altere somente as regiões solicitadas e preserve os demais elementos.',transcription:'Transcreva a gravação fornecida, identifique falantes quando possível, marque trechos inaudíveis e preserve o sentido. Não invente falas. Confirme consentimento para usar a gravação.',subtitles:'Traduza as legendas preservando timestamps, numeração e sentido. Informe idioma de origem e destino; confira quebras de linha e duração de leitura.',wordpress:'Use o ambiente WordPress.com solicitado, descreva páginas, navegação e conteúdo. Verifique separadamente as condições de publicação do site.'};
 if(subtypeInstructions[intent.subtask])extra.push(subtypeInstructions[intent.subtask]);
 if(options.level==='advanced')extra.push('VALIDAÇÃO PROFISSIONAL: organize requisitos, premissas, dependências e critérios verificáveis. Entregue uma matriz requisito → evidência de atendimento; registre incertezas e instruções de revisão.');
 if(selected){
    extra.push('Ferramenta de destino: '+selected.name+'.');
    const matches=E.recommend(intent,null,{refinement:options.refinement}).eligible.find(t=>t.id===selected.id);
    extra.push(matches?'Competências documentadas para este pedido: '+matches.why+'.':'Adequação desta ferramenta não confirmada para todos os requisitos. Confirme as limitações antes de executar.');
    if(selected.kind==='agent'&&plan.category==='code')extra.push('Inspecione o repositório existente, edite os arquivos necessários e execute verificações pertinentes. Mostre o diff e os resultados dos testes.');
    if(intent.constraints.outputFormat==='svg')extra.push('Entregue um arquivo SVG com caminhos editáveis; não substitua por imagem raster.');
   }
 if(clean(options.language,80))extra.push('Idioma de saída: '+clean(options.language,80)+'.');
 if(clean(options.examples,1800))extra.push('Referências ou exemplos fornecidos: '+clean(options.examples,1800));
 if(clean(options.success,900))extra.push('Critérios de aceitação: '+clean(options.success,900));
 if(options.level==='advanced')extra.push('Antes de concluir, confira cada requisito, registre limitações e indique como verificar o resultado.');
 if(getPromptPlan(options).category==='code')extra.push('Em um projeto existente, preserve arquivos e comportamentos funcionais; proponha mudanças incrementais. Não exponha segredos no código.');
 return (plan.category==='image'||plan.category==='video'?'OBJETIVO: '+plan.objective+'\n\n':'')+output+(extra.length?'\n\n'+extra.join('\n'):'');
}
function compareLines(a,b){
 const left=clean(a,40000).split('\n'),right=clean(b,40000).split('\n');
 const A=new Set(left.filter(x=>x.trim())),B=new Set(right.filter(x=>x.trim()));
 return {left:left.map(text=>({text,shared:B.has(text)})),right:right.map(text=>({text,shared:A.has(text)})),added:[...B].filter(x=>!A.has(x)).length,removed:[...A].filter(x=>!B.has(x)).length};
}
function specialized(options,fields){return fields.map(([k,label])=>[label,clean(options[k],600)]).filter(([,v])=>v).map(([label,v])=>`${label}: ${v}.`);}
// Campos especializados por categoria, usados pela interface do Studio.
const specializedFields={
 image:[['environment','Ambiente'],['composition','Composição'],['lighting','Iluminação'],['framing','Enquadramento / lente'],['colors','Cores'],['aspect','Proporção (ex.: 1:1, 16:9)'],['keyDetails','Detalhes importantes'],['preserve','Elementos que precisam ser preservados']],
 video:[['characters','Personagens ou objetos'],['motion','Movimento do assunto'],['camera','Movimento de câmera'],['duration','Duração pretendida'],['lighting','Iluminação'],['aspect','Proporção (aspect ratio)'],['continuity','Continuidade']],
 code:[['projectContext','Contexto do projeto'],['tech','Tecnologias'],['features','Funcionalidades'],['architecture','Arquitetura'],['files','Organização dos arquivos'],['errors','Tratamento de erros'],['security','Segurança'],['tests','Testes'],['delivery','Formato esperado da entrega']],
 study:[['depth','Profundidade'],['structure','Estrutura'],['sources','Fontes'],['tone','Linguagem']],
 text:[['depth','Profundidade'],['structure','Estrutura'],['sources','Fontes'],['tone','Linguagem']],
 research:[['depth','Profundidade'],['structure','Estrutura'],['sources','Fontes'],['tone','Linguagem']],
 presentation:[['depth','Profundidade'],['structure','Estrutura'],['sources','Fontes'],['tone','Linguagem']]
};
/* Melhorar um prompt existente (local, determinístico).
 * Não inventa conteúdo: acrescenta seções ausentes com marcadores [preencha: ...]
 * e instruções de qualidade gerais da categoria, explicando cada mudança. */
const checks=[
 ['objective',/\b(objetivo|quero|preciso|crie|gere|escreva|desenvolva|faça|faca)\b/i,'# OBJETIVO\n[preencha: o resultado final em uma frase]','Sem um objetivo explícito, a IA tende a responder de forma genérica.'],
 ['context',/\b(contexto|público|publico|para quem|cenário|cenario|plataforma|projeto)\b/i,'# CONTEXTO\n[preencha: para quem é, onde será usado e o que já existe]','Contexto reduz suposições e respostas fora do cenário real.'],
 ['format',/\b(formato|entregue|entregáveis|entregaveis|estrutura|em tópicos|em topicos|tabela|markdown|proporção|proporcao|aspect)\b/i,'# FORMATO DA RESPOSTA\n[preencha: como a resposta deve ser entregue]','Definir o formato evita retrabalho para reorganizar a resposta.'],
 ['constraints',/\b(restriç|restric|não |nao |evite|sem |limite)\b/i,'# RESTRIÇÕES\n[preencha: o que deve ser evitado ou respeitado]','Restrições explícitas impedem que a IA tome decisões que você não quer.'],
 ['criteria',/\b(critério|criterio|aceitação|aceitacao|sucesso|verifique|confira|teste)\b/i,'# CRITÉRIOS DE ACEITAÇÃO\n[preencha: como saber que o resultado está correto]','Critérios verificáveis permitem conferir a entrega.']
];
const categoryRules={
 code:['Não invente resultados de testes; explique como executar e verificar.','Preserve o comportamento existente e não exponha segredos no código.'],
 image:['Descreva iluminação, enquadramento e proporção.','Liste o que deve ser evitado (texto indesejado, marcas d’água).'],
 video:['Descreva movimento do assunto e da câmera separadamente.','Indique duração e proporção desejadas, confirmando os limites do serviço.'],
 research:['Peça fontes verificáveis e que a IA declare quando não tiver acesso a elas.'],
 study:['Peça exemplos resolvidos e exercícios para verificar a compreensão.'],
 text:['Indique público e tom; peça para não inventar fatos ou números.']
};
function improvePrompt(input,options={}){
 const original=clean(input,18000);
 if(original.length<8)throw Error('Cole um prompt com pelo menos 8 caracteres.');
 const category=options.category&&labels[options.category]?options.category:inferCategory(extractObjective(original));
 const additions=[],changes=[];
 for(const [id,regex,block,why] of checks)if(!regex.test(original)){additions.push(block);changes.push({section:id,why});}
 const rules=(categoryRules[category]||[]).filter(rule=>!original.toLowerCase().includes(rule.slice(0,24).toLowerCase()));
 if(rules.length){additions.push('# BOAS PRÁTICAS\n'+rules.map(r=>'- '+r).join('\n'));changes.push({section:'quality',why:'Instruções de qualidade típicas de '+labels[category]+'.'});}
 const tool=E.tools.find(t=>t.id===options.targetTool);
 if(tool&&!original.includes(tool.name)){additions.push('# FERRAMENTA DE DESTINO\n'+tool.name+'. '+(tool.kind==='agent'?'Inspecione os arquivos existentes antes de editar e mostre o diff.':'Ajuste o pedido às opções disponíveis nesta ferramenta.'));changes.push({section:'tool',why:'Adaptação à ferramenta escolhida.'});}
 const improved=additions.length?original+'\n\n'+additions.join('\n\n'):original;
 return {category,improved,changes,unchanged:!additions.length,note:'Melhoria local por regras: as seções novas trazem marcadores [preencha: ...] em vez de conteúdo inventado.'};
}
function extractObjective(text){return E.extractGoal(text).split('\n')[0].slice(0,1400);}
function promptVariants(options={}){
 const base={...options};
 const variants=[
  {id:'direct',label:'Direta',note:'Curta, para pedidos simples ou testes rápidos.',text:generatePrompt({...base,level:'direct'})},
  {id:'complete',label:'Detalhada',note:'Equilíbrio entre contexto e objetividade.',text:generatePrompt({...base,level:'complete'})},
  {id:'advanced',label:'Especificação',note:'Requisitos, premissas e critérios verificáveis.',text:generatePrompt({...base,level:'advanced'})}
 ];
 return variants.filter((v,i,a)=>a.findIndex(x=>x.text===v.text)===i);
}
function ideaToSpec(idea,options={}){
 const plan=getPromptPlan({goal:idea,...options});
 const missing=promptMissing({goal:idea,...options});
 const questions=[];
 const fam=plan.category;
 if(fam==='code')questions.push('Quem vai usar e em qual plataforma (web, Windows, celular)?','Quais funcionalidades são indispensáveis na primeira versão?','Há dados pessoais, login ou pagamentos envolvidos?');
 else if(fam==='image')questions.push('Qual proporção e onde a imagem será usada?','Há textos exatos que precisam aparecer?','Existe referência visual ou identidade a seguir?');
 else if(fam==='video')questions.push('Qual duração e proporção?','Haverá narração, música ou som?','Onde o vídeo será publicado?');
 else questions.push('Quem é o público?','Qual o formato final esperado?','Como você vai saber que ficou bom?');
 const text=generatePrompt({...options,goal:idea,level:'advanced'})+'\n\n# PERGUNTAS EM ABERTO\n'+questions.map(q=>'- '+q).join('\n')+'\nResponda a estas perguntas ou declare uma suposição simples antes de começar.';
 return {category:fam,text,questions,missing};
}
// Biblioteca de modelos por tipo de ferramenta (campos pré-preenchidos, editáveis no Studio).
const templates=[
 {id:'builder-site',label:'Site por descrição (Lovable, Bolt.new, v0)',tools:['lovable','bolt','v0'],options:{category:'code',refinement:'site_builder',goal:'Criar um site para [negócio] com [páginas]',details:'Páginas: início, sobre, serviços, contato. Formulário de contato.',audience:'[público]',style:'[estilo visual]',success:'Funciona no celular; links e formulário testados.'}},
 {id:'agent-fix',label:'Corrigir projeto existente (Claude Code, Codex, Cursor)',tools:['claude-code','codex','cursor','copilot'],options:{category:'code',refinement:'repository_fix',goal:'Corrigir [erro] no meu projeto',projectContext:'[estrutura e tecnologias do projeto]',tests:'Reproduzir o erro antes e depois; rodar os testes existentes.',delivery:'Diff explicado e comandos de verificação.',success:'O erro não ocorre mais e nenhum teste quebra.'}},
 {id:'agent-new',label:'Novo software com agente de código',tools:['claude-code','codex','cursor','windsurf'],options:{category:'code',refinement:'software',goal:'Desenvolver [programa] para [plataforma]',features:'[lista de funcionalidades]',architecture:'[preferências ou “proponha”]',security:'Sem segredos no código; validar entradas.',tests:'Testes automatizados das funções principais.',delivery:'Arquivos completos, instruções de instalação e execução.'}},
 {id:'photo-product',label:'Foto realista de produto (Midjourney, Firefly, Gemini)',tools:['midjourney','firefly','gemini','chatgpt'],options:{category:'image',refinement:'photo',goal:'Fotografia realista de [produto]',environment:'[mesa, estúdio, cozinha]',lighting:'Luz natural lateral suave',framing:'Plano médio, lente 50 mm',aspect:'4:5',constraints:'Sem texto, sem marca d’água'}},
 {id:'poster-text',label:'Cartaz com texto legível (Ideogram)',tools:['ideogram','chatgpt'],options:{category:'image',refinement:'typography',goal:'Cartaz para [evento/negócio] com o texto exato “[TEXTO]”',composition:'Título no topo, imagem central, preço em destaque',colors:'[paleta]',aspect:'2:3',preserve:'Ortografia exata do texto'}},
 {id:'logo-svg',label:'Logotipo vetorial (Recraft)',tools:['recraft'],options:{category:'image',refinement:'vector',goal:'Logotipo vetorial para [marca]',style:'Minimalista, formas simples',colors:'Até 3 cores',constraints:'SVG com caminhos editáveis, sem bitmap embutido'}},
 {id:'video-scene',label:'Cena de vídeo gerada (Runway, Veo, Kling)',tools:['runway','veo','kling','luma'],options:{category:'video',refinement:'video',goal:'Cena de [assunto] em [ambiente]',motion:'[o que acontece]',camera:'Travelling lento para a frente',duration:'5–10 s',aspect:'16:9',continuity:'Mesmo personagem e iluminação do início ao fim'}},
 {id:'screen-demo',label:'Vídeo de demonstração de tela (Descript, Clipchamp, Loom)',tools:['descript','clipchamp','loom'],options:{category:'video',refinement:'screen_video',goal:'Vídeo mostrando o funcionamento do meu [site/app]',details:'Roteiro: problema, demonstração do fluxo principal, resultado.',duration:'1–2 min',aspect:'16:9'}},
 {id:'research-sources',label:'Pesquisa com fontes (Perplexity, Consensus, Elicit)',tools:['perplexity','consensus','elicit'],options:{category:'research',goal:'Pesquisar [pergunta] com fontes verificáveis',depth:'Visão geral com principais evidências',sources:'Fontes primárias com link e data',structure:'Resumo, evidências, divergências, referências'}},
 {id:'study-own',label:'Estudar com meus materiais (NotebookLM)',tools:['notebooklm','gemini'],options:{category:'study',refinement:'documents',goal:'Estudar [assunto] usando os PDFs enviados',audience:'[série/nível]',structure:'Resumo, conceitos-chave, 5 exercícios com gabarito',sources:'Somente os materiais enviados'}},
 {id:'automation-flow',label:'Automação entre aplicativos (Zapier, Make, n8n)',tools:['zapier','make','n8n'],options:{category:'automation',refinement:'automation',goal:'Quando [gatilho], fazer [ação] em [aplicativo]',details:'[aplicativos envolvidos e dados]',constraints:'Testar com dados fictícios; não enviar mensagens reais sem confirmação.'}},
 {id:'support-bot',label:'Chatbot de atendimento (Voiceflow, Botpress)',tools:['voiceflow','botpress'],options:{category:'agents',refinement:'chatbot',goal:'Agente de atendimento para [negócio] no [site/WhatsApp]',details:'Perguntas frequentes, horários, políticas aprovadas.',constraints:'Não inventar preços ou prazos; transferir para humano quando não souber.'}},
 {id:'data-sheet',label:'Analisar planilha (Julius, Copilot no Excel)',tools:['julius','excel-copilot'],options:{category:'data',refinement:'data_analysis',goal:'Analisar a planilha de [tema] e responder [pergunta]',details:'Colunas: [lista]',format:'Tabela-resumo e 2 gráficos',success:'Cálculos explicados e conferíveis'}},
 {id:'slides',label:'Apresentação (Gamma, Canva)',tools:['gamma','canva'],options:{category:'presentation',goal:'Apresentação sobre [tema] para [público]',structure:'10 slides: abertura, problema, 3 tópicos, conclusão',tone:'Claro e visual'}}
];
function promptMissing(options){
 return [['goal','objetivo'],['format','formato de entrega'],['success','critérios de sucesso']].filter(([k])=>!clean(options[k])).map(([,label])=>label);
}
return {analyzeResponses,compareLines,promptMissing,generatePrompt,improvePrompt,promptVariants,ideaToSpec,templates,specializedFields,getPromptPlan,inferCategory,compareResponses,validateBackup,labels,clean};
});
