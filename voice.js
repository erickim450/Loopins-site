/* Loopins 5.4 — pesquisa por voz.
 * Usa o reconhecimento de fala do próprio navegador (Web Speech API). No Chrome e no Edge,
 * o áudio é processado pelo serviço de voz do fornecedor do navegador; por isso o Loopins avisa
 * antes do primeiro uso. Em navegadores sem suporte, o botão não aparece. */
(function(){
'use strict';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const $=id=>document.getElementById(id);
let rec=null,listening=false,finalText='';
function supported(){return typeof SR==='function';}
function setState(on){
  listening=on;const b=$('voiceButton');if(!b)return;
  b.classList.toggle('is-listening',on);b.setAttribute('aria-pressed',String(on));
  b.setAttribute('aria-label',on?'Parar de ouvir':'Pesquisar por voz');
  const st=$('voiceStatus');if(st)st.textContent=on?'Ouvindo… fale o que você quer criar':'';
}
function consent(){
  const S=window.NexusSettings,st=S?.read();
  if(st?.voiceConsentAt)return true;
  const ok=confirm('Pesquisa por voz: o reconhecimento de fala é feito pelo seu navegador. No Chrome e no Edge, o áudio é enviado ao serviço de voz do fornecedor do navegador para virar texto. O Loopins não grava nem guarda o áudio. Continuar?');
  if(ok){try{S?.update(s=>{s.voiceConsentAt=new Date().toISOString();});}catch(_){/* modo privado: pergunta de novo na próxima vez */}}
  return ok;
}
function start(){
  if(!supported()||listening)return;
  if(!consent())return;
  const input=$('taskInput');
  rec=new SR();rec.lang='pt-BR';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
  finalText='';
  rec.onresult=ev=>{
    let interim='';
    for(let i=ev.resultIndex;i<ev.results.length;i++){const t=ev.results[i][0].transcript;if(ev.results[i].isFinal)finalText+=t;else interim+=t;}
    input.value=(finalText+interim).trim();
    input.dispatchEvent(new Event('input',{bubbles:true}));
  };
  rec.onerror=ev=>{
    const msg={'not-allowed':'Permissão do microfone negada. Libere o microfone nas configurações do navegador.','service-not-allowed':'O navegador bloqueou o serviço de voz.','no-speech':'Não ouvi nada. Tente de novo, mais perto do microfone.','audio-capture':'Nenhum microfone encontrado.','network':'O reconhecimento de voz precisa de internet neste navegador.'}[ev.error];
    if(msg)window.NexusApp?.toast(msg);
  };
  rec.onend=()=>{setState(false);const text=finalText.trim();if(text.length>=3)window.NexusApp?.submitSearch(text);};
  try{rec.start();setState(true);}catch(_){setState(false);}
}
function stop(){try{rec?.stop();}catch(_){/* já parado */}}
function init(){
  const footer=document.querySelector('#searchForm .prompt-footer');
  if(!footer||!supported())return;
  const b=document.createElement('button');b.type='button';b.id='voiceButton';b.className='voice-button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Pesquisar por voz');b.title='Pesquisar por voz';
  b.innerHTML='<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg><span class="voice-wave" aria-hidden="true"></span>';
  b.onclick=()=>listening?stop():start();
  const status=document.createElement('span');status.id='voiceStatus';status.className='voice-status';status.setAttribute('aria-live','polite');
  footer.insertBefore(b,$('searchButton'));footer.insertBefore(status,b);
}
window.NexusVoice={supported,start,stop};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
