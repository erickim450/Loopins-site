(function(root,factory){if(typeof module!=='undefined'&&module.exports)module.exports=factory;root.NexusRecommender=factory;})(globalThis,function(C,legacy){
'use strict';
const normalize=legacy.normalize,extractGoal=legacy.extractGoal;
/* Especificações por subtarefa.
 * required: todas as competências precisam estar confirmadas (eliminatório).
 * anyOf: ao menos uma precisa estar confirmada (eliminatório).
 * weights: pontos de adequação por competência confirmada. Ver RANKING.md. */
const specs={
transcription:{family:'audio',label:'transcrição de áudio',required:['transcription'],weights:{transcription:90}},
subtitles:{family:'text',label:'tradução de legendas',required:['subtitles'],weights:{subtitles:90}},
wordpress:{family:'code',label:'site WordPress.com',required:['wordpress'],weights:{wordpress:90,builder:10}},
site_builder:{family:'code',label:'site por descrição',required:['builder'],weights:{builder:60,noCode:20,publish:10,codeExport:5}},
landing:{family:'code',label:'landing page',required:['builder'],weights:{builder:60,noCode:20,publish:10,design:5}},
fullstack:{family:'code',label:'aplicação com login e banco',required:['fullStack'],weights:{fullStack:70,builder:20,codeExport:10}},
manual_code:{family:'code',label:'código editável',required:['code'],weights:{code:60,staticHTML:25,repository:10}},
repository_fix:{family:'code',label:'correção em projeto existente',required:['repository'],weights:{repository:80,code:20}},
software:{family:'code',label:'desenvolvimento de software',required:['code'],weights:{code:70,repository:20}},
game:{family:'code',label:'criação de jogo',anyOf:['game','code'],weights:{game:70,code:40,repository:10,noCode:10}},
photo:{family:'image',label:'imagem fotográfica de produto',required:['photo'],weights:{photo:80,imageEdit:5}},
illustration:{family:'image',label:'ilustração',required:['illustration'],weights:{illustration:80}},
typography:{family:'image',label:'imagem com texto',required:['typography'],weights:{typography:80,illustration:5}},
vector:{family:'image',label:'vetor SVG editável',required:['svg'],weights:{svg:100}},
image_edit:{family:'image',label:'edição de imagem existente',required:['imageEdit'],weights:{imageEdit:80}},
background:{family:'image',label:'remoção de fundo',required:['background'],weights:{background:90,imageEdit:10}},
video_audio:{family:'video',label:'vídeo com áudio nativo',required:['videoAudio'],weights:{videoAudio:90,video:10}},
image_video:{family:'video',label:'animar imagem existente',required:['imageVideo'],weights:{imageVideo:80,video:10}},
video:{family:'video',label:'geração de vídeo',required:['video'],weights:{video:80,camera:10}},
screen_video:{family:'video',label:'vídeo de demonstração de tela',anyOf:['screenRecord'],weights:{screenRecord:60,videoEdit:25,captions:10}},
video_edit:{family:'video',label:'edição de vídeo existente',anyOf:['videoEdit'],weights:{videoEdit:70,captions:20,transcription:5}},
science:{family:'study',label:'pesquisa científica',required:['science'],weights:{science:90,documents:5}},
web:{family:'study',label:'pesquisa web com fontes',required:['web'],weights:{web:90}},
documents:{family:'study',label:'consulta a documentos próprios',required:['documents'],weights:{documents:80,study:10}},
voice:{family:'audio',label:'narração a partir de texto',required:['voice'],weights:{voice:90}},
audio_clean:{family:'audio',label:'limpeza de gravação de fala',required:['audioClean'],weights:{audioClean:90}},
music:{family:'audio',label:'criação musical',required:['music'],weights:{music:90}},
text:{family:'text',label:'redação e revisão',required:['text'],weights:{text:80}},
study:{family:'study',label:'aprendizado e explicações',required:['study'],weights:{study:80}},
presentation:{family:'presentation',label:'apresentação',required:['presentation'],weights:{presentation:80}},
diagram:{family:'presentation',label:'diagrama ou infográfico',required:['diagram'],weights:{diagram:90}},
design:{family:'design',label:'layout visual',required:['design'],weights:{design:80}},
automation:{family:'automation',label:'automação entre aplicativos',required:['automation'],weights:{automation:80,agentBuilder:10,noCode:5}},
data_analysis:{family:'data',label:'análise de dados e planilhas',anyOf:['dataAnalysis','spreadsheet'],weights:{dataAnalysis:70,spreadsheet:25}},
chatbot:{family:'agents',label:'chatbot ou agente de atendimento',anyOf:['chatbot','agentBuilder'],weights:{chatbot:70,agentBuilder:20,noCode:10}},
resume:{family:'text',label:'currículo ou carta de apresentação',required:['resume'],weights:{resume:80,text:10,design:5}},
translation:{family:'text',label:'tradução de textos e documentos',required:['translation'],weights:{translation:90,proofread:5}},
proofread:{family:'text',label:'revisão e correção de texto',required:['proofread'],weights:{proofread:85,text:10}},
math:{family:'study',label:'matemática passo a passo',required:['math'],weights:{math:85,study:10}},
avatar_video:{family:'video',label:'vídeo com apresentador virtual',required:['avatarVideo'],weights:{avatarVideo:85,voice:10,video:5}},
model3d:{family:'design',label:'modelo 3D',required:['model3d'],weights:{model3d:90}},
short_clips:{family:'video',label:'cortes curtos de um vídeo longo',required:[],anyOf:['shortClips','videoEdit'],weights:{shortClips:50,videoEdit:40,captions:20}},
stems:{family:'audio',label:'separação de voz e instrumentos',required:['stems'],weights:{stems:90}},
language:{family:'study',label:'aprender um idioma',required:[],anyOf:['languageLearning','study'],weights:{languageLearning:55,study:35,tutoring:15}},
general:{family:'all',label:'objetivo amplo',required:[],weights:{text:1,study:1}}
};
const defaultSubtask={code:'site_builder',image:'illustration',video:'video',audio:'voice',study:'study',research:'science',presentation:'presentation',design:'design',text:'text',automation:'automation',data:'data_analysis',agents:'chatbot',all:'general'};
const refinementGroups={
text:[['text','Escrever'],['proofread','Revisar / corrigir'],['translation','Traduzir'],['resume','Currículo']],
code:[['site_builder','Site sem programar'],['manual_code','HTML / CSS / JS'],['fullstack','Login e banco'],['repository_fix','Editar projeto existente'],['game','Jogo'],['publish','Publicar']],
image:[['photo','Foto de produto'],['illustration','Ilustração'],['typography','Texto na imagem'],['vector','SVG editável'],['image_edit','Editar imagem']],
video:[['video','Gerar cena por IA'],['avatar_video','Apresentador virtual'],['screen_video','Demonstração de tela'],['video_edit','Editar / legendar vídeo'],['short_clips','Cortes curtos'],['video_audio','Com áudio'],['image_video','Animar imagem'],['camera','Direção de câmera']],
audio:[['voice','Narração'],['music','Música'],['transcription','Transcrição'],['audio_clean','Limpar gravação'],['stems','Separar voz da música']],
study:[['study','Explicações'],['math','Matemática passo a passo'],['science','Artigos científicos'],['web','Notícias e web'],['documents','Meus PDFs'],['language','Idiomas']],
research:[['science','Artigos científicos'],['web','Notícias e web'],['documents','Meus PDFs']],
presentation:[['presentation','Slides'],['diagram','Diagrama / infográfico']],
agents:[['chatbot','Sem programar'],['software','Programar o bot']],
automation:[['automation','Entre aplicativos online'],['software','Script no computador']],
data:[['data_analysis','Analisar dados']]
};

/* ── Português informal e erros de digitação ──
 * 1) gírias/abreviações comuns são expandidas;
 * 2) palavras desconhecidas com 5+ letras são comparadas ao vocabulário do
 *    interpretador; aceitamos distância 1 (2 para 8+ letras) somente quando há
 *    UMA única correção mais próxima. Correções ficam registradas no resultado. */
const slang={qro:'quero',qr:'quero',q:'que',pra:'para',pro:'para o',vc:'voce',vcs:'voces',tb:'tambem',tbm:'tambem',img:'imagem',imgs:'imagens',vid:'video',vids:'videos',ppt:'apresentacao',zap:'whatsapp',wpp:'whatsapp',app:'aplicativo',apps:'aplicativos',msg:'mensagem',bd:'banco de dados',pdf:'pdf',ia:'ia',ias:'ias',mto:'muito',mt:'muito',sla:'sei la',blz:'beleza',obg:'obrigado',fzr:'fazer',fazê:'fazer'};
const vocabulary=('quero preciso gostaria criar gerar fazer produzir montar construir desenvolver programar codificar implementar corrigir consertar depurar editar '+
'site sites website pagina aplicativo programa software sistema assistente chatbot script editor jogo imagem imagens foto fotografia fotorrealista realista ilustracao desenho '+
'logotipo cartaz poster banner capa vetorial vetor video videos filme clipe cena cinematografico animar animacao narracao locucao dublagem musica cancao trilha '+
'transcrever transcricao legenda legendas traduzir traducao reuniao podcast gravacao limpar remover ruido fundo apresentacao slides diagrama fluxograma infografico '+
'pesquisar pesquisa artigos cientificos cientifico academico referencias fontes noticias resumir resumo estudar estudos aprender explicar prova exercicios apostila '+
'escrever redacao texto email roteiro automatizar automacao planilha planilhas excel dados analisar analise grafico graficos dashboard atendimento clientes whatsapp '+
'javascript typescript python html css react banco autenticacao login publicar gratuito gratis offline localmente privacidade computador windows celular android '+
'reconheca reconhecer comandos responda funcionamento demonstracao tutorial mostrando profissional iniciante estudante desenvolvedor portfolio loja institucional '+
'confeitaria bolo legiveis tipografia editavel existente repositorio projeto erros bug codigo plataforma navegador internet lugar mensagem encomendar ruido entrevista gravada aula conversar conversa assistente perguntar pergunta duvida duvidas documento documentos ingles espanhol portugues traduzir').split(/\s+/);
// O vocabulário também absorve todas as palavras usadas nas regras abaixo, para não "corrigir" termos que as regras conhecem.
const knownTypos=new Set(['progamar','progrmar','aplicatvo','aplicaitvo','sitie','sitte','javascritp','javscript','imajen','imagns']);
function extendVocabulary(...fns){
 for(const fn of fns)for(const literal of String(fn).match(/\/(?:\\.|[^\/\n])+\/[gimsuy]*/g)||[])
  for(const w of literal.match(/[a-z]{5,}/g)||[])if(!vocabSet.has(w)&&!knownTypos.has(w)){vocabSet.add(w);vocabulary.push(w);}
}
const vocabSet=new Set(vocabulary);
function distance(a,b){
 if(Math.abs(a.length-b.length)>2)return 9;
 const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);
 for(let j=1;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
  const cost=a[i-1]===b[j-1]?0:1;
  d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+cost);
  if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
 }
 return d[a.length][b.length];
}
const commonWords=new Set('para como sobre minha minhas meus nosso nossa quando onde porque muito pouco outra outro esses essas entre ainda depois antes tambem sempre agora mesmo coisa coisas seria tenho temos voces todos todas qualquer usando usar fotos sejam deve devem possa possam possivel'.split(' '));
function correctTypos(text){
 const corrections=[];
 const words=text.split(' ').map(word=>{
  if(Object.hasOwn(slang,word)&&slang[word]!==word){corrections.push({from:word,to:slang[word],kind:'informal'});return slang[word];}
  if(word.length<5||vocabSet.has(word)||commonWords.has(word)||/\d/.test(word))return word;
  if(vocabSet.has(word.replace(/e?s$/,''))||/(?:am|em|ou|ei|ando|endo|indo|ado|ido|aria|eria|iria)$/.test(word))return word;
  // Derivadas de palavras conhecidas ("musical", "plataformas") não são erros.
  if(vocabulary.some(v=>v.length>=5&&(word.startsWith(v)||v.startsWith(word))))return word;
  const limit=word.length>=8?2:1;let best=null,bestD=9,tie=false;
  for(const v of vocabulary){const dd=distance(word,v);if(dd<bestD){best=v;bestD=dd;tie=false;}else if(dd===bestD&&v!==best)tie=true;}
  if(best&&bestD<=limit&&!tie){corrections.push({from:word,to:best,kind:'typo'});return best;}
  return word;
 });
 return {text:words.join(' '),corrections};
}

/* ── Contexto estruturado do pedido ── */
function readContext(n){
 const audience=/\b(nao sei programar|sou iniciante|iniciante|leigo|primeira vez|nunca programei|sem experiencia)\b/.test(n)?'beginner':/\b(sou desenvolvedor|sou programador|sou dev|desenvolvedor experiente|programador experiente)\b/.test(n)?'developer':/\b(escola|escolar|faculdade|tcc|trabalho da escola|sou estudante|professor|aula)\b/.test(n)?'student':/\b(empresa|cliente|clientes|negocio|minha loja|profissional|marca)\b/.test(n)?'professional':'unspecified';
 const os=(n.match(/\b(windows|mac|macos|linux|android|ios|iphone)\b/)||[])[1]||null;
 const execution=/sem (?:precisar )?(?:programar|codigo)|no.?code|nao sei programar/.test(n)?'no-code':/\b(no meu computador|localmente|offline|sem internet|rodar local)\b/.test(n)?'local':/\b(vs ?code|terminal|repositorio|meu codigo|meu projeto)\b/.test(n)?'code-assistant':'unspecified';
 const preferLowCost=/\b(barato|baratas|economico|pouco dinheiro|nao quero pagar muito|custo baixo)\b/.test(n);
 const product=(n.match(/\b(site|aplicativo|app|jogo|assistente virtual|chatbot|imagem|foto|logotipo|logo|cartaz|video|narracao|musica|apresentacao|planilha|automacao|diagrama|texto|resumo|transcricao|legenda)\b/)||[])[1]||null;
 return {audience,os,execution,preferLowCost,product};
}
function parseTask(input,preferences={}){
 const originalQuery=String(typeof input==='object'?input?.originalQuery:input||'').trim().slice(0,6500);
 const objective=extractGoal(originalQuery);
 const fuzzy=correctTypos(normalize(objective));
 let n=fuzzy.text.replace(/\b(?:sem saber|sem conhecimento de|sem conhecer|sem precisar saber|sem ter que|nao sei|nao quero|sem precisar|nao entendo(?: nada)? de|nao sei nada de) (?:programar|programacao|codigo)\b/g,'sem programar').replace(/\b(?:um |uma )?(?:lugar|pagina|espaco|presenca) (?:na internet|online)\b/g,'site').replace(/\b(sitie|sait|sitte)\b/g,'site').replace(/\b(javascritp|javscript)\b/g,'javascript').replace(/\b(imajen|imagns)\b/g,'imagem');
 const negativeSignals=[];
 // Remove rejected deliverables, preserving "sem programar" as a constraint.
 n=n.replace(/\bnao (?:quero|preciso|desejo) (?:criar |gerar |fazer )?([^,;.]+?)(?=\s+(?:mas |quero |preciso )|[,;.]|$)/g,(all)=>{negativeSignals.push(all);return ' ';});
 n=n.replace(/\b(aplicatvo|aplicaitvo)\b/g,'aplicativo').replace(/\b(progamar|progrmar)\b/g,'programar');
 const active=n.replace(/\b(sem texto|sem letras|nao incluir texto|nao quero texto)\b/g,' ');
 const has=r=>r.test(active);
 const technologies=(active.match(/\b(html|css|javascript|typescript|react|python|node|sql|java|unity|godot)\b/g)||[]).filter((x,i,a)=>a.indexOf(x)===i);
 const directMedia=has(/^(?:(?:eu )?(?:quero|preciso|gostaria de) )?(?:(?:criar|gerar|fazer|produzir|gravar|editar) (?:um |uma |o |a )?)?(?:video|filme|foto|imagem|cartaz|ilustracao|narracao)\b/);
 const software=!directMedia&&(has(/(?<!sem )\b(programar|codificar|desenvolver|implementar)\b/)||has(/\b(?:criar|fazer|montar|construir|desenvolver|programar) (?:um |uma |o |a |meu |minha )?(?:assistente|programa|software|aplicativo|app|sistema|bot|chatbot|script|editor|api|backend|servidor|extensao|plugin)\b/));
 const website=has(/\b(site|sites|website|landing page|pagina web)\b/) && !directMedia;
 let subtask='general';
 if(has(/\b(desenhar|prototipar)\b/)&&has(/\b(layout|prototipo|wireframe)\b/))subtask='design';
 else if(!software&&has(/\b(?:gerar|criar|fazer|produzir) (?:uma? )?(?:narracao|voz|locucao|dublagem)\b/))subtask='voice';
 else if(software)subtask='software';
 else if(website)subtask='site_builder';
 else if(has(/\b(karaoke|playback|separar (?:a |as |os )?(?:voz|vozes|vocal|instrumentos?|faixas|stems)|isolar (?:a |o )?(?:voz|vocal|instrumento|bateria|baixo|guitarra)|(?:remover|tirar|retirar) (?:a )?(?:voz|vocal) d[aeo])\b/))subtask='stems';
 else if(has(/\b(aprender|estudar|praticar|treinar|falar|conversar em)\b/)&&has(/\b(ingles|espanhol|frances|alemao|italiano|japones|coreano|chines|mandarim|idioma|idiomas|lingua estrangeira|conversacao)\b/))subtask='language';
 else if(has(/\b(slides|apresentacao)\b/))subtask='presentation';
 else if(has(/\b(layout|prototipo|interface)\b/)&&has(/sem programar|visual|figma/))subtask='design';
 else if(has(/\b(video|videos|filme|clipe|cena|cinematografico|cinematografica|animar)\b/))subtask='video';
 else if(has(/\b(foto|fotografia|fotografica|fotografico|realista|fotorrealista)\b/))subtask='photo';
 else if(has(/\b(imagem|imagens|ilustracao|desenho|aquarela|logo|logotipo|cartaz|poster|banner|capa)\b/))subtask='illustration';
 else if(has(/\b(limpar|melhorar|remover (?:o )?ruido|reduzir (?:o )?ruido|tirar (?:o )?ruido|restaurar|tratar)\b/)&&has(/\b(audio|gravacao|voz|podcast)\b/))subtask='audio_clean';
 else if(has(/\b(narracao|narrar|voz|locucao|dublagem)\b/))subtask='voice';
 else if(has(/\b(musica|cancao|trilha sonora|beat|compor)\b/))subtask='music';
 else if(has(/\b(codigo|javascript|python|html|css|bug|debug|repositorio)\b/))subtask='manual_code';
 else if(has(/\b(estudar|estudo|aprender|explicar|ensinar|ensine|ensina|prova|obmep|exercicios|resumo|resumir|pdf|pdfs|apostila|materia|licao|dever de casa)\b/))subtask='study';
 else if(has(/\b(texto|escrever|email|traduzir|redacao|roteiro|artigo)\b/))subtask='text';
 if(specs[subtask].family==='code'){
  if(has(/\b(corrigir|consertar|depurar|bug|erros|erro|debug|repositorio|projeto existente)\b/))subtask='repository_fix';
  else if(website&&has(/sem (?:precisar )?programar|no.?code|nao sei programar/)&&!has(/login|banco de dados|full.?stack/))subtask='site_builder';
  else if(has(/\b(html|css|javascript|react|codigo manual|codar|editar os arquivos|html puro)\b/))subtask='manual_code';
  else if(website&&has(/login|banco de dados|autenticacao|full.?stack/))subtask='fullstack';
  else if(has(/\b(landing page)\b/))subtask='landing';
  else if(software&&has(/login|banco de dados|full.?stack/))subtask='fullstack';
 }
 if(specs[subtask].family==='image'){
  if(has(/\b(svg|vetor|vetorial|vetoriais)\b/))subtask='vector';
  else if(has(/remover (?:o )?fundo|tirar (?:o )?fundo/))subtask='background';
  else if(has(/\b(editar|edicao|retocar|alterar)\b/))subtask='image_edit';
  else if(has(/texto|letras|tipografia|cartaz|poster/))subtask='typography';
  else if(has(/aquarela|ilustracao|desenho/))subtask='illustration';
 }
 if(specs[subtask].family==='video'){
  // Produto audiovisual sobre software: o vídeo é o objetivo; a tela do produto é o material.
  if(has(/\b(mostrando|mostrar|demonstr\w*|tutorial|funcionamento|gravar (?:a )?tela|gravacao de tela|tela do)\b/)||has(/\bvideo (?:sobre|do|de) (?:um |uma |o |meu |minha )?(?:site|aplicativo|app|programa|software|sistema)\b/))subtask='screen_video';
  else if(has(/\b(?:editar|cortar|montar|legendar|colocar legendas?|por legendas?) (?:o |um |meu |uns |os |meus )?videos?\b/)||has(/\blegendas? (?:automaticas?|no video|para (?:o |meu )?video)\b/))subtask='video_edit';
  else if(has(/com (?:som|audio)|audio nativo|som ambiente/))subtask='video_audio';
  else if(has(/animar|imagem existente|a partir de.*(?:foto|imagem)/))subtask='image_video';
 }
 if(!['code','image','video','audio'].includes(specs[subtask].family)){
  if(has(/cientific|academico|revisao sistematica|literatura|artigos.*fontes/))subtask='science';
  else if(has(/meus pdfs?|meus arquivos|meus documentos|pdfs? (?:proprios|anexados)|documentos proprios/))subtask='documents';
  else if(has(/noticias|recentes|atualidades|pesquis|fontes|referencias/))subtask='web';
 }
 if(!software&&has(/transcrev|transcricao/))subtask='transcription';
 if(!software&&has(/traduzir|traducao/)&&has(/legenda|subtitulo/))subtask='subtitles';
 if(!software&&has(/(?:gerar|criar|compor|uma) musica|trilha sonora/))subtask='music';
 if(has(/wordpress/)&&!['repository_fix','manual_code'].includes(subtask))subtask='wordpress';
 if(has(/rotina de estudos|organizar.*estudos/))subtask='study';
 if(has(/\b(?:resumir|resuma|consultar|perguntas sobre) (?:um |o |meu |este |esse |uns |os |meus )?(?:pdf|pdfs|documento|documentos|apostila|livro)\b/)&&!software)subtask='documents';
 if(has(/codigo.*existente|melhorar.*codigo/))subtask='repository_fix';
 // Subtarefas da versão 5.0 — avaliadas depois das regras anteriores para preservar seus resultados.
 const codeIntent=technologies.length>0||has(/\b(programar|codificar|codigo|api|sdk)\b/);
 if(has(/\b(diagrama|fluxograma|infografico|mapa mental|organograma|linha do tempo visual)\b/)&&!codeIntent)subtask='diagram';
 if(has(/\b(jogo|jogos|game|games)\b/)&&(has(/\b(criar|fazer|desenvolver|montar|construir|produzir|programar)\b/)||!has(/\b(jogar|recomend\w*|indica\w*)\b/))&&!['repository_fix'].includes(subtask)&&!has(/\b(musica|trilha|som|sons|efeitos sonoros|imagem|imagens|arte|personagem|logo|logotipo|video|trailer|capa|narracao)s? (?:para|do|de) (?:o |um |meu |minha )?(?:jogo|game)\b/))subtask=technologies.length||has(/(?<!sem )\b(programar|codificar)\b/)?'software':'game';
 if(has(/\b(chatbot|bot de atendimento|atendimento automatico|atendente virtual|responder (?:os )?clientes|agente de atendimento|bot (?:no|para|do) whatsapp)\b/)&&!codeIntent)subtask='chatbot';
 if(has(/\b(automatizar|automatize|automacao|automacoes|fluxo automatico|integrar)\b/)&&!['repository_fix','manual_code'].includes(subtask)){
  subtask=has(/\b(computador|pc|windows|arquivos|pastas|area de trabalho|mouse|teclado)\b/)||codeIntent?'software':'automation';
 }
 if(has(/\b(planilha|planilhas|excel|csv|google sheets)\b/)||has(/\b(analisar|analise|grafico|graficos|dashboard|estatistica)\b.*\b(dados|vendas|tabela|resultados|numeros)\b/)){
  if(!codeIntent&&!['automation','repository_fix'].includes(subtask))subtask='data_analysis';
 }
 if(has(/\b(gravar (?:a )?tela|gravacao de tela|gravar meu monitor|screencast)\b/)&&!software)subtask='screen_video';
 if(subtask==='general'&&technologies.length)subtask='software';
 // Roteiro, legenda de post ou texto "para" um vídeo: o produto é texto.
 if(has(/\b(roteiro|script de video|descricao para (?:o |um )?video|legenda para (?:o |um )?post)\b/)&&!software&&!directMedia&&!['screen_video','video_edit','subtitles'].includes(subtask))subtask='text';
 if(has(/\b(curriculo|curriculos|curriculum|cv|carta de apresentacao)\b/)&&!software&&!codeIntent)subtask='resume';
 // 5.3: tradução, revisão, matemática, avatar e 3D.
 if(!software&&!codeIntent){
  if(has(/\b(traduzir|traduza|traducao|tradutor)\b/)&&!has(/\b(legenda|legendas|subtitulo|video|videos)\b/))subtask='translation';
  if(has(/\b(?:corrigir|corrija|revisar|revise|melhorar|checar|verificar) (?:a |o |minha |meu |um |uma )?(?:texto|textos|redacao|gramatica|ortografia|portugues|frase|frases|trabalho escrito)\b/)||has(/\b(correcao gramatical|corretor gramatical|erros de portugues|parafrasear|parafrase|reescrever (?:o |um |meu )?texto)\b/))subtask='proofread';
  if((has(/\b(resolver|resolva|solucionar|calcular|resolucao)\b/)&&has(/\b(equacao|equacoes|conta|contas|matematica|exercicio|exercicios|problema|derivada|integral|calculo|funcao)\b/))||has(/\b(equacao|equacoes|derivada|integral)\b/))subtask='math';
  if(has(/\b(avatar|avatares|apresentador virtual|apresentadora virtual|apresentador digital|pessoa falando|talking head|dublar (?:o |meu )?video|traduzir (?:o |meu )?video)\b/))subtask='avatar_video';
  if(has(/\b(3d|tridimensional|impressao 3d|modelo 3d|objeto 3d)\b/)&&!has(/\b(jogo|jogos|game)\b/))subtask='model3d';
 }
 // 5.8: separar voz da música, idiomas, cortes de vídeo, foto que fala e flashcards.
 if(!software&&!codeIntent){
  if(has(/\b(karaoke|playback|separar (?:a |as |os )?(?:voz|vozes|vocal|instrumentos?|faixas|stems)|isolar (?:a |o )?(?:voz|vocal|instrumento|bateria|baixo|guitarra)|(?:remover|tirar|retirar) (?:a )?(?:voz|vocal) d[aeo])\b/))subtask='stems';
  if(has(/\b(aprender|estudar|praticar|treinar|falar|conversar em)\b/)&&has(/\b(ingles|espanhol|frances|alemao|italiano|japones|coreano|chines|mandarim|idioma|idiomas|lingua estrangeira|conversacao)\b/)&&!has(/\b(traduzir|traduza|traducao)\b/))subtask='language';
  if(has(/\b(cortes?|clipes? curtos|shorts|reels)\b/)&&has(/\bvideos?\b/))subtask='short_clips';
  if(has(/\b(?:foto|imagem|retrato) (?:\w+ ){0,3}(?:falando|falar|fale)\b/))subtask='avatar_video';
  if(has(/\b(flashcards?|cartoes de estudo|cartoes de memoria)\b/))subtask='study';
 }
 const originalSubtask=subtask;
 if(specs[preferences.refinement])subtask=preferences.refinement;
 const constraintText=normalize(preferences.constraintText||(typeof input==='object'?input?.constraintText:'')||'').slice(0,800);
 const constrained=r=>r.test(active+' '+constraintText);
 const context=readContext(active+' '+constraintText);
 const constraints={
 freeOnly:['free','free-strict'].includes(preferences.budget)||constrained(/\b(gratis|gratuito|gratuita|sem pagar|de graca)\b/),
 noCode:has(/sem (?:precisar )?(?:programar|codigo)|no.?code|nao sei programar/)||preferences.refinement==='site_builder',
 editableCode:constrained(/codigo editavel|exportar.*codigo|editar (?:os )?arquivos/),
 commercialUse:constrained(/uso comercial|licenca comercial/),
 privacy:preferences.privacy===true||constrained(/dados nao podem sair|nao enviar dados|privacidade local|sem enviar para (?:a )?nuvem/),
 offline:preferences.offline===true||(!software&&has(/\b(offline|sem internet|localmente)\b/))||has(/ferramenta.*offline/),
 language:has(/\b(em ingles|ingles)\b/)?'en':has(/\b(em espanhol|espanhol)\b/)?'es':'pt-BR',
 outputFormat:preferences.outputFormat||(constrained(/\bsvg\b/)?'svg':constrained(/html puro|html estatico|arquivos html/)?'html':null)
 };
 const evidence=[specs[subtask].label];
 if(preferences.experience&&preferences.experience!=='any')evidence.push('Experiência orienta o prompt e o critério de facilidade; não altera a competência confirmada.');
 if(technologies.length)evidence.push('Tecnologias: '+technologies.join(', '));
 if(negativeSignals.length)evidence.push('Finalidade negada foi desconsiderada');
 for(const c of fuzzy.corrections)evidence.push((c.kind==='typo'?'Possível erro de digitação: ':'Linguagem informal: ')+'“'+c.from+'” lido como “'+c.to+'”');
 const ambiguity=[];
 if(['general','site_builder'].includes(originalSubtask))ambiguity.push(originalSubtask==='general'?'Detalhe o produto final.':'Por padrão, sugerimos criação por descrição; você pode escolher código manual.');
 if(constraints.noCode&&subtask==='manual_code')ambiguity.push('Pedido mistura código manual e ausência de programação; confirme o fluxo.');
 const secondary=[];
 if(website&&has(/\be (?:um |uma )?(?:logo|logotipo|imagem)\b/))secondary.push('vector');
 if(['screen_video','video_edit'].includes(subtask)&&has(/\b(narracao|locucao|voz)\b/))secondary.push('voice');
 if(subtask==='presentation'&&has(/\b(imagens?|ilustrac\w+)\b/))secondary.push('illustration');
 if(['site_builder','landing','fullstack'].includes(subtask)&&has(/\b(chatbot|atendimento)\b/))secondary.push('chatbot');
 const taskFamily=specs[subtask].family;
 const experience=preferences.experience&&preferences.experience!=='any'?preferences.experience:context.audience==='beginner'?'beginner':context.audience==='developer'?'advanced':'any';
 return {schemaVersion:1,originalQuery,constraintText,normalizedQuery:active,action:(active.match(/\b(criar|gerar|fazer|corrigir|editar|pesquisar|resumir|narrar|animar|programar|automatizar|analisar|transcrever|gravar|estudar|comparar|traduzir)\b/)||[])[0]||'explorar',deliverable:specs[subtask].label,taskFamily,subtask,subject:(active.match(/\b(?:de|sobre|para) (.+)$/)||[])[1]||null,style:(active.match(/\b(realista|aquarela|minimalista|cinematografico|cinematografica)\b/g)||[]),platform:preferences.platform||'any',technologies,constraints,context,corrections:fuzzy.corrections,signals:{evidence,ambiguity,negativeSignals},experience,confidence:subtask==='general'?'low':ambiguity.length?'medium':'high',secondary};
}
function analyzeTask(input){const t=parseTask(input);const aliases={software:'desenvolvimento',manual_code:'desenvolvimento',repository_fix:'depuracao',site_builder:'interface',landing:'interface',fullstack:'desenvolvimento',game:'desenvolvimento',science:'pesquisa',web:'pesquisa',documents:'material',typography:'tipografia',voice:'voz',music:'musica',audio_clean:'edicao_audio',stems:'edicao_audio',short_clips:'video',language:'aprendizado',study:'aprendizado',automation:'automacao',data_analysis:'dados',chatbot:'atendimento',screen_video:'video',video_edit:'video',diagram:'visual'};return {intent:aliases[t.subtask]||'geral',signals:t.signals.evidence,preferenceFree:t.constraints.freeOnly,normalized:t.normalizedQuery,isSoftware:t.taskFamily==='code',objective:extractGoal(t.originalQuery),taskIntent:t};}
function classify(input){const t=parseTask(input);return {category:t.taskFamily,normalized:t.normalizedQuery,isSoftware:t.taskFamily==='code',scores:{[t.taskFamily]:1},taskIntent:t};}

/* ── Critérios complementares do ranking (documentados em RANKING.md) ──
 * A adequação por competência domina (dezenas de pontos). Estes critérios
 * valem poucos pontos e servem para ordenar opções igualmente adequadas. */
const EASE={nenhum:4,baixo:4,medio:2,alto:0};
function extraCriteria(tool,intent,matches,requirements){
 const out=[];
 const level=tool.facts?.technicalLevel;
 const wantsCode=['manual_code','repository_fix','software'].includes(intent.subtask)||intent.context?.audience==='developer'||intent.experience==='advanced';
 if(level&&level in EASE&&!wantsCode){
  let points=EASE[level];
  if(intent.experience==='beginner'||intent.constraints.noCode)points=level==='alto'?-6:level==='medio'?0:6;
  if(points)out.push({criterion:'ease',label:'Facilidade de uso',points,detail:'Nível técnico editorial: '+level+'.'});
 }
 if(intent.context?.preferLowCost&&!intent.constraints.freeOnly){
  const freeCover=requirements.every(k=>tool.freeCapabilities.includes(k))&&['free','freemium'].includes(tool.accessDetails.app.status);
  if(freeCover)out.push({criterion:'free',label:'Uso gratuito documentado',points:5,detail:tool.accessDetails.app.note||'Plano gratuito cobre as competências exigidas.'});
 }
 const relevant=matches.filter(m=>m.points>=10);
 if(relevant.length&&relevant.every(m=>m.evidence==='direct'))out.push({criterion:'evidence',label:'Evidência lida diretamente',points:2,detail:'Todas as competências principais vêm de páginas oficiais lidas diretamente.'});
 const lang=(intent.constraints?.language||'pt-BR').slice(0,2);
 if(['transcription','subtitles','voice','video_edit','screen_video','resume','translation','proofread'].includes(intent.subtask)&&tool.facts?.languages?.includes(lang))out.push({criterion:'language',label:'Idioma confirmado',points:3,detail:'Suporte a '+(lang==='pt'?'português':lang)+' documentado em fonte oficial.'});
 if(intent.context?.os&&tool.platforms.length){
  const desktop=['windows','mac','macos','linux'].includes(intent.context.os);
  if(desktop&&tool.kind==='agent'&&tool.platforms.includes('desktop'))out.push({criterion:'platform',label:'Roda no computador',points:2,detail:'Plataforma desktop registrada.'});
 }
 return out;
}
extendVocabulary(parseTask,readContext);
const capabilityName=k=>C.capabilityLabels[k]||k;
function explain(tool,ranked,intent,spec){
 const weightKeys=Object.keys(spec.weights);
 const fits=tool.matchedCapabilities.filter(m=>!String(m.label).startsWith('Foco')).map(m=>m.label);
 const uncertain=weightKeys.filter(k=>tool.capabilities[k]?.status==='unknown').map(capabilityName);
 const limitations=[...(tool.facts?.limitations||[]),...tool.cons].filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,3);
 const whenOther=[];
 for(const other of ranked){
  if(other.id===tool.id||whenOther.length>=3)continue;
  const edge=weightKeys.filter(k=>other.capabilities[k]?.status==='supported'&&tool.capabilities[k]?.status!=='supported');
  if(edge.length)whenOther.push('Se você precisar de '+edge.map(capabilityName).join(' e ').toLowerCase()+', '+other.name+' tem isso confirmado.');
  else if(EASE[tool.facts?.technicalLevel]===0&&EASE[other.facts?.technicalLevel]>=4&&!whenOther.some(x=>x.includes('sem instalar')))whenOther.push('Se preferir algo sem instalar nem configurar, '+other.name+' tem uso mais simples.');
 }
 const beforeUse=[];
 const app=tool.accessDetails?.app;
 beforeUse.push(app?.note?'Plano: '+app.note:'Plano e limites: não verificados pelo Loopins; consulte o site oficial.');
 if(tool.kind==='agent')beforeUse.push('É um agente que altera arquivos e pode executar comandos: use controle de versão e revise as mudanças.');
 if(tool.kind==='model'||tool.facts?.local)beforeUse.push('Exige instalação ou acesso por outro produto; o desempenho depende do hardware ou do provedor.');
 if(tool.accessDetails?.api?.status!=='supported')beforeUse.push('Assinatura do aplicativo não confirma acesso à API.');
 if(tool.matchedCapabilities.some(m=>m.evidence==='indexed'))beforeUse.push('Parte das evidências foi conferida por busca indexada em página oficial (não lida diretamente).');
 return {why:'Para '+spec.label+', tem confirmado em fonte oficial: '+(fits.join(', ')||'as competências exigidas').toLowerCase()+'.',fits,limitations,whenOther,beforeUse,uncertain};
}
function compareTop(first,second){
 if(!first)return null;
 if(!second)return {summary:first.name+' é a única opção que atende a todos os requisitos confirmados.',reasons:[],tie:false};
 const a=Object.fromEntries(first.breakdown.map(b=>[b.key,b])),b=Object.fromEntries(second.breakdown.map(x=>[x.key,x]));
 const reasons=[];
 for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
  const diff=(a[key]?.points||0)-(b[key]?.points||0);
  if(diff>0)reasons.push(a[key].label+': +'+diff+' ponto(s) em relação a '+second.name+'.');
  else if(diff<0)reasons.push(b[key].label+': '+second.name+' tem +'+(-diff)+'; compensado por outros critérios.');
 }
 if(first.score===second.score)return {summary:first.name+' e '+second.name+' empataram em '+first.score+' pontos. A ordem entre elas é alfabética e não indica que uma seja melhor.',reasons,tie:true};
 return {summary:first.name+' somou '+first.score+' pontos e '+second.name+' '+second.score+'. A diferença vem dos critérios abaixo; os pontos medem adequação ao pedido segundo o catálogo, não qualidade dos resultados.',reasons,tie:false};
}

/* ── Perguntas de esclarecimento: só quando a resposta muda a recomendação ── */
function questionsFor(intent,preferences){
 if(preferences.refinement||preferences.answered)return [];
 const q=[],n=intent.normalizedQuery,s=intent.subtask;
 const mk=(id,text,options)=>q.push({id,text,options});
 if(s==='site_builder'&&!intent.constraints.noCode&&!intent.technologies.length){
  mk('site-kind','Que tipo de site você pretende criar?',[['Loja virtual','fullstack','loja virtual com carrinho e pagamento'],['Portfólio','site_builder','portfólio'],['Site institucional','site_builder','site institucional'],['Aplicativo web','fullstack','aplicativo web com login'],['Página de apresentação','landing','landing page'],['Outro',null,null]]);
  mk('site-build','Você pretende programar ou prefere uma ferramenta que construa o site para você?',[['Construir para mim','site_builder','sem programar'],['Vou programar','manual_code','HTML, CSS e JavaScript'],['Já tenho um site para modificar','repository_fix','projeto existente']]);
 }
 if(s==='general')mk('product','Qual é o resultado final que você quer?',[['Site ou app','site_builder',null],['Imagem','illustration',null],['Vídeo','video',null],['Texto','text',null],['Estudar um assunto','study',null],['Automatizar tarefas','automation',null]]);
 if(s==='illustration'&&!/\b(aquarela|desenho|ilustracao)\b/.test(n))mk('image-kind','Que tipo de imagem?',[['Foto realista','photo',null],['Ilustração','illustration',null],['Com texto legível','typography',null],['Logotipo vetorial','vector',null],['Editar uma imagem minha','image_edit',null]]);
 if(s==='video'&&!/\b(cena|cinematografic\w*|animad\w*|paisagem)\b/.test(n))mk('video-kind','O vídeo será gerado por IA ou feito a partir de gravações?',[['Cena gerada por IA','video',null],['Gravação da minha tela','screen_video',null],['Editar vídeo que já tenho','video_edit',null]]);
 if(s==='voice'&&!/\b(narracao|locucao|narrar)\b/.test(n))mk('audio-kind','O que você quer fazer com áudio?',[['Narração de um texto','voice',null],['Música','music',null],['Transcrever uma gravação','transcription',null],['Limpar uma gravação','audio_clean',null]]);
 if(s==='software'&&!intent.technologies.length&&intent.context.audience!=='developer'&&/\b(aplicativo|app)\b/.test(n)&&!/\b(voz|comando|microfone)\b/.test(n))mk('app-build','Você vai programar o aplicativo ou prefere que uma ferramenta construa para você?',[['Vou programar (com ajuda de IA)','software',null],['Construir sem programar','fullstack','sem programar']]);
 if(s==='software'&&/\bautomat\w*/.test(n))mk('automation-kind','A automação é entre aplicativos online ou no seu computador?',[['Entre aplicativos online (e-mail, planilhas, formulários)','automation',null],['No meu computador (arquivos, programas)','software','script para o computador']]);
 if(s==='chatbot')mk('bot-build','Você quer montar o bot sem programar ou escrever o código?',[['Sem programar','chatbot',null],['Programar','software','programar chatbot']]);
 return q.slice(0,2).map(x=>({...x,options:x.options.map(([label,refinement,append])=>({label,refinement,append}))}));
}

/* ── Busca por funcionalidade: "ferramentas que geram SVG" ── */
const capabilityTerms=[[/traduz|traduc/,'translation'],[/gramatic|ortografi|revisa/,'proofread'],[/matematic|equac/,'math'],[/avatar|apresentador virtual/,'avatarVideo'],[/\b3d\b/,'model3d'],[/\bsvg|vetor/,'svg'],[/transcri/,'transcription'],[/legenda/,'captions'],[/offline|sem internet|localmente/,'offline'],[/gravar (?:a )?tela|gravacao de tela/,'screenRecord'],[/remov\w* (?:o )?fundo/,'background'],[/audio nativo|video com som/,'videoAudio'],[/animar (?:uma )?(?:foto|imagem)/,'imageVideo'],[/automa/,'automation'],[/planilha|excel/,'spreadsheet'],[/chatbot|atendimento/,'chatbot'],[/diagrama|fluxograma|infografico/,'diagram'],[/jogo|game/,'game'],[/texto na imagem|tipografia|letras legiveis/,'typography'],[/narra|texto para voz|locucao/,'voice'],[/music|cancao/,'music'],[/artigos cientificos|cientific/,'science'],[/meus pdfs|documentos proprios/,'documents'],[/publicar/,'publish'],[/codigo editavel|exportar (?:o )?codigo/,'codeExport']];
function capabilitySearch(normalized){
 if(!/^(?:(?:quais|que|existe|existem|tem|ha|me mostre|liste|mostre)\s+)*(?:as |os )?(?:ferramentas|ias|apps|aplicativos|sites|programas|servicos|opcoes)\s+(?:(?:que\s+)?(?:fazem|fazer|geram|gerar|criam|criar|tem|permitem|suportam|oferecem|exportam)|que|para|com|de)\b/.test(normalized))return null;
 const found=capabilityTerms.filter(([r])=>r.test(normalized)).map(([,k])=>k);
 if(!found.length)return null;
 const tools=C.tools.filter(t=>found.every(k=>t.capabilities[k]?.status==='supported')).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(t=>({id:t.id,name:t.name,notes:found.map(k=>t.capabilities[k].note)}));
 return {capabilities:found,labels:found.map(capabilityName),tools};
}
function similarTools(id,limit=4){
 const base=C.tools.find(t=>t.id===id);if(!base)return [];
 const own=new Set(Object.entries(base.capabilities).filter(([,c])=>c.status==='supported').map(([k])=>k));
 if(!own.size)return [];
 return C.tools.filter(t=>t.id!==id).map(t=>{const caps=Object.entries(t.capabilities).filter(([,c])=>c.status==='supported').map(([k])=>k);const shared=caps.filter(k=>own.has(k));const union=new Set([...own,...caps]).size;return {id:t.id,name:t.name,shared:shared.map(capabilityName),score:union?shared.length/union:0};}).filter(x=>x.shared.length).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pt-BR')).slice(0,limit);
}

/* Reformulação local: reescreve o pedido a partir da intenção estruturada, sem acrescentar fatos. */
function reformulate(intent){
 const phrase={site_builder:'criar um site com uma ferramenta que monte o site a partir da descrição',landing:'criar uma landing page',fullstack:'criar uma aplicação com login e banco de dados',manual_code:'escrever o código do projeto',repository_fix:'corrigir e melhorar um projeto de código existente',software:'desenvolver um software',game:'criar um jogo',screen_video:'produzir um vídeo de demonstração gravando a tela',video_edit:'editar um vídeo que já tenho',study:'estudar com explicações e exercícios',documents:'consultar e resumir meus próprios documentos',web:'pesquisar na web com fontes',science:'pesquisar artigos científicos',general:'realizar uma tarefa (descreva o resultado final)'}[intent.subtask]||'obter '+intent.deliverable;
 const parts=['Quero '+phrase];
 if(intent.subject)parts.push('sobre/para '+intent.subject);
 if(intent.technologies.length)parts.push('usando '+intent.technologies.join(', '));
 const c=intent.constraints,limits=[];
 if(c.noCode)limits.push('sem programar');
 if(c.freeOnly)limits.push('com opção gratuita');
 if(c.offline)limits.push('funcionando offline');
 if(c.privacy)limits.push('sem enviar dados para a nuvem');
 if(c.outputFormat)limits.push('com saída em '+c.outputFormat.toUpperCase());
 if(intent.context?.os)limits.push('no '+intent.context.os);
 if(intent.context?.audience&&intent.context.audience!=='unspecified')limits.push({beginner:'sou iniciante',developer:'sou desenvolvedor',student:'é para a escola',professional:'é para uso profissional'}[intent.context.audience]);
 return (parts.join(' ')+(limits.length?', '+limits.join(', '):'')+'.').replace(/\s+/g,' ');
}
function recommend(input,forcedCategory,preferences={}){
 const intent=parseTask(input,preferences);
 let category=intent.taskFamily;
 if(forcedCategory&&forcedCategory!=='all'&&legacy.categories[forcedCategory]){
 category=forcedCategory;
 const equivalent=forcedCategory==='research'&&['science','web','documents'].includes(intent.subtask);
 if(category!==intent.taskFamily&&!equivalent){intent.subtask=defaultSubtask[category];intent.taskFamily=category;intent.deliverable=specs[intent.subtask].label;intent.signals.evidence.push('Categoria escolhida manualmente');}
 }
 const baseSpec=specs[intent.subtask],c=intent.constraints,required=[...(baseSpec.required||[])];
 // Tutoria guiada só pontua quando o pedido pede orientação passo a passo.
 const tutoringSignal=/\b(tutor|me ensine|me ensina|dever de casa|licao de casa|sem me dar a resposta|passo a passo)\b/.test(intent.normalizedQuery);
 const spec=intent.subtask==='study'&&tutoringSignal?{...baseSpec,weights:{...baseSpec.weights,tutoring:15}}:baseSpec;
 if(c.noCode)required.push('noCode');
 if(c.editableCode)required.push('codeExport');
 if(c.outputFormat==='html')required.push('staticHTML');
 if(c.outputFormat==='svg')required.push('svg');
 if(c.offline)required.push('offline');
 if(c.commercialUse)required.push('commercial');
 if(c.privacy)required.push('private');
 if(preferences.refinement==='publish')required.push('publish');
 if(preferences.refinement==='camera')required.push('camera');
 const requirements=[...new Set(required)],excluded=[],eligible=[];
 const languageCode=c.language.slice(0,2);
 const languageMatters=['transcription','subtitles','voice','video_edit'].includes(intent.subtask);
 for(const tool of C.tools){
 const missing=requirements.filter(k=>tool.capabilities[k]?.status!=='supported');
 if(spec.anyOf&&!spec.anyOf.some(k=>tool.capabilities[k]?.status==='supported'))missing.push('anyOf');
 if(c.freeOnly&&(!['free','freemium'].includes(tool.accessDetails.app.status)||requirements.some(k=>!tool.freeCapabilities.includes(k))||(spec.anyOf&&!spec.anyOf.some(k=>tool.freeCapabilities.includes(k)))))missing.push('free');
 if(preferences.budget==='free-strict'&&tool.access!=='free')missing.push('free');
 if(preferences.integration==='connected')missing.push('integration');
 if(intent.platform!=='any'&&!tool.platforms.includes(intent.platform))missing.push('platform');
 if(languageMatters&&tool.facts?.unsupportedLanguages?.includes(languageCode))missing.push('language');
 if(missing.length){excluded.push({id:tool.id,name:tool.name,reason:missing.map(k=>k==='anyOf'?'Nenhuma destas competências confirmada: '+spec.anyOf.map(capabilityName).join(' ou '):k==='language'?'Idioma '+c.language+': documentado como não suportado':(C.capabilityLabels[k]||({free:'Acesso gratuito no escopo solicitado',platform:'Plataforma',integration:'Integração oficial no Loopins'}[k])||k)+': '+(tool.capabilities[k]?.status==='unsupported'?'não suportado':'não confirmado')).join('; '),missing});continue;}
 const matches=Object.entries(spec.weights).filter(([k])=>tool.capabilities[k]?.status==='supported').map(([capability,points])=>({capability,label:C.capabilityLabels[capability],points,...tool.capabilities[capability]}));
 if(!matches.length){excluded.push({id:tool.id,name:tool.name,reason:'Nenhuma competência relevante revalidada.',missing:['competence']});continue;}
 const specialty=matches.find(m=>m.points===Math.max(...Object.values(spec.weights))&&(tool.specialties||[]).includes(m.capability));
 if(specialty)matches.push({...specialty,points:12,label:'Foco editorial: '+specialty.label});
 const fitScore=matches.reduce((sum,m)=>sum+m.points,0);
 const extras=extraCriteria(tool,intent,matches,requirements);
 const score=fitScore+extras.reduce((s,x)=>s+x.points,0);
 const breakdown=[{key:'fit',label:'Adequação às competências do pedido',points:fitScore-(specialty?12:0),detail:matches.filter(m=>!String(m.label).startsWith('Foco')).map(m=>m.label+' +'+m.points).join(', ')},...(specialty?[{key:'specialty',label:'Especialização na tarefa',points:12,detail:specialty.label}]:[]),...extras.map(x=>({key:x.criterion,label:x.label,points:x.points,detail:x.detail}))];
 eligible.push({...tool,score,fitScore,breakdown,matchedCapabilities:matches,requirements,why:matches.map(m=>m.label).join(' · '),reason:'Atende '+spec.label+'. '+matches.map(m=>m.label+' (fonte revisada '+m.reviewedAt+')').join('; ')+'. Empates são alfabéticos; a ordem não mede qualidade.'});
 }
 eligible.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pt-BR')||a.id.localeCompare(b.id));
 for(const t of eligible)t.explanation=explain(t,eligible,intent,spec);
 // Relevância mínima: no top 3 só entram opções com pelo menos metade da adequação da primeira.
 const minimumFit=(eligible[0]?.fitScore||0)*0.5;
 const strong=eligible.filter(t=>t.fitScore>=minimumFit);
 const items=strong.slice(0,3).map((t,i)=>({...t,position:i+1,tiedWith:eligible.filter(o=>o.id!==t.id&&o.score===t.score).map(o=>o.name)}));
 const workflow=intent.secondary.map(s=>({subtask:s,label:specs[s].label,query:'Criar '+specs[s].label+' para o projeto'}));
 if(['software','game'].includes(intent.subtask)&&/\bvoz\b/.test(intent.normalizedQuery))workflow.push({subtask:'voice',label:'Depois: gerar a voz (não substitui o desenvolvimento)',query:'Gerar narração de texto'});
 const analysis=analyzeTask(intent.originalQuery);analysis.taskIntent=intent;analysis.signals=[...intent.signals.evidence,...intent.signals.ambiguity];
 const capabilityMatch=capabilitySearch(intent.normalizedQuery);
 const questions=capabilityMatch?[]:questionsFor(intent,preferences);
 const uncertainty=[];
 if(intent.confidence!=='high')uncertainty.push('A interpretação tem confiança '+(intent.confidence==='low'?'baixa':'média')+'; responda às perguntas ou refine a finalidade.');
 if(items.length&&items.length<3)uncertainty.push('Somente '+items.length+' ferramenta(s) com as competências confirmadas; outras podem atender, mas não verificamos.');
 if(items.some(t=>t.tiedWith.length))uncertainty.push('Há empates de pontuação; a ordem entre empatadas é alfabética.');
 if(intent.corrections.length)uncertainty.push('Corrigimos palavras automaticamente; confira em “Como interpretamos seu pedido”.');
 return {request:intent.originalQuery,category,categoryName:legacy.categories[category].label,intent,analysis,items,eligible,otherOptions:eligible.filter(t=>!items.some(i=>i.id===t.id)),excluded,requirements,anyOf:spec.anyOf||[],refinements:(refinementGroups[category]||[]).map(([id,label])=>({id,label})),workflow,questions,uncertainty,whyFirst:compareTop(eligible[0],eligible[1]),capabilitySearch:capabilityMatch,alternatives:forcedCategory&&forcedCategory!=='all'?[]:intent.subtask==='general'?['code','text']:/^imagem video$/.test(intent.normalizedQuery)?['image','video']:[],heading:items.length?'Opções para '+spec.label:'Nenhuma opção confirmada com estes requisitos',rationale:(intent.subtask==='general'?'Objetivo amplo: escolha uma finalidade. ':'')+'Seleção por competências documentadas. '+(items.length<3?'Há '+items.length+' opção(ões) confirmada(s); não completamos a lista com opções incompatíveis. ':'')+'Ordem editorial, sem medição de qualidade, preço ou desempenho em tempo real.',pipeline:{objective:extractGoal(intent.originalQuery),primary:category,secondary:intent.secondary,preferences:{...preferences,offline:c.offline,budget:c.freeOnly?'free':'any',platform:intent.platform}},trace:{subtask:intent.subtask,weights:spec.weights,requirements,anyOf:spec.anyOf||[],candidates:C.tools.length,eligible:eligible.length,tieBreak:'nome em ordem alfabética',criteria:'Ver RANKING.md'}};
}
return {parseTask,analyzeTask,classify,recommend,reformulate,similarTools,capabilitySearch,correctTypos,subtasks:specs,detectsSoftwareProject:input=>parseTask(input).taskFamily==='code'};
});
