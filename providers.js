/* Loopins — cliente da integração opcional com IA externa.
 * Só fala com o servidor do próprio Loopins (/api/*); nenhuma chave existe no navegador.
 * Estados possíveis:
 *  - "local": site aberto sem servidor (file:// ou hospedagem estática) ou servidor sem provedor;
 *  - "ready": servidor com provedor configurado. Cada envio exige consentimento do usuário.
 * Nunca há resposta simulada: se a chamada falhar, o erro é mostrado e o modo local continua. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusProviders=api;})(typeof globalThis!=='undefined'?globalThis:this,function providerFactory(){
 'use strict';
 const local=Object.freeze({connected:false,mode:'external-link',reason:'Nenhuma API configurada no Loopins.'});
 let cached=null;
 // Compatibilidade com versões anteriores: ferramentas externas continuam não integradas.
 function describe(tool){return {id:tool.id,status:local,capabilities:[],officialURL:tool.url};}
 async function send(){throw new Error('Não integrada. Copie o pedido e abra o site oficial.');}

 // Hospedagens só estáticas (GitHub Pages, Netlify, Cloudflare Pages) não têm o servidor: nem tenta, evita erro 404 no console.
 const STATIC_HOSTS=/(^|\.)(github\.io|netlify\.app|pages\.dev)$/i;
 function canReachServer(){return typeof location!=='undefined'&&/^https?:$/.test(location.protocol)&&!STATIC_HOSTS.test(location.hostname||'')&&typeof fetch==='function';}
 async function request(path,init={},timeoutMs=60000){
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
  try{
   const response=await fetch(path,{...init,signal:controller?.signal,headers:{'content-type':'application/json',...(init.headers||{})}});
   let data=null;try{data=await response.json();}catch(_){/* resposta sem JSON */}
   if(!response.ok)throw new Error(data?.error||('Servidor respondeu '+response.status+'.'));
   return data;
  }catch(error){
   if(error.name==='AbortError')throw new Error('Tempo esgotado ao contatar o servidor. O modo local continua disponível.');
   throw error;
  }finally{if(timer)clearTimeout(timer);}
 }
 async function status(force=false){
  if(cached&&!force)return cached;
  if(!canReachServer()){cached={enabled:false,reason:'Site aberto sem o servidor do Loopins: integração de IA indisponível; tudo funciona no modo local.'};return cached;}
  try{const s=await request('/api/status',{method:'GET'},6000);cached=s&&typeof s.enabled==='boolean'?s:{enabled:false,reason:'Resposta de status inválida.'};}
  catch(_){cached={enabled:false,reason:'Servidor de IA não encontrado nesta hospedagem; modo local ativo.'};}
  if(!cached.enabled&&!cached.reason)cached.reason='Servidor sem provedor de IA configurado; modo local ativo.';
  return cached;
 }
 const post=(path,body)=>request(path,{method:'POST',body:JSON.stringify({...body,consent:true})});
 return {
  describe,send,status,
  interpret:query=>post('/api/interpret',{query}),
  prompt:options=>post('/api/prompt',options),
  chat:(messages,extra={})=>post('/api/chat',{messages,...extra}),
  compare:(prompt,providers)=>post('/api/compare',{prompt,providers}),
  resetStatus:()=>{cached=null;}
 };
});
