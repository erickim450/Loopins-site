/* Loopins 5.0 — fatos voláteis do catálogo em um único lugar.
 *
 * Este arquivo concentra o que muda com frequência: planos, API, nível técnico,
 * formatos, limitações e as competências acrescentadas em 2026-10-29.
 * capabilities.js aplica estes dados sobre o catálogo legado (catalog.js).
 *
 * Evidência:
 *  - "direct": página oficial lida diretamente na curadoria de 2026-10-24.
 *  - "indexed": página oficial localizada por busca indexada em 2026-10-29;
 *    nesta sessão o acesso direto às páginas estava bloqueado pela rede, então
 *    o conteúdo foi conferido pelo resumo do mecanismo de busca. É evidência mais
 *    fraca e recebe menos peso no critério "qualidade da evidência".
 * Nada aqui é preço. Planos registram apenas a existência de acesso gratuito
 * quando a fonte oficial a descreve, sempre com nota de escopo.
 */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusCatalogFacts=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const REVIEWED='2026-10-29';
// Curadoria 5.8 (56 ferramentas novas): cada entrada nova traz reviewed:V58.
const V58='2026-11-03';

// Competências novas (somadas às de capabilities.js).
const newLabels={
  automation:'Automação entre aplicativos',
  agentBuilder:'Criação de agentes de IA',
  chatbot:'Chatbot de atendimento',
  dataAnalysis:'Análise de dados',
  spreadsheet:'Planilhas',
  game:'Criação de jogos',
  screenRecord:'Gravação de tela',
  videoEdit:'Edição de vídeo existente',
  captions:'Legendas automáticas',
  diagram:'Diagramas e infográficos',
  tutoring:'Tutoria guiada',
  workspace:'Notas e documentos de equipe',
  resume:'Currículo e carta de apresentação',
  translation:'Tradução de textos e documentos',
  proofread:'Correção gramatical e reescrita',
  math:'Matemática passo a passo',
  avatarVideo:'Vídeo com apresentador virtual',
  model3d:'Modelo 3D',
  stems:'Separar voz e instrumentos',
  languageLearning:'Aprender idiomas',
  shortClips:'Cortes curtos de vídeos longos'
};

// Nível técnico: decisão editorial documentada (não é medição).
// nenhum = conversa em linguagem natural; baixo = editor visual/web;
// medio = configuração de contas, integrações ou editor; alto = terminal, IDE ou instalação local.
const technical={
  claude:'nenhum',chatgpt:'nenhum',gemini:'nenhum',perplexity:'nenhum',notebooklm:'nenhum',deepseek:'nenhum',qwen:'nenhum',mistral:'nenhum',consensus:'nenhum',elicit:'baixo',
  firefly:'baixo',ideogram:'baixo',leonardo:'baixo',midjourney:'baixo',recraft:'baixo',canva:'baixo',freepik:'baixo',
  runway:'baixo',kling:'baixo',pika:'baixo',luma:'baixo',veo:'baixo',
  elevenlabs:'baixo',suno:'baixo',udio:'baixo',adobepodcast:'nenhum',descript:'baixo',
  lovable:'baixo',bolt:'baixo',v0:'baixo',framer:'baixo','wordpress-ai':'baixo',replit:'baixo',figma:'baixo',gamma:'baixo',
  codex:'alto','claude-code':'alto',cursor:'alto',copilot:'alto',windsurf:'alto',
  ollama:'alto',lmstudio:'medio',whisper:'alto',
  zapier:'medio',make:'medio',n8n:'alto',voiceflow:'medio',botpress:'medio',
  julius:'nenhum','excel-copilot':'baixo',otter:'nenhum',loom:'baixo',clipchamp:'baixo',napkin:'nenhum',
  rosebud:'baixo',khanmigo:'nenhum','notion-ai':'baixo',capcut:'baixo',kickresume:'nenhum',deepl:'nenhum',grammarly:'nenhum',quillbot:'nenhum',photomath:'nenhum',wolframalpha:'baixo',synthesia:'baixo',heygen:'baixo',meshy:'baixo',photoroom:'nenhum','ms-copilot':'nenhum',grok:'nenhum',murf:'baixo'
};

/* Entradas:
 *  create: dados de identidade para ferramentas novas.
 *  capabilities: {competência:[fonte, nota]} — todas com evidência "indexed".
 *  free: competências cujo uso gratuito a fonte descreve (com nota em plan).
 *  plan / api: {status, note, source}. status: free | freemium | paid | unknown.
 *  limitations: limites documentados relevantes para a decisão.
 *  unsupportedLanguages: idiomas documentados como NÃO suportados.
 */
const entries={
 // ── Entradas já existentes, antes sem nenhuma competência confirmada ──
 gemini:{
  description:'Assistente do Google para conversa, pesquisa, escrita e criação/edição de imagens.',
  capabilities:{
   text:['https://gemini.google/subscriptions/','Assistente de uso geral nos planos do Google.'],
   study:['https://support.google.com/gemini/answer/15719111','Deep Research cria relatórios a partir da web e de arquivos enviados.'],
   web:['https://support.google.com/gemini/answer/15719111','Deep Research usa a Pesquisa Google como fonte padrão.'],
   documents:['https://support.google.com/gemini/answer/15719111','Aceita arquivos enviados pelo usuário em Deep Research e Canvas.'],
   code:['https://support.google.com/gemini/answer/16047321','Canvas cria documentos e aplicativos simples com prévia.'],
   photo:['https://gemini.google/overview/image-generation/','Geração de imagens com o modelo Nano Banana 2.'],
   illustration:['https://gemini.google/overview/image-generation/','Geração de imagens por descrição.'],
   imageEdit:['https://blog.google/products-and-platforms/products/gemini/updated-image-editing-model/','Edição de imagem enviada: trocar fundo, substituir ou acrescentar elementos.']
  },
  free:['text','study','photo','illustration','imageEdit'],
  plan:{status:'freemium',note:'Página oficial descreve o modelo de imagem Nano Banana 2 como gratuito no app; Deep Research e modelos maiores têm mais acesso nos planos pagos.',source:'https://gemini.google/overview/image-generation/'},
  api:{status:'supported',note:'Gemini API e Google AI Studio são produtos separados do app; o plano do app não fornece créditos de API.',source:'https://ai.google.dev/gemini-api/docs/api-overview'},
  limitations:['Imagens geradas recebem marca d’água visível e SynthID.','Limites e recursos variam por plano e país.']
 },
 copilot:{
  description:'Assistente de programação do GitHub com modo agente em editores e CLI.',
  capabilities:{
   code:['https://github.com/features/copilot/plans','Sugestões, chat e modo agente em VS Code, Visual Studio, JetBrains e outros.'],
   repository:['https://github.com/features/copilot/plans','Modo agente edita arquivos do projeto no editor; o agente na nuvem que abre pull requests não faz parte do plano Free.']
  },
  specialties:['code','repository'],
  free:['code','repository'],
  plan:{status:'freemium',note:'Plano Free inclui modo agente e CLI com cota limitada de créditos; agente na nuvem que cria pull requests exige plano pago.',source:'https://github.com/features/copilot/plans'},
  limitations:['Uso medido em créditos de IA desde a cobrança por uso.','Requer editor compatível e conta GitHub.']
 },
 replit:{
  description:'Ambiente online em que um agente cria, testa e publica aplicativos completos a partir de uma descrição.',
  capabilities:{
   builder:['https://replit.com/usecases/ai-app-builder','Agente cria frontend, backend e banco de dados a partir do pedido.'],
   noCode:['https://replit.com/usecases/ai-app-builder','Página oficial descreve criação de apps sem programar.'],
   fullStack:['https://replit.com/build/database-app-builder','Banco de dados integrado e esquema definido pelo agente.'],
   codeExport:['https://replit.com/usecases/ai-app-builder','O código fica no workspace e pode ser editado.'],
   publish:['https://replit.com/build/web-app-builder','Implantação na nuvem com domínio e HTTPS.']
  },
  specialties:['fullStack'],
  plan:{status:'unknown',note:'Página da própria Replit cita plano Starter gratuito com um projeto publicado; não verificamos o escopo atual.',source:'https://replit.com/discover/best-ai-app-builder'},
  limitations:['Publicação e uso intenso podem consumir créditos.','Revise segurança e configuração antes de publicar.']
 },
 kling:{
  description:'Gerador de vídeo por texto ou imagem, com modelos que incluem áudio nativo.',
  capabilities:{
   video:['https://app.klingai.com/global/quickstart/image-to-video-guide','Texto para vídeo e imagem para vídeo.'],
   imageVideo:['https://app.klingai.com/global/quickstart/image-to-video-guide','Anima uma imagem fixa com prompt de movimento.'],
   videoAudio:['https://app.klingai.com/global/blog/kling-video-3-0-ai-director-features-guide','Kling 3.0 descrito com áudio nativo e sincronia labial; storyboard com vários planos (não confirmamos controle de câmera).'],
  },
  api:{status:'supported',note:'API para desenvolvedores cobrada por segundo de vídeo.',source:'https://klingai.com/global/dev/model/video'},
  limitations:['Clipes curtos (o fornecedor cita até 15 s).','Geração consome créditos.']
 },
 luma:{
  description:'Dream Machine, gerador de vídeo da Luma AI (modelos Ray).',
  capabilities:{
   video:['https://lumalabs.ai/create/ai-video-generator','Texto para vídeo e imagem para vídeo.'],
   imageVideo:['https://lumalabs.ai/create/ai-video-generator-from-image','Anima foto, ilustração ou render com descrição do movimento.']
  },
  api:{status:'supported',note:'API de geração de vídeo documentada.',source:'https://docs.lumalabs.ai/docs/video-generation'},
  limitations:['Ray3.2 imagem-para-vídeo não gera som nativo; áudio é etapa separada.','Clipes de 5 ou 10 segundos.']
 },
 pika:{
  description:'Gerador de vídeos curtos e efeitos por texto ou imagem.',
  capabilities:{
   video:['https://dev.pika.art/models/pika/pika-2.5/image-to-video','Texto para vídeo e imagem para vídeo em até 1080p.'],
   imageVideo:['https://dev.pika.art/models/pika/pika-2.5/image-to-video','Requer imagem de origem e prompt de movimento opcional.']
  },
  api:{status:'supported',note:'API de modelos documentada em dev.pika.art.',source:'https://dev.pika.art/models'},
  limitations:['Duração padrão de 5 segundos no texto-para-vídeo.']
 },
 leonardo:{
  description:'Plataforma de geração e edição de imagens com canvas e vários modelos.',
  capabilities:{
   photo:['https://leonardo.ai/ai-photography','Geração de imagens realistas.'],
   illustration:['https://faq.leonardo.ai/imagegentool/ai-image-gen-tool','Geração de imagens com escolha de modelo e estilo.'],
   imageEdit:['https://leonardo.ai/ai-image-editor','Remover ou substituir objetos, ajustar fundo, redimensionar e ampliar.'],
   background:['https://leonardo.ai/ai-image-editor','Ajustar ou remover fundo.']
  },
  api:{status:'supported',note:'API documentada em docs.leonardo.ai.',source:'https://docs.leonardo.ai/docs/generate-images-using-canvas-inpainting'},
  limitations:['Recursos variam por modelo escolhido.']
 },
 // ── Ferramentas novas ──
 windsurf:{
  create:{name:'Windsurf (Devin Desktop)',owner:'Cognition',url:'https://windsurf.com/',task:'code',kind:'agent',platforms:['desktop'],productType:'editor com agente'},
  description:'Editor de código com agente; o produto passou a se chamar Devin Desktop.',
  capabilities:{
   code:['https://docs.windsurf.com/windsurf/cascade/modes','Agente escreve e modifica código no editor.'],
   repository:['https://docs.windsurf.com/windsurf/devin-local','Agente local edita a base de código e executa comandos com regras de permissão.'],
   staticHTML:['https://docs.windsurf.com/windsurf/cascade/modes','Arquivos podem ser criados diretamente pelo agente.']
  },
  specialties:['code','repository'],
  limitations:['O changelog oficial informa que o agente Cascade foi removido e substituído pelo Devin Local; documentação antiga ainda descreve o Cascade.','Comandos executados pelo agente exigem configurar permissões com cuidado.']
 },
 whisper:{
  create:{name:'Whisper',owner:'OpenAI',url:'https://github.com/openai/whisper',task:'audio',kind:'model',platforms:['desktop'],offline:true,productType:'modelo de código aberto'},
  description:'Modelo de reconhecimento de fala de código aberto (MIT) que roda no próprio computador.',
  capabilities:{
   transcription:['https://github.com/openai/whisper','Transcreve arquivos de áudio localmente após instalar o pacote e o ffmpeg.'],
   offline:['https://github.com/openai/whisper','Código e pesos sob licença MIT; execução local.'],
   private:['https://github.com/openai/whisper','Execução local: o áudio não precisa sair do computador.']
  },
  free:['transcription','offline','private'],
  access:'free',
  plan:{status:'free',note:'Código e pesos sob licença MIT; o custo é o seu hardware.',source:'https://github.com/openai/whisper'},
  openSource:true,local:true,
  limitations:['Exige Python, ffmpeg e linha de comando.','Velocidade depende do hardware e do tamanho do modelo.']
 },
 otter:{
  create:{name:'Otter.ai',owner:'Otter.ai',url:'https://otter.ai/',task:'audio',platforms:['web'],productType:'assistente de reuniões'},
  description:'Assistente de reuniões que transcreve e resume.',
  capabilities:{transcription:['https://otter.ai/','Transcrição e resumo de reuniões.']},
  unsupportedLanguages:['pt'],
  languageSource:'https://help.otter.ai/hc/en-us/articles/360047247414-Supported-languages',
  limitations:['A central de ajuda não lista português entre os idiomas de transcrição.']
 },
 zapier:{
  create:{name:'Zapier',owner:'Zapier',url:'https://zapier.com/',task:'automation',platforms:['web'],productType:'automação'},
  description:'Automação entre milhares de aplicativos, com fluxos e agentes descritos em linguagem natural.',
  capabilities:{
   automation:['https://zapier.com/workflows','Fluxos automáticos entre aplicativos a partir de gatilhos.'],
   agentBuilder:['https://help.zapier.com/hc/en-us/articles/24593355420429-Best-practices-for-working-with-Zapier-Agents','Agentes de IA criados por descrição e conectados a aplicativos.'],
   noCode:['https://zapier.com/blog/how-to-create-ai-agents/','Criação de agentes sem código.']
  },
  specialties:['automation'],
  limitations:['A API AI Actions foi descontinuada em 29/05/2026; integrações devem usar o Zapier MCP.','Planos e tarefas mensais não verificados.']
 },
 make:{
  create:{name:'Make',owner:'Make',url:'https://www.make.com/',task:'automation',platforms:['web'],productType:'automação visual'},
  description:'Automação visual por cenários, com agentes de IA no mesmo canvas.',
  capabilities:{
   automation:['https://help.make.com/scenarios-for-ai-agents','Cenários automatizam tarefas entre aplicativos.'],
   agentBuilder:['https://www.make.com/ai-agents','Agentes de IA construídos e depurados no canvas dos cenários.'],
   noCode:['https://www.make.com/ai-agents','Editor visual.']
  },
  limitations:['Planos não verificados; ajuda oficial tem páginas de versões antigas dos agentes.']
 },
 n8n:{
  create:{name:'n8n',owner:'n8n',url:'https://n8n.io/',task:'automation',platforms:['web','desktop'],productType:'automação auto-hospedável'},
  description:'Automação de fluxos com nó de agente de IA; pode ser auto-hospedado.',
  capabilities:{
   automation:['https://docs.n8n.io/','Ferramenta de automação de fluxos com licença fair-code.'],
   agentBuilder:['https://docs.n8n.io/advanced-ai/','Nó AI Agent com modelo, memória e ferramentas.'],
   offline:['https://docs.n8n.io/','Pode ser instalado no próprio servidor (auto-hospedagem).'],
   private:['https://docs.n8n.io/','Auto-hospedagem mantém os fluxos na sua infraestrutura; modelos externos ainda recebem os dados enviados a eles.']
  },
  free:['automation','agentBuilder','offline','private'],
  access:'freemium',
  plan:{status:'freemium',note:'Versão auto-hospedada sem custo de licença; nuvem é paga.',source:'https://docs.n8n.io/'},
  openSource:'source-available',local:true,
  limitations:['Licença fair-code, não uma licença de código aberto aprovada pela OSI.','Agentes estão em versão prévia.','Auto-hospedagem exige servidor e conhecimento técnico.']
 },
 julius:{
  create:{name:'Julius AI',owner:'Julius AI',url:'https://julius.ai/',task:'data',platforms:['web'],productType:'análise de dados'},
  description:'Análise de planilhas e dados por conversa, executando código Python em ambiente isolado.',
  capabilities:{
   dataAnalysis:['https://julius.ai/home/ai-for-data-analysis','Analisa dados enviados e gera gráficos por pedido em linguagem natural.'],
   spreadsheet:['https://julius.ai/home/excel-ai','Aceita .xlsx, .xls, .csv e Google Sheets.']
  },
  specialties:['dataAnalysis'],
  limitations:['Fontes oficiais divergem sobre o plano gratuito; consulte a página de preços.','Envie apenas dados que você pode compartilhar com o serviço.']
 },
 'excel-copilot':{
  create:{name:'Copilot no Excel',owner:'Microsoft',url:'https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel',task:'data',platforms:['web','desktop'],productType:'recurso do Microsoft 365'},
  description:'Copilot dentro do Excel: perguntas sobre os dados, fórmulas, gráficos e Python.',
  capabilities:{
   spreadsheet:['https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel','Cria fórmulas e responde perguntas sobre a planilha.'],
   dataAnalysis:['https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel','Mostra insights como gráficos, tabelas dinâmicas, tendências e outliers.']
  },
  specialties:['spreadsheet'],
  limitations:['Exige Microsoft 365 com acesso ao Copilot; condições não verificadas.','A função =COPILOT em células foi anunciada para descontinuação em 14/09/2026.','Funciona melhor com dados em tabelas estruturadas.']
 },
 voiceflow:{
  create:{name:'Voiceflow',owner:'Voiceflow',url:'https://www.voiceflow.com/',task:'agents',platforms:['web'],productType:'plataforma de agentes'},
  description:'Plataforma visual para agentes de atendimento por chat e voz.',
  capabilities:{
   chatbot:['https://www.voiceflow.com/','Agentes de chat e voz para atendimento ao cliente.'],
   agentBuilder:['https://www.voiceflow.com/blog/train-an-ai-agent','Base de conhecimento com documentos e perguntas frequentes.'],
   noCode:['https://www.voiceflow.com/blog/how-to-create-a-customer-support-chatbot','Construção em canvas visual.']
  },
  specialties:['chatbot'],
  access:'freemium',
  plan:{status:'freemium',note:'O site cita plano gratuito; limites não verificados.',source:'https://www.voiceflow.com/'},
  limitations:['Integrações complexas exigem blocos de API ou ferramentas de automação.']
 },
 botpress:{
  create:{name:'Botpress',owner:'Botpress',url:'https://botpress.com/',task:'agents',platforms:['web'],productType:'plataforma de agentes'},
  description:'Construtor de chatbots e agentes com base de conhecimento para site e WhatsApp.',
  capabilities:{
   chatbot:['https://botpress.com/blog/build-whatsapp-chatbot','Um bot publicado em site e WhatsApp com a mesma lógica.'],
   agentBuilder:['https://botpress.com/blog/build-rag-chatbot','Base de conhecimento com documentos, URLs e tabelas.'],
   noCode:['https://botpress.com/blog/getting-started-with-botpress','Estúdio visual.']
  },
  access:'freemium',
  plan:{status:'freemium',note:'Comparativo publicado pela Botpress cita plano gratuito com cota de conversas; confira os limites atuais.',source:'https://botpress.com/blog/top-whatsapp-chatbots'},
  limitations:['WhatsApp exige conta Meta Business.']
 },
 rosebud:{
  create:{name:'Rosebud AI',owner:'Rosebud',url:'https://rosebud.ai/',task:'code',platforms:['web'],productType:'criador de jogos'},
  description:'Cria jogos 2D/3D jogáveis no navegador a partir de uma descrição, com código JavaScript editável.',
  capabilities:{
   game:['https://rosebud.ai/ai-game-creator','Gera um jogo jogável a partir do texto e permite iterar por conversa.'],
   noCode:['https://rosebud.ai/make-your-own-game-online','Sem programar e sem instalação.'],
   codeExport:['https://rosebud.ai/3d-game-maker','O JavaScript gerado (Three.js) pode ser aberto e editado.'],
   publish:['https://rosebud.ai/tutorial','Publica o jogo por link.']
  },
  specialties:['game'],
  free:['game','noCode'],
  access:'freemium',
  plan:{status:'freemium',note:'Criar e jogar é gratuito para começar, com créditos limitados; vender jogos exige plano pago.',source:'https://rosebud.ai/3d-game-maker'},
  limitations:['Projetos maiores consomem créditos.']
 },
 khanmigo:{
  create:{name:'Khanmigo',owner:'Khan Academy',url:'https://www.khanmigo.ai/',task:'study',platforms:['web'],productType:'tutor educacional'},
  description:'Tutor da Khan Academy que orienta o aluno a chegar à resposta, e ferramentas para professores.',
  capabilities:{
   tutoring:['https://www.khanmigo.ai/parents','Guia o estudante até a resposta em vez de entregá-la.'],
   study:['https://www.khanmigo.ai/parents','Apoio a lição de casa e estudo.']
  },
  specialties:['tutoring'],
  plan:{status:'paid',note:'Gratuito para professores; estudantes e famílias pagam assinatura ou usam por convênio escolar. Disponibilidade varia por país.',source:'https://www.khanmigo.ai/pricing'},
  limitations:['Acesso de estudantes depende de assinatura ou escola.','Disponibilidade em português não verificada.']
 },
 'notion-ai':{
  create:{name:'Notion AI',owner:'Notion',url:'https://www.notion.com/product/ai',task:'text',platforms:['web','desktop'],productType:'espaço de trabalho'},
  description:'IA dentro do Notion para escrever, resumir páginas e organizar bancos de dados.',
  capabilities:{
   text:['https://www.notion.com/help/guides/notion-ai-for-docs','Escreve e edita texto nas páginas.'],
   workspace:['https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai','Agente trabalha no seu espaço e cria bancos de dados por descrição.'],
   documents:['https://www.notion.com/help/guides/get-answers-about-content-faster-with-q-and-a','Respostas a partir do conteúdo do espaço de trabalho.']
  },
  specialties:['workspace'],
  limitations:['Recursos de IA e créditos dependem do plano.']
 },
 napkin:{
  create:{name:'Napkin AI',owner:'Napkin',url:'https://www.napkin.ai/',task:'presentation',platforms:['web'],productType:'diagramas'},
  description:'Transforma texto em diagramas, fluxogramas, mapas mentais e gráficos.',
  capabilities:{
   diagram:['https://www.napkin.ai/','Gera fluxogramas, mapas mentais, infográficos e gráficos a partir de texto.'],
   presentation:['https://www.napkin.ai/slides/','Napkin Slides cria apresentações.']
  },
  specialties:['diagram'],
  free:['diagram'],
  access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito exporta PNG e PDF; SVG e PPT ficam em planos pagos segundo a página inicial.',source:'https://www.napkin.ai/'},
  api:{status:'supported',note:'API REST retorna SVG, PNG ou PPT.',source:'https://www.napkin.ai/api/'},
  limitations:['Exportação SVG em plano pago.']
 },
 loom:{
  create:{name:'Loom',owner:'Atlassian',url:'https://www.loom.com/',task:'video',platforms:['web','desktop'],productType:'gravador de tela'},
  description:'Gravador de tela e câmera para mensagens em vídeo, com títulos e resumos por IA.',
  capabilities:{
   screenRecord:['https://www.loom.com/products/ai-screen-recorder','Grava tela e câmera.'],
   videoEdit:['https://www.loom.com/ai','Remove palavras de preenchimento e pausas.']
  },
  free:['screenRecord'],
  access:'freemium',
  plan:{status:'freemium',note:'Títulos automáticos em todos os planos, inclusive Starter gratuito; resumos e capítulos exigem plano com IA.',source:'https://support.atlassian.com/loom/docs/loom-ai-features/'},
  limitations:['A transcrição é enviada como texto à OpenAI para gerar títulos e resumos.']
 },
 clipchamp:{
  create:{name:'Clipchamp',owner:'Microsoft',url:'https://clipchamp.com/',task:'video',platforms:['web','desktop'],productType:'editor de vídeo'},
  description:'Editor de vídeo da Microsoft com gravação de tela, legendas automáticas e voz sintética.',
  capabilities:{
   screenRecord:['https://clipchamp.com/en/screen-recorder/','Gravador de tela e câmera gratuito no navegador.'],
   videoEdit:['https://clipchamp.com/en/features/','Editor de vídeo com linha do tempo.'],
   captions:['https://support.microsoft.com/en-us/clipchamp/how-to-use-autocaptions-in-clipchamp','Legendas automáticas gratuitas com exportação SRT.'],
   voice:['https://clipchamp.com/en/features/ai-voice-over-generator/','Texto para voz gratuito no editor.']
  },
  free:['screenRecord','videoEdit','captions','voice'],
  languages:['pt'],languageSource:'https://support.microsoft.com/en-gb/accessibility/clipchamp/make-your-clipchamp-videos-accessible-to-people-with-disabilities',
  access:'freemium',
  plan:{status:'freemium',note:'Gravação, legendas e texto para voz gratuitos; plano gratuito exporta até 1080p segundo a Microsoft.',source:'https://www.microsoft.com/en-us/microsoft-365/clipchamp'},
  limitations:['Áudio das legendas é processado por serviços de nuvem da Microsoft.','Uma língua de transcrição por vídeo.']
 },
 // ── Curadoria 5.2: entradas antigas antes sem competência ──
 deepseek:{
  description:'Assistente de conversa da DeepSeek com pesquisa na web e leitura de arquivos.',
  capabilities:{
   text:['https://www.deepseek.com/en/news/deepseek-app/','App de conversa com modo de raciocínio (Deep-Think).'],
   web:['https://www.deepseek.com/en/news/deepseek-app/','Pesquisa na web listada entre os recursos do app.'],
   documents:['https://chat.deepseek.com/','Envio de documentos para conversas com contexto longo; extração de texto de arquivos.']
  },
  api:{status:'supported',note:'API para desenvolvedores com cobrança própria.',source:'https://api-docs.deepseek.com/'},
  limitations:['A página de recursos do app é antiga; confira os recursos atuais no app.','Não encontramos confirmação oficial de execução de código no app.']
 },
 qwen:{
  description:'Assistente da Alibaba com conversa, pesquisa na web, análise de arquivos e geração/edição de imagens.',
  capabilities:{
   text:['https://qwen.ai/qwenchat','Assistente de conversa de uso geral.'],
   web:['https://qwen.ai/qwenchat','Busca na web com respostas citadas.'],
   documents:['https://qwen.ai/qwenchat','Envio de CSV, Excel e documentos de texto para resumo e análise.'],
   illustration:['https://qwen.ai/blog?id=qwen-vlo','Geração de imagens a partir de texto.'],
   imageEdit:['https://qwen.ai/blog?id=qwen-vlo','Edição de foto enviada por instrução.']
  },
  api:{status:'supported',note:'Plataforma de API própria.',source:'https://qwen.ai/apiplatform'},
  limitations:['Páginas oficiais não detalham limites e planos.']
 },
 mistral:{
  rename:'Le Chat (Mistral Vibe)',
  description:'Assistente da Mistral AI (Le Chat, hoje chamado Vibe) com pesquisa na web, imagens e documentos.',
  capabilities:{
   text:['https://mistral.ai/products/vibe/','Assistente de conversa e tarefas simples.'],
   web:['https://docs.mistral.ai/le-chat/research-analysis/web-search','Pesquisa na web com fontes.'],
   illustration:['https://docs.mistral.ai/le-chat/content-creation/image-generation','Geração de imagens (modelos da Black Forest Labs).'],
   imageEdit:['https://mistral.ai/pricing/','Plano gratuito inclui geração e edição básica de imagens.'],
   documents:['https://docs.mistral.ai/le-chat/overview','Envio de documentos, planilhas, apresentações, PDFs e imagens.']
  },
  free:['text','web','illustration'],
  plan:{status:'freemium',note:'Plano Free com mensagens, pesquisas e geração de imagem limitadas.',source:'https://mistral.ai/pricing/'},
  api:{status:'supported',note:'API da Mistral separada do app.',source:'https://docs.mistral.ai/'},
  limitations:['O produto mudou de nome (Le Chat → Vibe); telas podem diferir das descrições antigas.','Limites diários de imagem dependem do plano.']
 },
 freepik:{
  rename:'Freepik AI (Magnific)',
  description:'Suíte criativa da Freepik, hoje chamada Magnific: gera e edita imagens, remove fundos e cria vídeos.',
  capabilities:{
   photo:['https://www.freepik.com/ai/image-generator','Geração por texto e imagens de referência, com vários modelos.'],
   illustration:['https://www.freepik.com/ai/image-generator','Geração de imagens por texto.'],
   imageEdit:['https://www.freepik.com/ai/photo-editor','Editor de imagem por IA.'],
   background:['https://www.freepik.com/ai/background-remover','Remove o fundo e exporta PNG transparente.'],
   video:['https://support.freepik.com/s/article/Freepik-AI-Tools?language=en_US','Gerador de vídeo por texto e/ou imagem.'],
   imageVideo:['https://support.freepik.com/s/article/Freepik-AI-Tools?language=en_US','Transforma imagem em vídeo.']
  },
  limitations:['A marca mudou para Magnific; algumas páginas ainda usam “Freepik”.','Créditos e limites diferem entre páginas oficiais; confira o plano.']
 },
 // ── Novas: legendas em português e currículo ──
 capcut:{
  create:{name:'CapCut',owner:'ByteDance',url:'https://www.capcut.com/',task:'video',platforms:['web','desktop'],productType:'editor de vídeo'},
  description:'Editor de vídeo com legendas automáticas, incluindo português do Brasil, e tradução de legendas.',
  capabilities:{
   videoEdit:['https://www.capcut.com/tools/add-subtitles-to-video','Editor de vídeo online e para computador.'],
   captions:['https://www.capcut.com/resource/add-subtitles-to-video','Legendas automáticas com opção Português (Brasil).'],
   subtitles:['https://www.capcut.com/resource/translated-subtitles','Tradução de legendas geradas para outros idiomas.']
  },
  languages:['pt'],
  limitations:['As páginas oficiais divergem sobre quantos idiomas são suportados.','Plano e limites não verificados.']
 },
 kickresume:{
  create:{name:'Kickresume',owner:'Kickresume',url:'https://www.kickresume.com/',task:'text',platforms:['web'],productType:'criador de currículos'},
  description:'Criador de currículos e cartas com modelos, escrita por IA e tradução de currículo; interface em português.',
  capabilities:{
   resume:['https://www.kickresume.com/en/resumes/','Criador de currículos com modelos e IA.'],
   text:['https://www.kickresume.com/en/ai-resume-rewrite/','Reescrita de currículo por IA.']
  },
  specialties:['resume'],
  free:['resume'],
  access:'freemium',
  languages:['pt'],
  plan:{status:'freemium',note:'Plano gratuito com modelos básicos; recursos avançados de IA e modelos premium são pagos. Exige conta.',source:'https://www.kickresume.com/en/help-center/best-ai-resume-builders/'},
  limitations:['IA avançada só no plano pago.','Revise dados pessoais antes de enviar o currículo a qualquer serviço.']
 },
 canva:{capabilities:{resume:['https://www.canva.com/create/resumes/','Criador de currículos gratuito com modelos e gerador por IA; exporta PDF, JPG ou PNG.']},free:['resume'],plan:{status:'freemium',note:'Plano gratuito inclui o criador de currículos e muitos modelos; modelos e recursos marcados como Pro são pagos.',source:'https://www.canva.com/create/resumes/'}},
 // ── Curadoria 5.3 (03/11/2026): tradução, revisão, matemática, avatar, 3D, assistentes ──
 deepl:{
  create:{name:'DeepL',owner:'DeepL',url:'https://www.deepl.com/',task:'text',platforms:['web','desktop'],productType:'tradutor'},
  description:'Tradutor de textos e documentos (PDF, Word, PowerPoint) que preserva a formatação, e o DeepL Write para revisar textos.',
  capabilities:{
   translation:['https://www.deepl.com/en/features','Tradução de textos e de arquivos inteiros preservando o formato.'],
   proofread:['https://support.deepl.com/hc/en-us/articles/6318834492700-About-DeepL-Write','DeepL Write corrige gramática, ortografia e pontuação e sugere outras formas de dizer.'],
   text:['https://www.deepl.com/en/write','Sugestões de reescrita.']
  },
  specialties:['translation'],free:['translation','proofread'],access:'freemium',languages:['pt'],
  plan:{status:'freemium',note:'Versão gratuita com limite de caracteres e 1 arquivo por mês; DeepL Write grátis até 1.500 caracteres por vez.',source:'https://www.deepl.com/en/pro'},
  api:{status:'supported',note:'API para desenvolvedores com planos próprios.',source:'https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans'},
  limitations:['Plano gratuito limita tamanho e quantidade de arquivos.','DeepL Write Pro é cobrado à parte do DeepL Pro.']
 },
 grammarly:{
  create:{name:'Grammarly',owner:'Grammarly',url:'https://www.grammarly.com/',task:'text',platforms:['web','desktop'],productType:'assistente de escrita'},
  description:'Assistente de escrita que corrige gramática e reescreve trechos, inclusive em português (beta).',
  capabilities:{
   proofread:['https://www.grammarly.com/blog/product/multilingual-support-launch/','Correções de gramática e ortografia e reescrita de parágrafos, inclusive em português.'],
   translation:['https://www.grammarly.com/blog/product/multilingual-support-launch/','Tradução no próprio texto.'],
   text:['https://www.grammarly.com/features','Ajuda com concisão e tom.']
  },
  specialties:['proofread'],free:['proofread','text'],access:'freemium',languages:['pt'],
  plan:{status:'freemium',note:'Plano Free com correções e cota mensal de usos de IA generativa; reescrita completa e detecção de plágio no Pro.',source:'https://www.grammarly.com/'},
  limitations:['Suporte a português está em beta.','Recursos avançados exigem plano pago.']
 },
 quillbot:{
  create:{name:'QuillBot',owner:'QuillBot',url:'https://quillbot.com/',task:'text',platforms:['web'],productType:'paráfrase e gramática'},
  description:'Parafraseador e corretor gramatical gratuito, com versão em português do Brasil.',
  capabilities:{
   proofread:['https://quillbot.com/portuguese-grammar-check','Corretor gramatical gratuito em português do Brasil, sem cadastro.'],
   text:['https://help.quillbot.com/hc/en-us/articles/35855256386071-What-languages-does-the-Quillbot-Paraphraser-support','Parafraseador em mais de 25 idiomas, incluindo português.']
  },
  free:['proofread','text'],access:'freemium',languages:['pt'],
  plan:{status:'freemium',note:'Gratuito com limite de 125 palavras por paráfrase e dois modos; mais recursos no plano pago.',source:'https://quillbot.com/paraphrasing-tool'},
  limitations:['Paráfrase gratuita limitada a 125 palavras por vez.','A central de ajuda e as páginas divergem sobre os idiomas do corretor.']
 },
 photomath:{
  create:{name:'Photomath',owner:'Google',url:'https://photomath.com/',task:'study',platforms:['mobile'],productType:'app de matemática'},
  description:'Fotografe um exercício de matemática e veja a resolução explicada passo a passo.',
  capabilities:{
   math:['https://support.google.com/photomath/answer/14328660?hl=en','Resolve problemas fotografados com explicação por etapas, de aritmética a cálculo.'],
   study:['https://photomath.com/articles/photomath-101-get-math-with-photomath/','Explica cada passo para o estudante aprender o método.']
  },
  specialties:['math'],free:['math','study'],access:'freemium',
  plan:{status:'freemium',note:'Passos de resolução gratuitos; tutoriais animados e explicações extras no Photomath Plus.',source:'https://photomath.com/'},
  limitations:['Aplicativo de celular.','Use para entender o método, não só copiar a resposta.']
 },
 wolframalpha:{
  create:{name:'Wolfram|Alpha',owner:'Wolfram Research',url:'https://www.wolframalpha.com/',task:'study',platforms:['web','mobile'],productType:'motor de cálculo'},
  description:'Motor de cálculo para matemática, ciência e dados; resoluções passo a passo no plano Pro.',
  capabilities:{
   math:['https://www.wolframalpha.com/examples/pro-features/step-by-step-solutions','Soluções passo a passo de álgebra, cálculo, geometria, estatística e mais; também calculadoras de química e física.']
  },
  limitations:['Os passos detalhados são recurso do plano Pro.']
 },
 synthesia:{
  create:{name:'Synthesia',owner:'Synthesia',url:'https://www.synthesia.io/',task:'video',platforms:['web'],productType:'vídeo com avatar'},
  description:'Transforma texto em vídeo com apresentador virtual (avatar) e voz em mais de 140 idiomas.',
  capabilities:{
   avatarVideo:['https://www.synthesia.io/features/text-to-video','Vídeo com avatar a partir de texto.'],
   video:['https://www.synthesia.io/features/text-to-video','Gera o vídeo completo a partir do roteiro.']
  },
  specialties:['avatarVideo'],free:['avatarVideo'],access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito sem cartão, com créditos mensais para alguns minutos de vídeo.',source:'https://www.synthesia.io/features/avatars'},
  limitations:['Avatares personalizados têm idiomas limitados.','Use rostos e vozes reais só com autorização.']
 },
 heygen:{
  create:{name:'HeyGen',owner:'HeyGen',url:'https://www.heygen.com/',task:'video',platforms:['web'],productType:'vídeo com avatar'},
  description:'Vídeos com avatar e tradução de vídeo com sincronia labial.',
  capabilities:{
   avatarVideo:['https://www.heygen.com/','Vídeos com avatar a partir de texto.'],
   subtitles:['https://www.heygen.com/translate','Tradução de vídeos com dublagem.'],
   video:['https://www.heygen.com/agent','Agente de vídeo gera o vídeo a partir de instruções.']
  },
  specialties:['avatarVideo'],free:['avatarVideo'],access:'freemium',
  plan:{status:'freemium',note:'Plano Free com 3 vídeos de até 1 minuto por mês, com marca d’água.',source:'https://www.heygen.com/pricing'},
  limitations:['Plano gratuito com marca d’água e poucos idiomas.','Clonar voz ou rosto exige consentimento da pessoa.']
 },
 meshy:{
  create:{name:'Meshy',owner:'Meshy',url:'https://www.meshy.ai/',task:'design',platforms:['web'],productType:'gerador 3D'},
  description:'Gera modelos 3D com textura a partir de texto ou imagem e exporta GLB, FBX, OBJ, STL e outros.',
  capabilities:{
   model3d:['https://www.meshy.ai/features/text-to-3d','Texto para modelo 3D texturizado em cerca de um minuto.'],
   imageEdit:['https://www.meshy.ai/features/image-to-3d','Imagem (PNG, JPG, WebP) para modelo 3D.']
  },
  specialties:['model3d'],free:['model3d'],access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito sem cartão com créditos mensais; licença de uso dos modelos gratuitos tem regras próprias.',source:'https://docs.meshy.ai/en'},
  limitations:['Páginas oficiais divergem sobre créditos e formatos de exportação.','Confira a licença antes de usar modelos gratuitos comercialmente.']
 },
 photoroom:{
  create:{name:'Photoroom',owner:'Photoroom',url:'https://www.photoroom.com/',task:'image',platforms:['web','mobile'],productType:'editor de fotos de produto'},
  description:'Remove fundos e cria fotos de produto no celular ou no navegador.',
  capabilities:{
   background:['https://www.photoroom.com/tools/background-remover','Remoção de fundo com exportação em PNG transparente.'],
   imageEdit:['https://www.photoroom.com/tools','Troca de fundo, desfoque e ajustes de foto.']
  },
  specialties:['background'],free:['background'],access:'freemium',
  plan:{status:'freemium',note:'Versão gratuita com recursos básicos; alta resolução e lote no Pro.',source:'https://www.photoroom.com/tools/background-remover'},
  limitations:['Exportação em alta resolução exige plano pago.']
 },
 'ms-copilot':{
  create:{name:'Microsoft Copilot',owner:'Microsoft',url:'https://copilot.microsoft.com/',task:'text',platforms:['web','desktop','mobile'],productType:'assistente'},
  description:'Assistente gratuito da Microsoft para conversa, pesquisa na web e criação de imagens.',
  capabilities:{
   text:['https://www.microsoft.com/en-us/microsoft-copilot/for-individuals','Assistente de conversa com versão gratuita.'],
   web:['https://learn.microsoft.com/en-us/copilot/overview','Respostas com base em dados da web.'],
   illustration:['https://www.microsoft.com/en-us/microsoft-copilot/for-individuals/do-more-with-ai/ai-art-and-creativity/create-and-edit-images-with-copilot','Gera imagens a partir de texto.'],
   imageEdit:['https://www.microsoft.com/en-us/microsoft-copilot/for-individuals/do-more-with-ai/ai-art-and-creativity/create-and-edit-images-with-copilot','Edita a imagem com instruções seguintes.'],
   study:['https://www.microsoft.com/en-gb/microsoft-copilot/for-individuals/features','Ajuda em pesquisas e estudos.']
  },
  free:['text','web','illustration','study'],access:'freemium',
  plan:{status:'freemium',note:'Experiência básica gratuita; limites de imagens variam por região e demanda.',source:'https://www.microsoft.com/en-us/microsoft-copilot/for-individuals'},
  limitations:['É diferente do GitHub Copilot (programação) e do Copilot no Excel.','Limites de uso variam.']
 },
 grok:{
  create:{name:'Grok',owner:'xAI',url:'https://grok.com/',task:'text',platforms:['web','mobile'],productType:'assistente'},
  description:'Assistente da xAI com pesquisa em tempo real, voz, imagens e vídeos curtos (Imagine).',
  capabilities:{
   text:['https://x.ai/grok','Conversa e ajuda com código e raciocínio.'],
   web:['https://x.ai/grok','Busca em tempo real com citações.'],
   illustration:['https://x.ai/grok','Gera imagens com o Imagine.'],
   video:['https://x.ai/grok','Gera vídeos curtos (até 15 s) com o Imagine.'],
   documents:['https://x.ai/grok','Analisa arquivos enviados: PDFs, imagens, planilhas e código.']
  },
  limitations:['Plano gratuito e limites não verificados.','Respostas podem refletir conteúdo de redes sociais; confira as fontes.']
 },
 murf:{
  create:{name:'Murf AI',owner:'Murf',url:'https://murf.ai/',task:'audio',platforms:['web'],productType:'texto para voz'},
  description:'Gerador de voz com vozes em português do Brasil e de Portugal para narrações.',
  capabilities:{voice:['https://murf.ai/text-to-speech/portuguese','Texto para voz com vozes em português do Brasil e europeu.']},
  free:['voice'],access:'freemium',languages:['pt'],
  plan:{status:'freemium',note:'Plano gratuito com alguns minutos de geração; algumas vozes são PRO.',source:'https://murf.ai/text-to-speech'},
  limitations:['Download do áudio exige conta.','Parte das vozes é paga.']
 },
 // ── Loopins 5.8: 56 ferramentas novas, conferidas em páginas oficiais em 2026-11-03 ──
 // Evidência "indexed": página oficial localizada por busca nesta data (acesso direto bloqueado pela rede).
 // Sora, Jules e Gemini CLI ficaram de fora: as próprias fontes oficiais indicam encerramento ou migração.
 krea:{reviewed:V58,level:'baixo',
  create:{name:'Krea',owner:'Krea',url:'https://www.krea.ai/',task:'image',platforms:['web'],productType:'gerador de imagens',colors:['#5d5fef','#1d1f3a']},
  description:'Gerador de imagens em tempo real: a imagem muda enquanto você ajusta o texto e as referências.',
  capabilities:{illustration:['https://docs.krea.ai/features/realtime','Geração em tempo real com prompts, várias referências e força ajustável.']},
  limitations:['Planos e créditos não verificados; preços divergem entre fontes.']
 },
 flux:{reviewed:V58,level:'medio',
  create:{name:'FLUX (Black Forest Labs)',owner:'Black Forest Labs',url:'https://bfl.ai/',task:'image',kind:'model',platforms:['web'],productType:'modelo de imagem',colors:['#1f7a4d','#0f2e22']},
  description:'Família de modelos de imagem FLUX para gerar e editar imagens, usada por muitos aplicativos.',
  capabilities:{
   illustration:['https://help.bfl.ai/articles/7424166364-wip-welcome-to-the-forest','Modelos FLUX.2 para geração de imagens.'],
   imageEdit:['https://help.bfl.ai/articles/7424166364-wip-welcome-to-the-forest','FLUX.1 Kontext gera e edita imagens a partir de instruções.']
  },
  api:{status:'supported',note:'A API é o principal acesso para desenvolvedores; cobrança por imagem.',source:'https://help.bfl.ai/articles/7424166364-wip-welcome-to-the-forest'},
  limitations:['Acesso principal por API ou por aplicativos parceiros.','Pesos abertos e uso comercial dependem da licença de cada modelo.']
 },
 'stable-diffusion':{reviewed:V58,level:'alto',
  create:{name:'Stable Diffusion',owner:'Stability AI',url:'https://stability.ai/',task:'image',kind:'model',platforms:['desktop'],offline:true,productType:'modelo de imagem aberto',colors:['#7b3fe4','#2a1450']},
  description:'Modelo de imagem com pesos publicados que pode rodar no próprio computador.',
  capabilities:{
   illustration:['https://stability.ai/blog/stable-diffusion-public-release','Pesos e código publicados para gerar imagens por texto.'],
   offline:['https://stability.ai/blog/stable-diffusion-public-release','Roda localmente depois de baixar os pesos.'],
   private:['https://stability.ai/blog/stable-diffusion-public-release','Execução local: as imagens não precisam sair do computador.']
  },
  free:['illustration','offline','private'],openSource:'licença do modelo',local:true,
  limitations:['A licença muda a cada versão; algumas exigem licença paga para empresas maiores. Leia o cartão do modelo.','Exige placa de vídeo adequada e instalação técnica (ou um aplicativo que use o modelo).']
 },
 'adobe-express':{reviewed:V58,level:'baixo',
  create:{name:'Adobe Express',owner:'Adobe',url:'https://www.adobe.com/express/',task:'design',platforms:['web','mobile'],productType:'design gráfico',colors:['#ff3c5f','#5b2bd6']},
  description:'Editor de design com templates e recursos de IA para posts, cartazes e vídeos curtos.',
  capabilities:{
   background:['https://helpx.adobe.com/express/web/video-creation-and-editing/edit-videos/remove-background-videos.html','Remove o fundo de imagens e vídeos.'],
   imageEdit:['https://helpx.adobe.com/express/web/whats-new.html','Preenchimento generativo insere, remove ou troca objetos por descrição.'],
   design:['https://helpx.adobe.com/express/web/whats-new.html','Templates editáveis gerados por IA para redes sociais e peças gráficas.']
  },
  limitations:['Recursos generativos consomem créditos; limites do plano gratuito mudam com o tempo.']
 },
 'ms-designer':{reviewed:V58,level:'nenhum',
  create:{name:'Microsoft Designer',owner:'Microsoft',url:'https://create.microsoft.com/features/ai-image-generator',task:'design',platforms:['web','mobile'],productType:'design gráfico',colors:['#0f6cbd','#7a3fd1']},
  description:'Cria imagens e designs a partir de uma descrição e edita fotos com IA.',
  capabilities:{
   illustration:['https://create.microsoft.com/features/ai-image-generator','Gerador de imagens por descrição.'],
   background:['https://support.microsoft.com/topic/6cd168f3-1cf0-478e-bd75-31d6526d2504','“Editar com IA”: remover ou desfocar o fundo.'],
   imageEdit:['https://support.microsoft.com/topic/6cd168f3-1cf0-478e-bd75-31d6526d2504','Reestilizar a imagem e corrigir elementos.'],
   design:['https://support.microsoft.com/topic/6cd168f3-1cf0-478e-bd75-31d6526d2504','Criação de designs com IA.']
  },
  free:['illustration'],access:'freemium',
  plan:{status:'freemium',note:'A página oficial descreve o gerador de imagens como gratuito; limites podem variar.',source:'https://create.microsoft.com/features/ai-image-generator'},
  limitations:['Exige conta Microsoft.']
 },
 removebg:{reviewed:V58,level:'nenhum',
  create:{name:'remove.bg',owner:'remove.bg',url:'https://www.remove.bg/',task:'image',platforms:['web'],productType:'remoção de fundo',colors:['#3a7bfd','#1b3d8f']},
  description:'Remove o fundo de fotos automaticamente, sem precisar selecionar nada.',
  capabilities:{background:['https://www.remove.bg/help/a/what-is-remove-bg-','Remoção totalmente automática do fundo.']},
  specialties:['background'],
  limitations:['Planos e créditos para alta resolução não verificados.']
 },
 looka:{reviewed:V58,level:'nenhum',
  create:{name:'Looka',owner:'Looka',url:'https://looka.com/',task:'design',platforms:['web'],productType:'logotipo e marca',colors:['#5a3df5','#1f1647']},
  description:'Gera opções de logotipo e kit de marca a partir do nome e das preferências da empresa.',
  capabilities:{design:['https://looka.com/','Logotipos e kit de marca (cartões, posts) gerados a partir de perguntas sobre o negócio.']},
  limitations:['Explorar é gratuito; o download dos arquivos depende de compra (confira na página oficial).']
 },
 opusclip:{reviewed:V58,level:'nenhum',
  create:{name:'OpusClip',owner:'Opus',url:'https://www.opus.pro/',task:'video',platforms:['web'],productType:'cortes de vídeo',colors:['#7c3aed','#0b0b1a']},
  description:'Transforma vídeos longos em cortes curtos com legendas e enquadramento vertical.',
  capabilities:{
   videoEdit:['https://www.opus.pro/home-page','Escolhe os melhores momentos de um vídeo longo e monta cortes curtos.'],
   shortClips:['https://www.opus.pro/home-page','Seleciona os destaques e entrega cortes verticais prontos para redes sociais.'],
   captions:['https://www.opus.pro/home-page','Legendas dinâmicas e reenquadramento automático.']
  },
  limitations:['Funciona a partir de vídeo já gravado; não cria cenas novas.']
 },
 veed:{reviewed:V58,level:'baixo',
  create:{name:'VEED',owner:'VEED',url:'https://www.veed.io/',task:'video',platforms:['web'],productType:'editor de vídeo online',colors:['#b6f36b','#1f3b16']},
  description:'Editor de vídeo online com legendas automáticas, tradução e dublagem.',
  capabilities:{
   captions:['https://www.veed.io/auto-subtitle-generator','Legendas automáticas; exporta SRT, VTT ou TXT ou grava no vídeo.'],
   subtitles:['https://www.veed.io/auto-subtitle-generator','Tradução de legendas e dublagem.'],
   videoEdit:['https://www.veed.io/auto-subtitle-generator','Editor de vídeo no navegador.']
  },
  free:['captions'],access:'freemium',
  plan:{status:'freemium',note:'Gerador de legendas grátis para começar; vídeos longos e download do arquivo de legenda exigem plano pago.',source:'https://www.veed.io/auto-subtitle-generator'}
 },
 invideo:{reviewed:V58,level:'nenhum',
  create:{name:'invideo AI',owner:'invideo',url:'https://invideo.io/',task:'video',platforms:['web'],productType:'vídeo a partir de roteiro',colors:['#4f46e5','#0e1a4d']},
  description:'Monta um vídeo completo a partir de uma ideia ou roteiro, com cenas, música e narração.',
  capabilities:{video:['https://info.invideo.io/ai-text-script-to-full-video','Do roteiro ao vídeo com material de banco de imagens, música e narração por IA.']},
  limitations:['Fonte: blog do próprio fornecedor.','Usa principalmente material de banco de imagens, diferente de gerar cenas inéditas.']
 },
 kapwing:{reviewed:V58,level:'baixo',
  create:{name:'Kapwing',owner:'Kapwing',url:'https://www.kapwing.com/',task:'video',platforms:['web'],productType:'editor de vídeo online',colors:['#ff5a5f','#5b1a3c']},
  description:'Editor de vídeo no navegador com legendas automáticas, tradução e dublagem.',
  capabilities:{
   captions:['https://www.kapwing.com/subtitles/translator','Legendas automáticas editáveis; exporta SRT, VTT e TXT.'],
   subtitles:['https://www.kapwing.com/subtitles/translator','Traduz legendas para mais de 60 idiomas.'],
   videoEdit:['https://www.kapwing.com/tools/translate','Tradução e dublagem de vídeo com vozes de IA.']
  }
 },
 'd-id':{reviewed:V58,level:'baixo',
  create:{name:'D-ID',owner:'D-ID',url:'https://www.d-id.com/',task:'video',platforms:['web','mobile'],productType:'avatar falante',colors:['#2f80ed','#111a33']},
  description:'Transforma uma foto em um apresentador que fala o seu texto.',
  capabilities:{avatarVideo:['https://www.d-id.com/creative-reality-studio/','Foto + roteiro viram vídeo de avatar falante, com mais de 100 idiomas de voz.']},
  api:{status:'supported',note:'API documentada para criar vídeos de foto e texto.',source:'https://docs.d-id.com/docs/v2-photo-avatar-quickstart'},
  limitations:['Use somente fotos de pessoas que autorizaram.','Plano e minutos do teste gratuito não verificados.']
 },
 pixverse:{reviewed:V58,level:'baixo',
  create:{name:'PixVerse',owner:'PixVerse',url:'https://pixverse.ai/',task:'video',platforms:['web','mobile'],productType:'gerador de vídeo',colors:['#9b5cff','#1a0d3a']},
  description:'Gerador de vídeos curtos por texto ou imagem, com áudio nativo no modelo V6.',
  capabilities:{
   video:['https://pixverse.ai/en/product/ai-video-generator','Texto para vídeo.'],
   imageVideo:['https://pixverse.ai/en/product/image-to-video','Anima uma imagem com um prompt de movimento.'],
   videoAudio:['https://pixverse.ai/en/model/pixverse-v6','Modelo V6: até 15 s em 1080p com áudio nativo.']
  },
  api:{status:'supported',note:'API para texto e imagem para vídeo.',source:'https://pixverse.ai/en/developers'},
  limitations:['Clipes curtos; geração consome créditos.']
 },
 hailuo:{reviewed:V58,level:'baixo',
  create:{name:'Hailuo AI',owner:'MiniMax',url:'https://hailuoai.video/',task:'video',platforms:['web','mobile'],productType:'gerador de vídeo',colors:['#ff7a45','#3a1206']},
  description:'Gerador de vídeo da MiniMax por texto ou imagem.',
  capabilities:{
   video:['https://hailuoai.video/tools/hailuo-2-3-model','Hailuo 2.3: texto para vídeo em 768p ou 1080p.'],
   imageVideo:['https://hailuoai.video/tools/hailuo-2-3-model','Imagem para vídeo a partir de um primeiro quadro.']
  },
  limitations:['Clipes de 6 ou 10 segundos.','A API é vendida separadamente pela MiniMax.']
 },
 speechify:{reviewed:V58,level:'nenhum',
  create:{name:'Speechify',owner:'Speechify',url:'https://speechify.com/',task:'audio',platforms:['web','desktop','mobile'],productType:'leitura em voz alta',colors:['#2b59ff','#0b1747']},
  description:'Lê em voz alta páginas, PDFs e livros com vozes naturais, em mais de 60 idiomas.',
  capabilities:{voice:['https://speechify.com/read-aloud/','Texto para fala para ouvir páginas, PDFs e documentos.']},
  free:['voice'],access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito com vozes básicas; vozes naturais e velocidades maiores no Premium.',source:'https://speechify.com/pricing/'},
  limitations:['Feito para ouvir textos; para narração de vídeo com download, compare com ElevenLabs e Murf.']
 },
 moises:{reviewed:V58,level:'nenhum',
  create:{name:'Moises',owner:'Moises',url:'https://moises.ai/',task:'audio',platforms:['web','desktop','mobile'],productType:'separação de faixas',colors:['#00c2a8','#06302a']},
  description:'Separa voz e instrumentos de qualquer música: karaokê, playback e estudo.',
  capabilities:{stems:['https://moises.ai/features/stem-separation/','Separa voz, bateria, baixo e outros instrumentos de uma música.']},
  specialties:['stems'],free:['stems'],access:'freemium',
  plan:{status:'freemium',note:'Usuários gratuitos separam um número limitado de faixas por mês.',source:'https://moises.ai/features/vocal-remover/'},
  limitations:['Modelos de maior qualidade e exportação WAV sem perdas são pagos.']
 },
 aiva:{reviewed:V58,level:'baixo',
  create:{name:'AIVA',owner:'AIVA',url:'https://www.aiva.ai/',task:'audio',platforms:['web','desktop'],productType:'composição musical',colors:['#f2b134','#3d2a05']},
  description:'Compõe músicas e trilhas sonoras em mais de 250 estilos.',
  capabilities:{music:['https://www.aiva.ai/','Gera músicas em mais de 250 estilos e permite editar a composição.']},
  limitations:['Direitos de uso dependem do plano: não comercial, comercial limitado ou direitos autorais completos.']
 },
 fireflies:{reviewed:V58,level:'nenhum',
  create:{name:'Fireflies.ai',owner:'Fireflies',url:'https://fireflies.ai/',task:'audio',platforms:['web'],productType:'notas de reunião',colors:['#e0328a','#3b0b24']},
  description:'Grava, transcreve e resume reuniões; português está entre os idiomas.',
  capabilities:{transcription:['https://guide.fireflies.ai/articles/2585231364-transcribe-fireflies-meetings-in-multiple-languages-with-multi-language-mode-beta','Transcrição de reuniões; português (pt) na lista de idiomas.']},
  languages:['pt'],languageSource:'https://guide.fireflies.ai/articles/2585231364-transcribe-fireflies-meetings-in-multiple-languages-with-multi-language-mode-beta',
  limitations:['Vários idiomas na mesma reunião é recurso em beta.']
 },
 tabnine:{reviewed:V58,level:'alto',
  create:{name:'Tabnine',owner:'Tabnine',url:'https://www.tabnine.com/',task:'code',platforms:['desktop'],productType:'assistente de código',colors:['#6b4bff','#1a1240']},
  description:'Assistente de programação para editores, com opção de instalação privada.',
  capabilities:{
   code:['https://docs.tabnine.com/main','Sugestões e chat de código dentro do editor.'],
   private:['https://docs.tabnine.com/main/welcome/readme/system-requirements/system-requirements','Instalação em servidor próprio, nuvem privada ou ambiente sem internet (plano empresarial).']
  },
  limitations:['Instalação privada é do plano empresarial.']
 },
 kiro:{reviewed:V58,level:'alto',
  create:{name:'Kiro',owner:'AWS',url:'https://kiro.dev/',task:'code',kind:'agent',platforms:['desktop'],productType:'editor com agente',colors:['#8b5cf6','#160f2e']},
  description:'Editor com agentes que transforma o pedido em requisitos, design e tarefas antes de programar.',
  capabilities:{
   code:['https://kiro.dev/blog/introducing-kiro/','Desenvolvimento guiado por especificação: requisitos, design e tarefas executadas por agentes.'],
   repository:['https://kiro.dev/blog/from-chat-to-specs-deep-dive/','Analisa a base de código existente e gera especificações dela.']
  },
  limitations:['Planos atuais não verificados.','Agentes executam comandos: revise as permissões.']
 },
 aider:{reviewed:V58,level:'alto',
  create:{name:'Aider',owner:'Aider (código aberto)',url:'https://aider.chat/',task:'code',kind:'agent',platforms:['desktop'],productType:'agente de código no terminal',colors:['#14b8a6','#06302c']},
  description:'Programação em par com IA no terminal; cada mudança vira um commit git fácil de desfazer.',
  capabilities:{
   code:['https://aider.chat/docs/','Começa projetos novos ou trabalha em código existente pelo terminal.'],
   repository:['https://aider.chat/docs/','Mapeia o repositório e faz commit de cada alteração.']
  },
  free:['code','repository'],access:'free',openSource:true,local:true,
  plan:{status:'free',note:'Software gratuito (Apache 2.0); o uso do modelo de IA é pago à parte ao provedor escolhido, ou use um modelo local.',source:'https://aider.chat/'},
  limitations:['Exige terminal, Python e chave de API de um modelo (ou modelo local).']
 },
 cline:{reviewed:V58,level:'alto',
  create:{name:'Cline',owner:'Cline',url:'https://cline.bot/',task:'code',kind:'agent',platforms:['desktop'],productType:'agente de código no editor',colors:['#e5e7eb','#374151']},
  description:'Agente de programação de código aberto para VS Code e JetBrains que pede aprovação a cada passo.',
  capabilities:{
   code:['https://docs.cline.bot/cline-overview','Cria e edita arquivos, executa comandos e usa ferramentas.'],
   repository:['https://docs.cline.bot/cline-overview','Trabalha no projeto aberto no editor, mostrando cada mudança antes de aplicar.']
  },
  free:['code','repository'],access:'free',openSource:true,
  plan:{status:'free',note:'Extensão gratuita e de código aberto; você paga só o provedor do modelo, ou usa modelos locais (Ollama, LM Studio).',source:'https://cline.bot/'},
  limitations:['Exige configurar a chave do provedor de IA ou um modelo local.']
 },
 'google-ai-studio':{reviewed:V58,level:'baixo',
  create:{name:'Google AI Studio',owner:'Google',url:'https://aistudio.google.com/',task:'code',platforms:['web'],productType:'criador de apps',colors:['#4285f4','#0d2a5c']},
  description:'Modo Build cria aplicativos a partir de uma descrição, com prévia ao vivo, banco de dados e login.',
  capabilities:{
   builder:['https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/','Cria apps a partir de descrição e ajusta por conversa, com prévia ao vivo.'],
   noCode:['https://aistudio.google.com/vibe-code','Criação de apps usando apenas palavras.'],
   fullStack:['https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/','Banco Cloud Firestore e login com Firebase após sua aprovação.'],
   code:['https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/','Projetos em React, Angular ou Next.js.']
  },
  api:{status:'supported',note:'Gemini API e AI Studio são separados do app Gemini; o plano do app não dá créditos de API.',source:'https://ai.google.dev/gemini-api/docs/api-overview'},
  limitations:['O Google avisa que o recurso é experimental: trate o app como protótipo e teste.']
 },
 base44:{reviewed:V58,level:'baixo',
  create:{name:'Base44',owner:'Base44',url:'https://base44.com/',task:'code',platforms:['web'],productType:'criador de apps',colors:['#ff6b35','#3d1405']},
  description:'Cria apps e sites completos por descrição, com banco de dados, login e hospedagem.',
  capabilities:{
   builder:['https://docs.base44.com/','Apps, sites e agentes a partir de uma descrição.'],
   noCode:['https://base44.com/','Sem programar; ajustes por conversa.'],
   fullStack:['https://base44.com/','Banco de dados, login e lógica de servidor configurados pela plataforma.'],
   publish:['https://base44.com/','Hospedagem integrada.'],
   codeExport:['https://base44.com/','Sincronização com o GitHub exporta o código-fonte.']
  },
  access:'freemium',
  plan:{status:'freemium',note:'Guia publicado pela própria Base44 cita plano gratuito com créditos de mensagens limitados.',source:'https://base44.com/guides/best-free-ai-app-builders'},
  limitations:['Gera apps web; não publica nas lojas de aplicativos.']
 },
 antigravity:{reviewed:V58,level:'alto',
  create:{name:'Google Antigravity',owner:'Google',url:'https://antigravity.google/',task:'code',kind:'agent',platforms:['desktop'],productType:'editor com agentes',colors:['#34a853','#0b2e17']},
  description:'Plataforma de desenvolvimento do Google em que vários agentes planejam e escrevem código em paralelo.',
  capabilities:{
   code:['https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/','Agentes planejam, escrevem e verificam código.'],
   repository:['https://antigravity.google/product/antigravity-ide/','Editor com painel de agentes trabalhando no projeto.']
  },
  access:'freemium',
  plan:{status:'freemium',note:'Lançado em prévia pública sem custo; a documentação atual cita plano gratuito. Confira os limites.',source:'https://antigravity.google/docs/ide/extensions/vscode/'},
  limitations:['Agentes executam comandos: revise as permissões.']
 },
 devin:{reviewed:V58,level:'alto',
  create:{name:'Devin',owner:'Cognition',url:'https://devin.ai/',task:'code',kind:'agent',platforms:['web','desktop'],productType:'agente de engenharia',colors:['#22d3ee','#082f36']},
  description:'Agente autônomo que escreve, executa e testa código para equipes.',
  capabilities:{
   code:['https://docs.devin.ai/get-started/devin-intro','Escreve, executa e testa código de forma autônoma.'],
   repository:['https://docs.devin.ai/get-started/devin-intro','Trabalha no código do projeto e entrega mudanças para revisão.']
  },
  limitations:['Voltado a equipes de engenharia; planos não verificados.','O Devin Desktop é o antigo Windsurf, listado separadamente.']
 },
 scispace:{reviewed:V58,level:'baixo',
  create:{name:'SciSpace',owner:'SciSpace',url:'https://scispace.com/',task:'research',platforms:['web'],productType:'pesquisa acadêmica',colors:['#5b6cff','#121a52']},
  description:'Revisão de literatura com mais de 280 milhões de artigos e chat com PDF.',
  capabilities:{
   science:['https://scispace.com/resources/scispace-literature-review-workspace/','Busca e compara artigos científicos numa área de revisão de literatura.'],
   documents:['https://scispace.com/','Chat com PDF explica o texto e a matemática do artigo.']
  }
 },
 scite:{reviewed:V58,level:'baixo',
  create:{name:'scite',owner:'scite',url:'https://scite.ai/',task:'research',platforms:['web'],productType:'pesquisa acadêmica',colors:['#ff9f1c','#3d2400']},
  description:'Mostra se outros estudos apoiam, contestam ou apenas mencionam um artigo.',
  capabilities:{science:['https://scite.ai/features','Citações classificadas como de apoio, contraste ou menção.']},
  limitations:['A classificação automática pode errar; leia o trecho citado.']
 },
 'semantic-scholar':{reviewed:V58,level:'nenhum',
  create:{name:'Semantic Scholar',owner:'Ai2 (Allen Institute for AI)',url:'https://www.semanticscholar.org/',task:'research',platforms:['web'],productType:'busca acadêmica',colors:['#1857b6','#f5b400']},
  description:'Busca gratuita de artigos científicos com resumos de uma frase (TLDR) gerados por IA.',
  capabilities:{science:['https://www.semanticscholar.org/faq','Busca de artigos com resumos TLDR e recomendações.']},
  free:['science'],access:'free',
  plan:{status:'free',note:'Ferramenta gratuita mantida pelo Ai2.',source:'https://www.semanticscholar.org/faq'},
  api:{status:'supported',note:'API e conjuntos de dados abertos para desenvolvedores.',source:'https://www.semanticscholar.org/product'}
 },
 researchrabbit:{reviewed:V58,level:'nenhum',
  create:{name:'ResearchRabbit',owner:'ResearchRabbit',url:'https://www.researchrabbit.ai/',task:'research',platforms:['web'],productType:'mapa de citações',colors:['#2ec4b6','#0a3330']},
  description:'Mapa visual de citações: a partir de alguns artigos, mostra referências, quem os cita e trabalhos parecidos.',
  capabilities:{science:['https://www.researchrabbit.ai/help/guide','Explora referências, artigos que citam e similares a partir de artigos-semente.']},
  free:['science'],access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito completo; o RR+ adiciona filtros avançados e mais artigos-semente.',source:'https://www.researchrabbit.ai/'},
  limitations:['Cobertura menor que o Google Acadêmico em algumas áreas.']
 },
 chatpdf:{reviewed:V58,level:'nenhum',
  create:{name:'ChatPDF',owner:'ChatPDF',url:'https://www.chatpdf.com/',task:'study',platforms:['web'],productType:'conversa com documentos',colors:['#ef4444','#3f0d0d']},
  description:'Faça perguntas sobre um PDF e receba respostas com a página de origem.',
  capabilities:{documents:['https://www.chatpdf.com/','Responde sobre PDFs, Word e PowerPoint com citações do documento.']},
  free:['documents'],access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito com 2 documentos por dia.',source:'https://www.chatpdf.com/'},
  limitations:['Não envie documentos sigilosos.']
 },
 genspark:{reviewed:V58,level:'nenhum',
  create:{name:'Genspark',owner:'Genspark',url:'https://www.genspark.ai/',task:'presentation',platforms:['web'],productType:'agente de apresentações',colors:['#111827','#6366f1']},
  description:'Agente que pesquisa o assunto e monta a apresentação, com verificação de fatos.',
  capabilities:{
   presentation:['https://www.genspark.ai/helpcenter/ai-slides','Pesquisa, estrutura e desenha slides; exporta PDF, PPTX ou Google Slides.'],
   web:['https://www.genspark.ai/helpcenter/ai-slides','“Verificar conteúdo” confere fatos e deixa links de referência nos slides.']
  }
 },
 'beautiful-ai':{reviewed:V58,level:'baixo',
  create:{name:'Beautiful.ai',owner:'Beautiful.ai',url:'https://www.beautiful.ai/',task:'presentation',platforms:['web'],productType:'apresentações',colors:['#f97316','#2a1203']},
  description:'Cria apresentações a partir de um pedido, texto, link ou arquivo, com layouts que se ajustam sozinhos.',
  capabilities:{presentation:['https://www.beautiful.ai/presentation-maker','Do prompt ou arquivo à apresentação; Smart Slides realinham o conteúdo.']},
  plan:{status:'unknown',note:'Oferece teste gratuito; depois é pago. Confira os planos.',source:'https://www.beautiful.ai/presentation-maker'}
 },
 pitch:{reviewed:V58,level:'baixo',
  create:{name:'Pitch',owner:'Pitch',url:'https://pitch.com/',task:'presentation',platforms:['web','desktop'],productType:'apresentações',colors:['#6d28d9','#f472b6']},
  description:'O Pitch Agent monta a apresentação a partir da descrição e de arquivos como PDF e CSV.',
  capabilities:{presentation:['https://pitch.com/use-cases/ai-presentation-maker','Descreva, escolha um modelo e o agente cria a apresentação; exporta PPTX e PDF.']},
  access:'freemium',
  plan:{status:'freemium',note:'Plano Free com créditos de IA únicos; planos pagos têm créditos mensais.',source:'https://pitch.com/use-cases/ai-presentation-maker'}
 },
 prezi:{reviewed:V58,level:'baixo',
  create:{name:'Prezi AI',owner:'Prezi',url:'https://prezi.com/',task:'presentation',platforms:['web'],productType:'apresentações',colors:['#3181ff','#0b1f40']},
  description:'Gera apresentações com navegação em zoom a partir de um pedido ou arquivo.',
  capabilities:{presentation:['https://prezi.com/blog/gamma-app-vs-prezi-ai/','Cria apresentação conversacional a partir de prompt ou arquivo.']},
  access:'freemium',
  plan:{status:'freemium',note:'Plano gratuito com créditos de IA; exportação em PDF/PPTX nos planos pagos (páginas da própria Prezi divergem).',source:'https://prezi.com/blog/free-ai-presentation-tools/'}
 },
 stitch:{reviewed:V58,level:'baixo',
  create:{name:'Stitch',owner:'Google',url:'https://stitch.withgoogle.com/',task:'design',platforms:['web'],productType:'design de interfaces',colors:['#a142f4','#24124a']},
  description:'Cria telas de aplicativos e sites a partir de uma descrição ou esboço.',
  capabilities:{
   design:['https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/','Interfaces de alta fidelidade por linguagem natural.'],
   staticHTML:['https://developers.googleblog.com/stitch-a-new-way-to-design-uis/','Gera código front-end (HTML/CSS) a partir do design.']
  },
  limitations:['Produto do Google Labs, em evolução.']
 },
 uizard:{reviewed:V58,level:'baixo',
  create:{name:'Uizard',owner:'Uizard',url:'https://uizard.io/',task:'design',platforms:['web'],productType:'design de interfaces',colors:['#7c5cff','#1f1550']},
  description:'Transforma texto, esboço ou captura de tela em telas editáveis de aplicativo.',
  capabilities:{
   design:['https://uizard.io/ai-design/','Gera telas e wireframes a partir de texto, desenho ou captura de tela.'],
   noCode:['https://uizard.io/ai-design/','Editor visual sem programar.']
  }
 },
 relume:{reviewed:V58,level:'baixo',
  create:{name:'Relume',owner:'Relume',url:'https://www.relume.io/',task:'design',platforms:['web'],productType:'planejamento de sites',colors:['#111111','#9ca3af']},
  description:'Gera o mapa do site e os wireframes a partir de um breve texto sobre a empresa.',
  capabilities:{design:['https://library.relume.io/ai-site-builder','Mapa do site e wireframes com componentes; exporta para Figma e Webflow.']},
  limitations:['Entrega estrutura e wireframes; a publicação acontece em outra ferramenta.']
 },
 'power-automate':{reviewed:V58,level:'medio',
  create:{name:'Power Automate',owner:'Microsoft',url:'https://learn.microsoft.com/en-us/power-automate/',task:'automation',platforms:['web','desktop'],productType:'automação',colors:['#0066ff','#00194d']},
  description:'Automação da Microsoft: descreva o fluxo em linguagem natural e o Copilot monta a estrutura.',
  capabilities:{
   automation:['https://learn.microsoft.com/en-us/power-automate/create-cloud-flow-using-copilot','Copilot sugere gatilho e ações a partir da descrição.'],
   noCode:['https://learn.microsoft.com/en-us/power-automate/create-cloud-flow-using-copilot','Designer visual de fluxos.']
  },
  limitations:['O Copilot é otimizado para inglês, com suporte limitado a outros idiomas.','Exige conta Microsoft; licenças não verificadas.']
 },
 gumloop:{reviewed:V58,level:'medio',
  create:{name:'Gumloop',owner:'Gumloop',url:'https://www.gumloop.com/',task:'automation',platforms:['web'],productType:'automação com agentes',colors:['#ff4fa3','#3a0b25']},
  description:'Automação visual com agentes de IA; um assistente monta o fluxo a partir da sua descrição.',
  capabilities:{
   automation:['https://www.gumloop.com/blog/how-to-build-ai-agents','Fluxos com nós arrastáveis no canvas.'],
   agentBuilder:['https://www.gumloop.com/blog/how-to-build-ai-agents','Agentes com ferramentas, modelo e instruções.'],
   noCode:['https://www.gumloop.com/blog/how-to-build-ai-agents','Assistente cria o plano e conecta os nós.']
  },
  limitations:['Fonte: blog do próprio fornecedor.']
 },
 lindy:{reviewed:V58,level:'medio',
  create:{name:'Lindy',owner:'Lindy',url:'https://www.lindy.ai/',task:'automation',platforms:['web'],productType:'agentes de produtividade',colors:['#4f46e5','#c7d2fe']},
  description:'Agentes sem código que cuidam de e-mails, agenda e anotações de reuniões.',
  capabilities:{
   automation:['https://www.lindy.ai/academy-lessons/getting-started-101','Gatilhos (como e-mail recebido) e ações automáticas.'],
   agentBuilder:['https://www.lindy.ai/academy-lessons/getting-started-101','Agentes a partir de modelos prontos ou do zero.'],
   noCode:['https://www.lindy.ai/academy-lessons/getting-started-101','Editor visual sem código.']
  },
  limitations:['Exige dar acesso à caixa de e-mail e à agenda; avalie a privacidade.']
 },
 dify:{reviewed:V58,level:'alto',
  create:{name:'Dify',owner:'LangGenius',url:'https://dify.ai/',task:'agents',platforms:['web'],offline:true,productType:'plataforma de apps de IA',colors:['#1c64f2','#0a1f4d']},
  description:'Plataforma de código aberto para criar chatbots, agentes e fluxos de IA; pode rodar no seu servidor.',
  capabilities:{
   agentBuilder:['https://github.com/langgenius/dify','Fluxos de agentes, RAG e ferramentas num só lugar.'],
   chatbot:['https://github.com/langgenius/dify','Apps de conversa com base de conhecimento.'],
   offline:['https://github.com/langgenius/dify','Auto-hospedagem com Docker Compose.'],
   private:['https://github.com/langgenius/dify','Auto-hospedado, os dados ficam na sua infraestrutura; modelos externos ainda recebem o que for enviado.']
  },
  free:['agentBuilder','chatbot','offline','private'],access:'freemium',openSource:'source-available',local:true,
  plan:{status:'freemium',note:'Edição comunitária auto-hospedada sem custo de licença; nuvem e versão empresarial são pagas.',source:'https://github.com/langgenius/dify'},
  limitations:['Licença baseada em Apache 2.0 com condições adicionais.','Auto-hospedagem exige Docker e servidor.']
 },
 tripo:{reviewed:V58,level:'baixo',
  create:{name:'Tripo',owner:'VAST',url:'https://www.tripo3d.ai/',task:'design',platforms:['web'],productType:'gerador 3D',colors:['#facc15','#3b2f00']},
  description:'Transforma texto ou imagem em modelo 3D pronto para jogos e animação.',
  capabilities:{model3d:['https://www.tripo3d.ai/help/getting-started/what-is-tripo','Texto ou imagem para 3D; exporta GLB, FBX, OBJ e USD.']},
  free:['model3d'],access:'freemium',
  plan:{status:'freemium',note:'Existe plano gratuito para texto e imagem para 3D; confira os créditos.',source:'https://www.tripo3d.ai/'},
  api:{status:'supported',note:'API de geração 3D cobrada em créditos.',source:'https://developers.tripo3d.ai/en'}
 },
 spline:{reviewed:V58,level:'baixo',
  create:{name:'Spline',owner:'Spline',url:'https://spline.design/',task:'design',platforms:['web'],productType:'design 3D',colors:['#ff3e8a','#2b0f3d']},
  description:'Editor de cenas 3D para web com geração de modelos 3D por texto ou imagem.',
  capabilities:{
   model3d:['https://docs.spline.design/generate/ai-3d-generation','Gera modelo 3D com texturas (GLB) a partir de texto ou imagem.'],
   design:['https://docs.spline.design/doc/what-is-spline/docyen2ISIqL','Editor de cenas 3D interativas.']
  },
  access:'paid',
  plan:{status:'paid',note:'A geração 3D com IA exige plano pago (Hobby, Pro ou Max) com créditos mensais.',source:'https://docs.spline.design/generate/ai-3d-generation'}
 },
 scenario:{reviewed:V58,level:'baixo',
  create:{name:'Scenario',owner:'Scenario',url:'https://www.scenario.com/',task:'image',platforms:['web'],productType:'assets para jogos',colors:['#7dd3fc','#0c2a3d']},
  description:'Treina um modelo com a arte do seu jogo e gera personagens, itens e cenários no mesmo estilo.',
  capabilities:{
   illustration:['https://www.scenario.com/features/train','Modelos treinados no seu estilo visual geram assets consistentes.'],
   model3d:['https://help.scenario.com/articles/3599157490-introduction-to-3d-generation','Geração 3D a partir das imagens.']
  },
  limitations:['Treino de modelo próprio no plano Pro.','Você é responsável pelos direitos das imagens usadas no treino.']
 },
 'google-translate':{reviewed:V58,level:'nenhum',
  create:{name:'Google Tradutor',owner:'Google',url:'https://translate.google.com/',task:'text',platforms:['web','mobile'],productType:'tradutor',colors:['#4285f4','#1a3d7a']},
  description:'Tradutor gratuito de textos, sites e documentos.',
  capabilities:{translation:['https://support.google.com/translate/answer/2534559','Traduz documentos .docx, .pdf, .pptx e .xlsx de até 10 MB.']},
  free:['translation'],access:'free',languages:['pt'],
  plan:{status:'free',note:'Uso gratuito no site e no app; grandes volumes usam a API paga Cloud Translation.',source:'https://translate.google.com/'},
  limitations:['Não traduz texto dentro de imagens nem PDFs digitalizados.','Tradução de documentos não funciona em telas pequenas.']
 },
 languagetool:{reviewed:V58,level:'nenhum',
  create:{name:'LanguageTool',owner:'LanguageTool',url:'https://languagetool.org/',task:'text',platforms:['web','desktop'],productType:'corretor de texto',colors:['#2563eb','#0b1d4a']},
  description:'Corretor de gramática, ortografia e pontuação com bom suporte ao português do Brasil.',
  capabilities:{proofread:['https://languagetool.org/spellchecking-portuguese','Corrige português do Brasil, de Portugal, de Angola e de Moçambique; reescrita com IA.']},
  free:['proofread'],access:'freemium',languages:['pt'],
  plan:{status:'freemium',note:'Correção básica grátis; reescrita com IA limitada a 3 por dia no plano gratuito.',source:'https://languagetool.org/premium'}
 },
 wordtune:{reviewed:V58,level:'nenhum',
  create:{name:'Wordtune',owner:'AI21 Labs',url:'https://www.wordtune.com/',task:'text',platforms:['web'],productType:'reescrita',colors:['#7b61ff','#1f1452']},
  description:'Reescreve frases e parágrafos mudando o tom (formal ou casual) e o tamanho.',
  capabilities:{proofread:['https://www.wordtune.com/rewrite','Sugestões de reescrita por frase ou parágrafo.']},
  limitations:['Recursos voltados principalmente ao inglês; confira o suporte ao português.','Uso gratuito limitado por dia.']
 },
 sudowrite:{reviewed:V58,level:'baixo',
  create:{name:'Sudowrite',owner:'Sudowrite',url:'https://sudowrite.com/',task:'text',platforms:['web'],productType:'escrita de ficção',colors:['#10b981','#06291e']},
  description:'Assistente para escrever ficção: continuar cenas, expandir trechos e organizar personagens e mundo.',
  capabilities:{text:['https://sudowrite.com/writing-assistant','Escrita de histórias com Story Bible para personagens e cenário.']},
  limitations:['Feito só para ficção.']
 },
 jasper:{reviewed:V58,level:'baixo',
  create:{name:'Jasper',owner:'Jasper',url:'https://www.jasper.ai/',task:'text',platforms:['web'],productType:'conteúdo de marketing',colors:['#8b5cf6','#f59e0b']},
  description:'Conteúdo de marketing com a voz da sua marca.',
  capabilities:{text:['https://help.jasper.ai/hc/en-us/articles/55085106001051-Brand-Voice','Aprende o tom da marca a partir de exemplos e escreve conteúdos.']},
  limitations:['Voltado a equipes de marketing; planos não verificados.']
 },
 kimi:{reviewed:V58,level:'nenhum',
  create:{name:'Kimi',owner:'Moonshot AI',url:'https://www.kimi.com/',task:'text',platforms:['web','mobile'],productType:'assistente',colors:['#0f172a','#38bdf8']},
  description:'Assistente da Moonshot AI que lê muitos arquivos de uma vez.',
  capabilities:{
   text:['https://www.kimi.com/en/help/new-user-guide/overview','Assistente de conversa.'],
   documents:['https://www.kimi.com/en/help/new-user-guide/overview','Lê PDF, Word, Excel, PPT e imagens (até 100 MB por arquivo e 50 arquivos).']
  },
  limitations:['O modo Agente usa contexto menor; divida documentos muito longos.']
 },
 poe:{reviewed:V58,level:'nenhum',
  create:{name:'Poe',owner:'Quora',url:'https://poe.com/',task:'text',platforms:['web','mobile','desktop'],productType:'vários modelos num só app',colors:['#5d5cde','#1c1b4d']},
  description:'Reúne modelos de vários fornecedores e permite fazer a mesma pergunta para vários de uma vez.',
  capabilities:{
   text:['https://help.poe.com/hc/en-us/articles/19944206309524-Poe-FAQs','Acesso a modelos da OpenAI, Anthropic, Google, Meta e outros.'],
   illustration:['https://help.poe.com/hc/en-us/articles/19944206309524-Poe-FAQs','Inclui geradores de imagem, vídeo e áudio.']
  },
  limitations:['Os recursos e a qualidade dependem do modelo escolhido.','Limites de uso por plano não verificados.']
 },
 'meta-ai':{reviewed:V58,level:'nenhum',
  create:{name:'Meta AI',owner:'Meta',url:'https://www.meta.ai/',task:'text',platforms:['web','mobile','desktop'],productType:'assistente',colors:['#0081fb','#7a2dff']},
  description:'Assistente gratuito da Meta, também no WhatsApp, que conversa e cria imagens.',
  capabilities:{
   text:['https://www.meta.ai/','Assistente de conversa.'],
   illustration:['https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/','Muse Image gera imagens na conversa.'],
   imageEdit:['https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/','Refinar a imagem marcando ou pedindo mudanças.']
  },
  free:['text','illustration'],access:'freemium',
  plan:{status:'freemium',note:'Gratuito para o uso do dia a dia; mais uso nos planos de assinatura da Meta.',source:'https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/'},
  limitations:['Recursos variam por país.']
 },
 duolingo:{reviewed:V58,level:'nenhum',
  create:{name:'Duolingo Max',owner:'Duolingo',url:'https://www.duolingo.com/',task:'study',platforms:['mobile','web'],productType:'aprender idiomas',colors:['#58cc02','#1f4700']},
  description:'Aprender idiomas com explicações das respostas e conversa por vídeo com personagem (Max).',
  capabilities:{
   languageLearning:['https://www.duolingo.com/help/what-is-duolingo-max','Cursos de idiomas; Video Call para praticar conversação no Max.'],
   tutoring:['https://blog.duolingo.com/explain-my-answer-now-free/','“Explicar minha resposta” agora é gratuito para todos.']
  },
  free:['languageLearning','tutoring'],access:'freemium',
  plan:{status:'freemium',note:'Lições e “Explicar minha resposta” são gratuitos; Video Call exige Duolingo Max (não vendido na web).',source:'https://www.duolingo.com/help/what-is-duolingo-max'}
 },
 quizlet:{reviewed:V58,level:'nenhum',
  create:{name:'Quizlet',owner:'Quizlet',url:'https://quizlet.com/',task:'study',platforms:['web','mobile'],productType:'flashcards e estudo',colors:['#4255ff','#121a5c']},
  description:'Transforma anotações, slides e PDFs em flashcards, guias de estudo e testes.',
  capabilities:{
   study:['https://quizlet.com/features/ai-study-tools','Flashcards, guias de estudo e testes práticos com IA.'],
   documents:['https://quizlet.com/features/ai-flashcard-generator','Gera flashcards a partir de slides, anotações escritas e documentos.']
  },
  free:['study'],access:'freemium',
  plan:{status:'freemium',note:'Modo Aprender gratuito por rodadas limitadas; guias de estudo completos no Quizlet Plus.',source:'https://quizlet.com/features/ai-study-tools'}
 },
 rows:{reviewed:V58,level:'baixo',
  create:{name:'Rows',owner:'Rows',url:'https://rows.com/',task:'data',platforms:['web'],productType:'planilha com IA',colors:['#14b8a6','#0b3b36']},
  description:'Planilha online com um analista de IA que responde perguntas sobre os dados.',
  capabilities:{
   spreadsheet:['https://rows.com/docs/using-the-rows-ai-analyst','Planilha online com o AI Analyst.'],
   dataAnalysis:['https://rows.com/docs/using-the-rows-ai-analyst','Resume dados, cria tabelas dinâmicas e tendências; pode rodar Python.']
  }
 },
 // ── Fatos de planos/recursos para entradas já existentes ──
 chatgpt:{free:['text','study','code','photo','illustration'],plan:{status:'freemium',note:'Plano Free com mensagens, envios de arquivo e criação de imagem limitados; limites mudam com a demanda.',source:'https://chatgpt.com/pricing/'}},
 claude:{free:['text','study','code'],plan:{status:'freemium',note:'Plano Free com chat, busca web, execução de código, Artifacts e projetos; Claude Code não está no Free.',source:'https://claude.com/pricing'},api:{status:'supported',note:'A API da Anthropic é cobrada separadamente da assinatura.',source:'https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers'}},
 perplexity:{free:['web'],plan:{status:'freemium',note:'Plano Free com 3 pesquisas Pro por dia e geração de imagem limitada.',source:'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you'}},
 ideogram:{free:['typography','illustration','photo'],plan:{status:'freemium',note:'Contas com login Google, Apple ou Microsoft recebem créditos semanais; imagens do plano gratuito são públicas.',source:'https://docs.ideogram.ai/plans-and-billing/available-plans'}},
 descript:{capabilities:{screenRecord:['https://www.descript.com/screen-recording','Grava tela e webcam e edita pelo texto da transcrição.'],videoEdit:['https://www.descript.com/video-editing','Edição de vídeo pelo texto, remoção de vícios de linguagem e retakes.'],captions:['https://www.descript.com/features','Legendas a partir da transcrição.']},free:['transcription','screenRecord','videoEdit'],plan:{status:'freemium',note:'Plano gratuito com 1 hora de mídia por mês e exportação 720p com marca d’água.',source:'https://www.descript.com/screen-recording'}},
 lovable:{plan:{status:'freemium',note:'Plano gratuito registrado na curadoria anterior.',source:'https://lovable.dev/pricing'}},
 elevenlabs:{specialties:['voice']},
 gamma:{specialties:['presentation']},
 ollama:{openSource:true,local:true},
 lmstudio:{local:true}
};

// Fatos editoriais leves para todas as entradas (público e descrição curta).
const audiences={beginner:['nenhum','baixo'],developer:['medio','alto']};

for(const [id,e] of Object.entries(entries))if(e.level&&!technical[id])technical[id]=e.level;
const LATEST=[REVIEWED,...Object.values(entries).map(e=>e.reviewed).filter(Boolean)].sort().at(-1);

return {REVIEWED,LATEST,newLabels,technical,entries,audiences};
});
