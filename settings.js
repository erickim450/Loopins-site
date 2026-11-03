/* Loopins 5.0 — preferências locais (chave nexus:settings:v5).
 * Tudo fica no navegador. Nada aqui é enviado ao servidor. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusSettingsFactory=api;if(typeof window!=='undefined'&&root.NexusStore)root.NexusSettings=api.create(root.NexusStore);})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='nexus:settings:v5';
const defaults=()=>({version:5,theme:'auto',fontScale:'normal',budget:'any',experience:'any',platform:'any',offline:false,aiInterpret:false,aiConsentAt:null,voiceConsentAt:null,sound:true,mascot:true,tourDone:false,toolUsage:{},panelHistory:{},promptFavorites:[]});
const pick=(v,list,fallback)=>list.includes(v)?v:fallback;
function sanitize(raw){
 const d=defaults();if(!raw||typeof raw!=='object')return d;
 const usage={};for(const [k,v] of Object.entries(raw.toolUsage||{}))if(/^[a-z0-9-]{1,40}$/.test(k)&&Number.isFinite(v))usage[k]=Math.max(0,Math.min(99999,Math.floor(v)));
 const history={};for(const [k,list] of Object.entries(raw.panelHistory||{}))if(/^[a-z0-9-]{1,40}$/.test(k)&&Array.isArray(list))history[k]=list.filter(x=>x&&typeof x.text==='string').slice(0,10).map(x=>({text:x.text.slice(0,4000),date:String(x.date||'').slice(0,40)}));
 return {version:5,theme:pick(raw.theme,['auto','dark','light'],'auto'),fontScale:pick(raw.fontScale,['normal','large'],'normal'),budget:pick(raw.budget,['any','free','free-strict'],'any'),experience:pick(raw.experience,['any','beginner','advanced'],'any'),platform:pick(raw.platform,['any','web','desktop'],'any'),offline:raw.offline===true,aiInterpret:raw.aiInterpret===true,aiConsentAt:typeof raw.aiConsentAt==='string'?raw.aiConsentAt.slice(0,40):null,voiceConsentAt:typeof raw.voiceConsentAt==='string'?raw.voiceConsentAt.slice(0,40):null,sound:raw.sound!==false,mascot:raw.mascot!==false,tourDone:raw.tourDone===true,toolUsage:usage,panelHistory:history,promptFavorites:(Array.isArray(raw.promptFavorites)?raw.promptFavorites:[]).filter(x=>typeof x==='string').slice(0,30).map(x=>x.slice(0,64))};
}
function create(store){
 const read=()=>sanitize(store.read(KEY,null));
 function update(fn){const next=read();fn(next);const clean=sanitize(next);const r=store.write(KEY,clean);if(!r.ok)throw Error(r.error);return clean;}
 return {
  KEY,read,update,sanitize,
  recordToolUse:id=>update(s=>{s.toolUsage[id]=(s.toolUsage[id]||0)+1;}),
  recordPanelPrompt:(id,text)=>update(s=>{const list=(s.panelHistory[id]||[]).filter(x=>x.text!==text);s.panelHistory[id]=[{text,date:new Date().toISOString()},...list].slice(0,10);}),
  toggleFavoritePrompt:id=>update(s=>{s.promptFavorites=s.promptFavorites.includes(id)?s.promptFavorites.filter(x=>x!==id):[id,...s.promptFavorites];}),
  reset:()=>{const r=store.write(KEY,defaults());if(!r.ok)throw Error(r.error);return defaults();}
 };
}
return {KEY,create,sanitize,defaults};
});
