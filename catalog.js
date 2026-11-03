(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusCatalog=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const raw=[
    { id: 'claude', name: 'Claude', owner: 'Anthropic', url: 'https://claude.ai/', initial: 'C', colors: ['#cb9777','#a96455'], ranks: {code: 99, text: 98, study: 91, all: 96},
      best: {code:'Desenvolver interfaces, estruturar páginas e revisar código.', text:'Reescrever e organizar conteúdos longos.', study:'Explicar conceitos e trabalhar com textos.'},
      pros: ['Ajuda a planejar e melhorar código', 'Bom para organizar requisitos e textos', 'Pode colaborar em várias versões de um projeto'],
      cons: ['A resposta pode conter erros: teste sempre o código', 'Recursos e limites variam conforme o plano'] },
    { id: 'chatgpt', name: 'ChatGPT', owner: 'OpenAI', url: 'https://chatgpt.com/', initial: 'G', colors: ['#65c9b2','#267968'], ranks: {code: 97, image: 90, study: 97, text: 96, all: 99},
      best: {code:'Explicar HTML, CSS e JavaScript passo a passo.', image:'Criar e ajustar ideias visuais conforme os recursos da conta.', study:'Tirar dúvidas e montar exercícios.', text:'Criar, revisar e adaptar textos.'},
      pros: ['Útil para aprender enquanto programa', 'Ajuda a identificar erros de lógica e sintaxe', 'Abrange muitas tarefas diferentes'],
      cons: ['Nem todos os modelos e recursos estão disponíveis em todos os planos', 'É necessário conferir informações e testar resultados'] },
    { id: 'gemini', name: 'Gemini', owner: 'Google', url: 'https://gemini.google.com/', initial: 'G', colors: ['#85a0ff','#655ab8'], ranks: {code: 93, study: 95, text: 93, all: 95},
      best: {code:'Criar alternativas de implementação e organizar arquivos.', study:'Revisar assuntos e sugerir formas de estudar.', text:'Planejar e aprimorar conteúdos.'},
      pros: ['Ajuda a explorar diferentes soluções', 'Pode apoiar o planejamento e a escrita', 'Disponibiliza recursos de criação conforme o plano'],
      cons: ['A disponibilidade de recursos varia por região e conta', 'Sugestões técnicas também precisam ser validadas'] },
    { id: 'firefly', name: 'Adobe Firefly', owner: 'Adobe', url: 'https://firefly.adobe.com/', initial: 'F', colors: ['#f5a64f','#d66560'], ranks: {image: 99},
      best: {image:'Gerar e editar artes, cenários e conteúdos visuais.'},
      pros: ['Ferramentas voltadas a criação visual', 'Permite explorar diferentes estilos e composições', 'Boa alternativa para trabalhos gráficos'],
      cons: ['Créditos e recursos podem ser limitados', 'O resultado depende da descrição e de ajustes'] },
    { id: 'ideogram', name: 'Ideogram', owner: 'Ideogram', url: 'https://ideogram.ai/', initial: 'I', colors: ['#ec79bb','#914e9f'], ranks: {image: 97},
      best: {image:'Criar cartazes, conceitos de marcas e imagens com texto.'},
      pros: ['Interessante para projetos gráficos', 'Opção para testar composição e tipografia', 'Permite explorar conceitos visuais'],
      cons: ['Plano gratuito e recursos podem ter restrições', 'Textos e detalhes ainda exigem revisão'] },
    { id: 'leonardo', name: 'Leonardo AI', owner: 'Leonardo', url: 'https://leonardo.ai/', initial: 'L', colors: ['#8b7cff','#3f50a5'], ranks: {image: 94},
      best: {image:'Produzir conceitos, ilustrações e variações de imagens.'},
      pros: ['Voltado a criação de imagens', 'Permite experimentar estilos', 'Útil para protótipos visuais'],
      cons: ['Recursos e créditos podem mudar por plano', 'Pode exigir várias tentativas'] },
    { id: 'runway', name: 'Runway', owner: 'Runway', url: 'https://runwayml.com/', initial: 'R', colors: ['#5bf1c7','#138b87'], ranks: {video: 99},
      best: {video:'Gerar cenas e experimentar edição de vídeo com IA.'},
      pros: ['Especializado em produção audiovisual', 'Oferece ferramentas de vídeo e criação', 'Bom para testar ideias de cenas'],
      cons: ['Geração costuma consumir créditos', 'Assinatura do site não equivale a créditos da API'] },
    { id: 'kling', name: 'Kling AI', owner: 'Kling', url: 'https://klingai.com/', initial: 'K', colors: ['#59baff','#5561b3'], ranks: {video: 97},
      best: {video:'Explorar vídeos gerados a partir de descrições e imagens.'},
      pros: ['Ferramenta focada em vídeo', 'Pode criar diferentes movimentos e cenas', 'Alternativa útil para comparação'],
      cons: ['Recursos e filas podem variar de acordo com o plano', 'Pode demandar ajustes no prompt'] },
    { id: 'pika', name: 'Pika', owner: 'Pika', url: 'https://pika.art/', initial: 'P', colors: ['#e49bff','#9052b7'], ranks: {video: 95},
      best: {video:'Experimentar vídeos curtos, efeitos e ideias criativas.'},
      pros: ['Foco em efeitos e criação audiovisual', 'Interessante para testar conceitos rápidos', 'Oferece opções criativas para vídeo'],
      cons: ['Disponibilidade e limites dependem do plano', 'Pode não ser a melhor opção para vídeos longos'] },
    { id: 'notebooklm', name: 'NotebookLM', owner: 'Google', url: 'https://notebooklm.google.com/', initial: 'N', colors: ['#77b3ff','#3769c1'], ranks: {study: 99},
      best: {study:'Estudar com materiais e fontes que você fornece.'},
      pros: ['Foco em materiais do próprio usuário', 'Ajuda a organizar conteúdo e perguntas', 'Útil para revisar conteúdos específicos'],
      cons: ['Depende de materiais adequados para obter bons resultados', 'Limites de recursos variam por conta'] },
    { id: 'perplexity', name: 'Perplexity', owner: 'Perplexity', url: 'https://www.perplexity.ai/', initial: 'P', colors: ['#65d8d5','#3b919b'], ranks: {study: 93, text: 92},
      best: {study:'Pesquisar assuntos e consultar fontes na web.', text:'Levantar informações para elaborar conteúdos.'},
      pros: ['Orienta pesquisas com links de fontes', 'Pode acelerar a busca por informações', 'Útil para comparar referências'],
      cons: ['Fontes podem ser fracas ou irrelevantes', 'Sempre confira os materiais citados'] },
    { id: 'elevenlabs', name: 'ElevenLabs', owner: 'ElevenLabs', url: 'https://elevenlabs.io/', initial: 'E', colors: ['#9db2c7','#56687c'], ranks: {audio: 99},
      best: {audio:'Criar narrações e experimentar síntese de voz.'},
      pros: ['Especializado em voz e áudio', 'Útil para narrar vídeos e apresentações', 'Várias opções de vozes e estilos'],
      cons: ['Limites dependem do plano', 'Uso de vozes deve respeitar consentimento e direitos'] },
    { id: 'suno', name: 'Suno', owner: 'Suno', url: 'https://suno.com/', initial: 'S', colors: ['#ecb271','#af596d'], ranks: {audio: 97},
      best: {audio:'Criar músicas e experimentar ideias de trilha sonora.'},
      pros: ['Foco na geração musical', 'Permite testar ideias de estilos musicais', 'Útil para projetos criativos'],
      cons: ['Direitos de uso e recursos mudam conforme o plano', 'Pode precisar de diferentes versões'] },
    { id: 'udio', name: 'Udio', owner: 'Udio', url: 'https://www.udio.com/', initial: 'U', colors: ['#ff8da1','#954ac7'], ranks: {audio: 94},
      best: {audio:'Explorar composições e conceitos musicais.'},
      pros: ['Foco em música gerada por IA', 'Alternativa para experimentar estilos', 'Inspira protótipos de trilhas'],
      cons: ['Recursos e disponibilidade podem mudar', 'Verifique as regras de distribuição e direitos'] },
    // Curadoria adicional — links para páginas oficiais; planos não são verificados automaticamente.
    {id:'codex',name:'Codex',owner:'OpenAI',url:'https://openai.com/codex/',initial:'X',colors:['#5edac6','#2a817a'],ranks:{code:96},best:{code:'Escrever, revisar e modificar código em projetos de software.'},pros:['Focado no desenvolvimento de software','Trabalha com projetos e tarefas de programação','Útil para revisão e alterações de código'],cons:['Depende de acesso, configuração e limites da conta','Alterações precisam de revisão e testes']},
    {id:'cursor',name:'Cursor',owner:'Anysphere',url:'https://cursor.com/',initial:'C',colors:['#b7b6fa','#625dbc'],ranks:{code:94},best:{code:'Editar projetos e corrigir erros diretamente em um ambiente de desenvolvimento.'},pros:['Agente que trabalha com arquivos do projeto','Integra edição e revisão de código','Bom para mudanças em vários arquivos'],cons:['Exige ambiente/editor próprio','Recursos e limites variam conforme o plano']},
    {id:'copilot',name:'GitHub Copilot',owner:'GitHub',url:'https://github.com/features/copilot',initial:'G',colors:['#85a8ff','#4f56ab'],ranks:{code:92},best:{code:'Auxiliar a escrever e revisar código durante o desenvolvimento.'},pros:['Integra-se ao fluxo de programação','Ajuda com sugestões e explicações de código','Pode apoiar depuração'],cons:['Disponibilidade e limites variam por plano','Sugestões devem ser verificadas no projeto']},
    {id:'replit',name:'Replit Agent',owner:'Replit',url:'https://replit.com/products/agent',initial:'R',colors:['#ffa76b','#c15b57'],ranks:{code:91},best:{code:'Criar e testar aplicativos e sites em ambiente online.'},pros:['Ajuda a construir projetos a partir de uma descrição','Reúne editor, execução e publicação','Pode apoiar protótipos completos'],cons:['Uso e publicação podem ter custos ou limites','Confira o código e a configuração de segurança']},
    {id:'lovable',name:'Lovable',owner:'Lovable',url:'https://lovable.dev/',initial:'L',colors:['#e49cdd','#a45ab4'],ranks:{code:88},best:{code:'Montar sites e aplicativos web com interface visual a partir de instruções.'},pros:['Focado em criação de aplicações web','Permite refinar por conversa','Útil para prototipar páginas e fluxos'],cons:['Créditos e publicação dependem do plano','O código gerado precisa ser testado']},
    {id:'v0',name:'v0',owner:'Vercel',url:'https://v0.app/',initial:'v',colors:['#d4d9eb','#7f8fa9'],ranks:{code:89},best:{code:'Criar interfaces e aplicativos web a partir de prompts.'},pros:['Foco em interfaces e aplicações web','Permite visualizar e ajustar telas','Pode publicar projetos'],cons:['Créditos e recursos variam por conta','A implementação deve ser revisada']},
    {id:'bolt',name:'Bolt.new',owner:'StackBlitz',url:'https://bolt.new/',initial:'B',colors:['#9ee884','#3788a3'],ranks:{code:87},best:{code:'Prototipar aplicativos web usando instruções e um ambiente integrado.'},pros:['Combina geração de código e visualização','Adequado a protótipos web','Permite iterar sobre recursos'],cons:['Capacidade e limites podem variar','Projetos complexos exigem validação técnica']},
    {id:'deepseek',name:'DeepSeek',owner:'DeepSeek',url:'https://chat.deepseek.com/',initial:'D',colors:['#78a5ff','#3b63b4'],ranks:{code:90,text:86,study:85,all:87},best:{code:'Pedir explicações e sugestões de implementação de código.',text:'Revisar e estruturar conteúdo.',study:'Explorar explicações e dúvidas.'},pros:['Assistente de texto e código','Útil como alternativa para comparar soluções','Ajuda no planejamento'],cons:['Disponibilidade pode mudar','Revise qualquer resposta e informação fornecida']},
    {id:'qwen',name:'Qwen Chat',owner:'Alibaba',url:'https://chat.qwen.ai/',initial:'Q',colors:['#b18aff','#6263b2'],ranks:{code:89,study:87,text:88,all:88},best:{code:'Explorar ideias técnicas e explicações de código.',study:'Apoiar explicações e revisões.',text:'Criar e revisar textos.'},pros:['Assistente para diferentes tarefas','Pode ajudar com código e escrita','Alternativa para obter outra abordagem'],cons:['Disponibilidade e funções variam','Necessário conferir respostas']},
    {id:'mistral',name:'Le Chat',owner:'Mistral AI',url:'https://chat.mistral.ai/',initial:'M',colors:['#ffbc7a','#d56a55'],ranks:{code:86,text:90,study:88,all:88},best:{code:'Explicar e esboçar soluções técnicas.',text:'Apoiar redação e organização de conteúdo.',study:'Responder dúvidas e ajudar a revisar.'},pros:['Assistente conversacional versátil','Útil para textos e planejamento','Fornece opção de comparação'],cons:['Recursos e planos podem mudar','Fatos e código requerem verificação']},
    {id:'midjourney',name:'Midjourney',owner:'Midjourney',url:'https://www.midjourney.com/',initial:'M',colors:['#f0c57f','#8376bd'],ranks:{image:97},best:{image:'Criar imagens estilizadas a partir de descrições e referências.'},pros:['Foco em geração visual','Permite explorar estilos e referências','Boa alternativa para arte conceitual'],cons:['O acesso pode depender de assinatura','Resultados variam conforme o prompt']},
    {id:'canva',name:'Canva Magic Studio',owner:'Canva',url:'https://www.canva.com/magic-studio/',initial:'C',colors:['#5fe2e2','#726de2'],ranks:{image:91,text:80},best:{image:'Criar peças gráficas e editar designs em modelos.',text:'Organizar e adaptar textos para peças visuais.'},pros:['Combina editor visual e recursos inteligentes','Útil para apresentações e cartazes','Permite personalizar os designs'],cons:['Nem todos os recursos são gratuitos','Qualidade e direitos de uso devem ser conferidos']},
    {id:'freepik',name:'Freepik AI',owner:'Freepik',url:'https://www.freepik.com/ai',initial:'F',colors:['#f5ac72','#5a72d2'],ranks:{image:93},best:{image:'Gerar e editar recursos visuais para apresentações e designs.'},pros:['Plataforma voltada a recursos visuais','Oferece ferramentas de criação e edição','Útil para explorar estilos'],cons:['Créditos, licenças e modelos variam por plano','Verifique direitos de uso']},
    {id:'luma',name:'Luma Dream Machine',owner:'Luma AI',url:'https://lumalabs.ai/dream-machine',initial:'L',colors:['#ddc4fb','#8a6fc8'],ranks:{video:94},best:{video:'Experimentar vídeos e sequências visuais geradas com IA.'},pros:['Foco em criação de vídeos','Útil para movimentos e cenas','Alternativa para comparar resultados audiovisuais'],cons:['Geração pode exigir créditos','Limites e modelos mudam por plano']},
    {id:'consensus',name:'Consensus',owner:'Consensus',url:'https://consensus.app/',initial:'C',colors:['#72d7ae','#358d87'],ranks:{study:94,text:87},best:{study:'Pesquisar perguntas com base em literatura científica.',text:'Localizar pesquisas para fundamentar textos.'},pros:['Voltado à pesquisa científica','Ajuda a explorar estudos e evidências','Útil para trabalhos que exigem fontes'],cons:['Não substitui a leitura dos estudos originais','Cobertura e limites dependem do serviço']},
    {id:'elicit',name:'Elicit',owner:'Elicit',url:'https://elicit.com/',initial:'E',colors:['#c1b4ff','#7766bd'],ranks:{study:92,text:84},best:{study:'Buscar, organizar e comparar artigos científicos.',text:'Apoiar revisão de literatura e investigação.'},pros:['Focado em pesquisa acadêmica','Ajuda a organizar referências','Útil em revisões de literatura'],cons:['A cobertura de artigos pode ser incompleta','Verifique fontes e dados nos originais']},
    {id:'adobepodcast',name:'Adobe Podcast Enhance',owner:'Adobe',url:'https://podcast.adobe.com/enhance',initial:'A',colors:['#ff8989','#bb545c'],ranks:{audio:92},best:{audio:'Limpar gravações de fala e melhorar a clareza de áudio gravado.'},pros:['Especializado em melhorar gravações','Útil para entrevistas e podcasts','Foco na qualidade do som'],cons:['Não é um gerador universal de música ou voz','Limites e formatos dependem do plano']},
  ];
const additions=[
  {
    "id": "gamma",
    "name": "Gamma",
    "owner": "Gamma",
    "url": "https://gamma.app/",
    "ranks": {
      "presentation": 99,
      "design": 78,
      "text": 75
    },
    "best": {
      "presentation": "Criar apresentações editáveis a partir de uma ideia ou roteiro."
    },
    "pros": [
      "Criação e edição de apresentações",
      "Também organiza documentos e páginas"
    ],
    "cons": [
      "Créditos gratuitos são limitados",
      "Revise fatos e layout antes de apresentar"
    ],
    "access": "freemium",
    "source": "https://gamma.app/",
    "platforms": [
      "web"
    ],
    "productType": "plataforma"
  },
  {
    "id": "figma",
    "name": "Figma Make",
    "owner": "Figma",
    "url": "https://www.figma.com/make/",
    "ranks": {
      "design": 99,
      "code": 80
    },
    "best": {
      "design": "Prototipar interfaces interativas a partir de descrições."
    },
    "pros": [
      "Protótipos editáveis e interativos",
      "Ajuda a explorar layouts e fluxos"
    ],
    "cons": [
      "Não substitui a validação com usuários",
      "Condições de acesso à IA devem ser verificadas"
    ],
    "source": "https://www.figma.com/solutions/ai-prototype-generator/",
    "platforms": [
      "web"
    ],
    "productType": "prototipagem"
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "owner": "Ollama",
    "url": "https://ollama.com/",
    "ranks": {
      "code": 77,
      "text": 75,
      "study": 70,
      "all": 70
    },
    "best": {
      "code": "Executar modelos locais para apoiar tarefas de código.",
      "text": "Conversar com um modelo baixado no próprio computador.",
      "study": "Explorar explicações usando modelos locais."
    },
    "pros": [
      "Pode operar apenas localmente",
      "Executa modelos sem chave de API no modo local"
    ],
    "cons": [
      "Exige download de modelo e hardware compatível",
      "Capacidade e licença dependem do modelo; desative nuvem para uso estritamente local"
    ],
    "source": "https://docs.ollama.com/faq",
    "platforms": [
      "desktop"
    ],
    "offline": true,
    "productType": "runtime local"
  },
  {
    "id": "lmstudio",
    "name": "LM Studio",
    "owner": "LM Studio",
    "url": "https://lmstudio.ai/",
    "ranks": {
      "code": 78,
      "text": 78,
      "study": 78,
      "all": 71
    },
    "best": {
      "code": "Usar um modelo local para discutir e revisar código.",
      "text": "Conversar com modelos locais em interface gráfica.",
      "study": "Consultar documentos com modelos locais."
    },
    "pros": [
      "Chat e documentos podem funcionar offline",
      "Interface para baixar e executar modelos"
    ],
    "cons": [
      "Baixe modelos antes de usar offline",
      "Desempenho e licença dependem do modelo e do hardware"
    ],
    "source": "https://lmstudio.ai/docs/app/offline",
    "platforms": [
      "desktop"
    ],
    "offline": true,
    "productType": "ferramenta local"
  }
];
const tools=raw.concat(additions).map(t=>({initial:t.name[0],colors:['#8f8bff','#387e99'],access:'unknown',account:'não verificado',platforms:[],offline:false,productType:'não verificado',integration:'link externo',reviewedAt:null,source:t.url,availability:'Entrada legada; funcionalidades e planos não revalidados nesta versão.',...t,...(additions.includes(t)?{reviewedAt:'2026-10-22',availability:'Finalidade verificada em fonte oficial; disponibilidade pode mudar.'}:{}),tasks:Object.keys(t.ranks).filter(k=>k!=='all')}));
const canva=tools.find(t=>t.id==='canva');canva.ranks.presentation=94;canva.ranks.design=88;canva.best.presentation='Organizar apresentações com o editor visual.';canva.best.design='Compor layouts e peças gráficas.';canva.tasks.push('presentation','design');
const labels={unknown:'Não verificado',free:'Grátis',freemium:'Freemium',trial:'Teste temporário',paid:'Pago'};
function safeURL(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch(_){return null;}}
function validate(items){const seen=new Set();return items.filter(t=>t&&typeof t.id==='string'&&/^[a-z0-9-]+$/.test(t.id)&&safeURL(t.url)&&t.ranks&&t.best&&Array.isArray(t.pros)&&Array.isArray(t.cons)&&!seen.has(t.id)&&seen.add(t.id));}
function catalogFilter(tools,o={}){
 const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const aliases={programacao:'code',codigo:'code',imagem:'image',video:'video',audio:'audio',estudo:'study',slides:'presentation',apresentacao:'presentation',pesquisa:'study'};
 const terms=norm(o.query).split(/\s+/).filter(Boolean);
 return tools.filter(t=>{
 if(o.category&&o.category!=='all'&&!Object.hasOwn(t.ranks,o.category==='research'?'study':o.category))return false;
 if(o.access&&o.access!=='any'&&t.access!==o.access)return false;
 if(o.offline&&!t.offline)return false;
 if(o.api&&t.accessDetails?.api?.status!=='supported')return false;
 if(o.openSource&&!t.facts?.openSource)return false;
 if(o.local&&!t.facts?.local)return false;
 if(o.freePlan&&!['free','freemium'].includes(t.accessDetails?.app?.status))return false;
 const supported=Object.entries(t.capabilities||{}).filter(([,c])=>c.status==='supported').map(([k])=>(capabilities.labels[k]||k)+' '+k);
 const text=norm([t.name,t.owner,...t.pros,...t.cons,...Object.keys(t.ranks),...Object.values(t.best),t.offline?'offline':'',t.facts?.description||'',...supported].join(' '));
 return terms.every(term=>text.includes(term)||(aliases[term]&&text.includes(aliases[term])));
 }).sort((a,b)=>o.sort==='reviewed'?String(b.reviewedAt||'').localeCompare(String(a.reviewedAt||''))||a.name.localeCompare(b.name):a.name.localeCompare(b.name));
}
const capabilities=typeof module!=='undefined'&&module.exports?require('./capabilities.js'):globalThis.NexusCapabilities;
capabilities.enrich(tools);
return {filter:catalogFilter,tools:validate(tools),accessLabels:labels,safeURL,validate,capabilityLabels:capabilities.labels,audit:()=>capabilities.audit(tools)};});