(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusStorage=api;if(typeof window!=='undefined')root.NexusStore=api.create(()=>window.localStorage);})(typeof globalThis!=='undefined'?globalThis:this,function storageFactory(){
 function create(getStorage){
  const memory=new Map();let privateMode=false;
  function read(key,fallback){if(privateMode&&memory.has(key))return memory.get(key);try{const raw=getStorage().getItem(key);return raw===null?fallback:JSON.parse(raw);}catch(_){return memory.has(key)?memory.get(key):fallback;}}
  function readStrict(key,fallback){if(privateMode&&memory.has(key))return memory.get(key);let raw;try{raw=getStorage().getItem(key);}catch(error){if(memory.has(key))return memory.get(key);throw Error('Armazenamento indisponível; os dados não foram substituídos.');}if(raw===null)return fallback;try{return JSON.parse(raw);}catch(error){throw Error('Dados locais corrompidos na chave '+key+'. Exporte o conteúdo bruto antes de recuperar.');}}
  function writeMany(entries){
   if(privateMode){Object.entries(entries).forEach(([k,v])=>memory.set(k,v));return {ok:true,persistent:false};}
   let target,old={};
   try{target=getStorage();for(const key of Object.keys(entries))old[key]=target.getItem(key);
    for(const [key,value] of Object.entries(entries))target.setItem(key,JSON.stringify(value));
    return {ok:true,persistent:true};
   }catch(error){
    if(target)for(const [key,value] of Object.entries(old)){try{value===null?target.removeItem(key):target.setItem(key,value);}catch(_){}}
    return {ok:false,persistent:false,error:'Não foi possível gravar. Exporte um backup e confira o espaço/permissões do navegador.'};
   }
  }
  function bytes(){try{const s=getStorage();let total=0;for(let i=0;i<s.length;i++){const key=s.key(i);if(key.startsWith('nexus:'))total+=(key.length+(s.getItem(key)||'').length)*2;}return total;}catch(_){return null;}}
  return {read,readStrict,write:(k,v)=>writeMany({[k]:v}),writeMany,bytes,setPrivate:v=>{privateMode=!!v;memory.clear();},isPrivate:()=>privateMode};
 }
 return {create};
});