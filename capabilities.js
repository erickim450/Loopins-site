(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusCapabilities=api;})(globalThis,function(){
'use strict';
const labels={transcription:'Transcrever áudio/vídeo',subtitles:'Traduzir legendas',wordpress:'Site WordPress.com',builder:'Sites por descrição',noCode:'Fluxo sem programar',fullStack:'Aplicação com backend',code:'Escrita de código',repository:'Edição de repositório',staticHTML:'Arquivos HTML/CSS/JS',codeExport:'Código editável',publish:'Publicação de site',photo:'Imagem fotográfica',illustration:'Ilustração',typography:'Texto na imagem',svg:'Vetor SVG editável',imageEdit:'Editar imagem existente',background:'Remover fundo',video:'Gerar vídeo',videoAudio:'Vídeo com áudio nativo',imageVideo:'Animar imagem',camera:'Direção de câmera',science:'Pesquisa científica',web:'Pesquisa web com fontes',documents:'Consultar documentos próprios',voice:'Texto para voz',audioClean:'Limpar gravação de fala',music:'Criação musical',text:'Redação e revisão',study:'Explicações e estudo',presentation:'Apresentações',design:'Layout visual',offline:'Execução offline',commercial:'Licença comercial confirmada',private:'Privacidade exigida'};
const FACTS=typeof module!=='undefined'&&module.exports?require('./catalog-facts.js'):globalThis.NexusCatalogFacts;
Object.assign(labels,FACTS.newLabels);
const profiles={};
function add(ids,keys,url,note,kind='app',reviewedAt='2026-10-24',evidence='direct'){for(const id of ids.split(' ')){const p=profiles[id]||(profiles[id]={kind,capabilities:{}});p.kind=kind;for(const key of keys.split(' '))p.capabilities[key]={status:'supported',source:url,reviewedAt,note,evidence};}}
add('lovable','builder noCode fullStack codeExport publish','https://docs.lovable.dev/introduction/welcome','Cria aplicações por descrição; código e sincronização com repositório.');
add('bolt','builder noCode fullStack codeExport publish','https://support.bolt.new/get-started/intro-bolt','Construção de apps por prompt; integração com código, banco e hospedagem.');
add('v0','builder noCode fullStack codeExport publish','https://v0.app/docs','Criação de interfaces e apps com backend; implantação pela plataforma.');
add('framer','builder noCode publish design','https://www.framer.com/ai/','Editor visual e criação/publicação de sites com AI.');
add('claude-code','code repository codeExport staticHTML','https://claude.com/product/claude-code','Agente lê projeto, edita arquivos e executa comandos. HTML é uma aplicação editorial dessa capacidade, não exportação de um builder.','agent');
add('cursor','code repository codeExport staticHTML','https://cursor.com/docs/agent/overview','Agente modifica arquivos e executa terminal; HTML pode ser escrito diretamente.','agent');
add('codex','code repository codeExport staticHTML','https://openai.com/codex/','Agente para escrever código, corrigir bugs e executar testes; arquivos estáticos podem ser solicitados.','agent');
add('chatgpt','code text study','https://chatgpt.com/','Assistente geral para escrita, perguntas e código; não equivale ao agente Codex.');
add('chatgpt','photo illustration typography imageEdit','https://openai.com/academy/image-generation/','Criação e refinamento de imagens por descrição e referências; revisar texto gerado.');
add('midjourney','photo illustration','https://docs.midjourney.com/hc/en-us/articles/33329261836941-Getting-Started-Guide','Geração de imagens; a adequação de estilo é editorial, sem benchmark de qualidade.');
add('ideogram','typography photo illustration','https://ideogram.ai/features/text-rendering/','Criação de imagens com foco em texto, cartazes e embalagens; revisar ortografia.');
add('firefly','photo illustration imageEdit background','https://www.adobe.com/products/firefly/features/remove-background.html','Edição de imagem carregada e remoção de fundo.');
add('firefly','photo illustration','https://www.adobe.com/products/firefly.html','Texto para imagem e edição. Condições comerciais variam por recurso/modelo.');
add('recraft','svg illustration','https://www.recraft.ai/ai-vector-generator','Gera vetores com caminhos editáveis e saída SVG.');
add('veo','video videoAudio imageVideo','https://deepmind.google/models/veo/','Geração de vídeo a partir de texto/imagem com áudio nativo. Acesso depende do produto e plano.','model');
add('runway','video imageVideo camera','https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5','Geração de vídeo e instruções de movimento; recursos dependem do modelo.');
add('consensus','science','https://help.consensus.app/en/articles/9922673-how-consensus-works','Busca literatura científica e ancora respostas em estudos.');
add('elicit','science documents','https://elicit.com/solutions/systematic-review','Revisão sistemática, triagem e extração de dados de artigos.');
add('perplexity','web','https://www.perplexity.ai/help-center/en/articles/10352155-what-is-perplexity','Pesquisa web com links para fontes; não garante revisão por pares.');
add('notebooklm','documents study','https://support.google.com/gemininotebook/answer/16215270','Importa fontes próprias, incluindo PDFs, para consulta.');
add('elevenlabs','voice','https://elevenlabs.io/docs/pt/eleven-creative/playground/text-to-speech','Converte texto em fala; não é desenvolvimento de assistente por voz.');
add('adobepodcast','audioClean','https://podcast.adobe.com/en/enhancespeech','Reduz ruído de gravações de fala. Não gera narração a partir de texto.');
add('ollama','offline code text study','https://docs.ollama.com/faq','Execução local após download, com recursos de nuvem desativados; capacidades de código/texto são condicionais ao modelo instalado.');
add('lmstudio','offline text study documents code','https://lmstudio.ai/docs/app/offline','Chat local e documentos após baixar modelos; capacidades de código/texto são condicionais ao modelo e hardware.');
add('suno','music','https://suno.com/','Geração de música por prompt.');
add('udio','music','https://www.udio.com/','Gerador de música; planos e exportação precisam de consulta.');
add('claude','code text study','https://claude.com/product/overview','Assistente para rascunhos, raciocínio e protótipos. Não equivale ao agente Claude Code.');
add('gamma','presentation','https://gamma.app/','Criação de apresentações por descrição.');
add('canva','presentation design','https://www.canva.com/presentations/','Editor visual de apresentações e peças gráficas.');
add('figma','design noCode','https://www.figma.com/ai/','Design de interfaces e protótipos; recursos variam por produto.');
const specialties={lovable:['builder','fullStack'],bolt:['builder','fullStack'],v0:['builder','fullStack'],framer:['builder','design'],ideogram:['typography'],midjourney:['photo','illustration'],recraft:['svg'],firefly:['imageEdit','background'],codex:['code','repository'],'claude-code':['code','repository'],cursor:['code','repository'],consensus:['science'],elicit:['science'],notebooklm:['documents'],perplexity:['web']};
// Demais entradas permanecem disponíveis na biblioteca, sem inventar competências.
add('descript','transcription','https://www.descript.com/transcription','Transcrição de áudio e vídeo com texto editável.');
add('descript','subtitles','https://www.descript.com/ai/translate-video','Tradução de voz e legendas; confira idiomas e limites do plano.');
add('wordpress-ai','wordpress builder noCode publish','https://wordpress.com/pt-br/support/construtor-de-sites-com-ia/','Cria site WordPress.com por descrição; publicação pública requer plano indicado pelo provedor.');
const additions=[['descript','Descript','https://www.descript.com/','audio'],['wordpress-ai','WordPress.com AI','https://wordpress.com/pt-br/construtor-de-sites-com-ia/','code'],['recraft','Recraft','https://www.recraft.ai/','image'],['claude-code','Claude Code','https://claude.com/product/claude-code','code'],['framer','Framer','https://www.framer.com/ai/','code'],['veo','Veo','https://deepmind.google/models/veo/','video']];
for(const [id,e] of Object.entries(FACTS.entries)){
 if(e.create)additions.push([id,e.create.name,e.create.url,e.create.task,e.create]);
 for(const [key,[url,note]] of Object.entries(e.capabilities||{}))add(id,key,url,note,e.create?.kind||profiles[id]?.kind||'app',FACTS.REVIEWED,'indexed');
 if(e.specialties)specialties[id]=[...new Set([...(specialties[id]||[]),...e.specialties])];
}
function enrich(tools){
 for(const [id,name,url,category,meta={}] of additions)if(!tools.some(t=>t.id===id)){const e=FACTS.entries[id]||{};tools.push({id,name,owner:meta.owner||name,initial:name[0],colors:['#8974ff','#328c92'],url,source:url,ranks:{[category]:1},best:{[category]:e.description||'Consulte as competências verificadas.'},pros:[e.description||'Finalidade documentada em fonte oficial'],cons:[...(e.limitations||[]),'Confira plano, região, créditos e condições no serviço.'],access:'unknown',platforms:[...(meta.platforms||[])],offline:!!meta.offline,productType:meta.productType||'não verificado',account:'não verificado',integration:'link externo',tasks:[category]});}
 for(const t of tools){const p=profiles[t.id];t.specialties=specialties[t.id]||[];t.schemaVersion=4;t.kind=p?.kind||'app';t.capabilities=Object.fromEntries(Object.keys(labels).map(k=>[k,p?.capabilities[k]||{status:'unknown',source:null,reviewedAt:null,note:'Não verificado; não significa ausência do recurso.'}]));
 const e=FACTS.entries[t.id]||{};
 t.freeCapabilities=[...new Set([...(({lovable:['builder','noCode','fullStack','publish'],suno:['music'],adobepodcast:['audioClean'],gamma:['presentation']})[t.id]||[]),...(e.free||[])])];
 if(e.access)t.access=e.access;else if(e.plan&&['free','freemium','paid'].includes(e.plan.status)&&t.access==='unknown')t.access=e.plan.status;
 t.accessDetails={app:{status:t.access,source:t.reviewedAt?t.source:null,reviewedAt:t.reviewedAt||null},api:{status:'unknown',source:null,reviewedAt:null}};
 if(e.plan)t.accessDetails.app={status:e.plan.status,source:e.plan.source,reviewedAt:FACTS.REVIEWED,note:e.plan.note};
 if(e.api)t.accessDetails.api={status:e.api.status,source:e.api.source,reviewedAt:FACTS.REVIEWED,note:e.api.note};
 t.facts={description:e.description||Object.values(t.best)[0]||'',technicalLevel:FACTS.technical[t.id]||'não avaliado',technicalBasis:'editorial',limitations:e.limitations||[],openSource:e.openSource??null,local:e.local??(t.offline||null),unsupportedLanguages:e.unsupportedLanguages||[],languages:e.languages||[],languageSource:e.languageSource||null};
 if(e.rename)t.name=e.rename;
 if(t.id==='lovable'){t.access='freemium';t.accessDetails.app={status:'freemium',source:'https://lovable.dev/pricing',reviewedAt:'2026-10-24'};}
 if(t.id==='framer'){t.capabilities.staticHTML.note='Duas páginas oficiais divergem sobre exportação HTML; mantido desconhecido.';t.capabilities.staticHTML.sources=['https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/','https://www.framer.com/help/articles/porting-your-data-from-framer/'];}
 if(t.id==='suno'||t.id==='adobepodcast'){t.access='freemium';t.accessDetails.app={status:'freemium',source:t.id==='suno'?'https://suno.com/':'https://podcast.adobe.com/en/enhancespeech',reviewedAt:'2026-10-24'};}
 if(['lovable','bolt','v0','framer','recraft','midjourney','ideogram','firefly','chatgpt','claude','runway','consensus','elicit','perplexity','notebooklm','elevenlabs','adobepodcast','gamma','canva','figma','suno','udio'].includes(t.id)&&!t.platforms.includes('web'))t.platforms.push('web');
 if(p){const dates=Object.values(p.capabilities).map(c=>c.reviewedAt).sort();t.reviewedAt=dates.at(-1);t.source=Object.values(p.capabilities)[0].source;t.availability='Competências descritas nas fontes; plano e API devem ser consultados separadamente.';}
 }
 return tools;
}
function audit(tools){const errors=[],seen=new Set();for(const t of tools){if(seen.has(t.id))errors.push(t.id+': ID duplicado');seen.add(t.id);if(!/^[a-z0-9-]+$/.test(t.id)||!t.name||!/^https:\/\//.test(t.url))errors.push(t.id+': identidade/URL');if(t.schemaVersion!==4)errors.push(t.id+': schema');if(!['app','model','agent'].includes(t.kind))errors.push(t.id+': kind');for(const k of Object.keys(labels))if(!t.capabilities?.[k])errors.push(t.id+': competência ausente '+k);
 for(const [k,c] of Object.entries(t.capabilities||{})){if(!labels[k]||!['supported','unsupported','unknown'].includes(c.status))errors.push(t.id+': competência inválida '+k);if(c.status!=='unknown'&&(!/^https:\/\/[^@\s]+$/.test(c.source||'')||!Number.isFinite(Date.parse(c.reviewedAt))||c.reviewedAt>FACTS.REVIEWED))errors.push(t.id+': fonte/data ausente '+k);}
 }return {schemaVersion:4,tools:tools.length,errors,coverage:Object.fromEntries(Object.keys(labels).map(k=>[k,tools.filter(t=>t.capabilities?.[k]?.status==='supported').map(t=>t.id)]))};}
return {enrich,labels,audit,facts:FACTS};
});