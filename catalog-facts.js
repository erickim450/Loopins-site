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
  model3d:'Modelo 3D'
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

return {REVIEWED,newLabels,technical,entries,audiences};
});
