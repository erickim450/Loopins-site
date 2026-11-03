/* Loopins: compatibility facade for the documented capability pipeline. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./catalog.js'):root.NexusCatalog,typeof module!=='undefined'&&module.exports?require('./recommender.js'):root.NexusRecommender);if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusEngine=api;})(globalThis,function(catalog,build){
'use strict';
  const categories = {
    all: { label: 'Descobrir', icon: 'compass', description: 'Encontre a IA certa para a sua próxima ideia.' },
    code: { label: 'Programação', icon: 'code', description: 'Sites, aplicativos, correção de erros e explicações de código.' },
    image: { label: 'Imagens', icon: 'image', description: 'Arte, ilustrações, cartazes, logos e edição.' },
    video: { label: 'Vídeos', icon: 'video', description: 'Cenas, animações, clipes e vídeos curtos.' },
    study: { label: 'Estudos', icon: 'graduation', description: 'Resumos, materiais, explicações e exercícios.' },
    text: { label: 'Textos', icon: 'file', description: 'Escrita, revisão, tradução e novas ideias.' },
    audio: { label: 'Áudio', icon: 'headphones', description: 'Música, voz, narração e trilhas sonoras.' }
  };

  Object.assign(categories,{research:{label:'Pesquisa',icon:'search',description:'Artigos, evidências e fontes.'},presentation:{label:'Apresentações',icon:'panel',description:'Roteiros e slides.'},design:{label:'Design',icon:'image',description:'Layouts e protótipos.'},automation:{label:'Automação',icon:'arrow',description:'Fluxos entre aplicativos e agentes.'},data:{label:'Dados e planilhas',icon:'file',description:'Análise de dados, fórmulas e gráficos.'},agents:{label:'Agentes e atendimento',icon:'send',description:'Chatbots e agentes de atendimento.'}});
  const tools = catalog.tools;


  const normalize = (input) => String(input ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  function extractGoal(input){
    const raw=String(input??'').trim().slice(0,6500);
    const tagged=raw.match(/(?:^|\n)\s*(?:#{1,3}\s*)?(?:OBJETIVO(?:\s+(?:CENTRAL|PRINCIPAL))?|TAREFA\s+PRINCIPAL|PEDIDO\s+ORIGINAL|IDEIA\s+ORIGINAL)\s*:\s*(.+)/i);
    return tagged?tagged[1].trim():raw;
  }

const base={categories,tools,normalize,extractGoal};
return Object.assign(base,build(catalog,base));
});
