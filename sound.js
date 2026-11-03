/* Loopins 5.6.1 — sons sintetizados no navegador (Web Audio), sem arquivos de áudio.
 * Só toca depois de um clique ou tecla (regra dos navegadores) e respeita a preferência
 * "Som" (nexus:settings:v5 → sound). Nada é gravado; não usa microfone.
 *
 * Uivo: lobos uivam com um tom quase puro (pouco harmônico), começando grave, subindo
 * num deslizamento, sustentando com vibrato que cresce e caindo no final. A vogal muda
 * de "a" para "u" (filtro que fecha) e um eco longo de floresta dá a ambiência. */
(function(){
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;
let ctx=null,master=null;
const reverbs=new WeakMap();
function enabled(){const st=window.NexusSettings?.read();return st?st.sound!==false:true;}
function audio(){
  if(!AC)return null;
  if(!ctx){ctx=new AC();master=makeMaster(ctx);}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx;
}
function makeMaster(c){
  // Compressor suave evita estouro quando vários lobos uivam juntos.
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.3;
  const g=c.createGain();g.gain.value=.7;g.connect(comp);comp.connect(c.destination);return g;
}
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(enabled())audio();},{once:true,capture:true}));

function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function noiseBuffer(c,seconds,seed=12345){const b=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate),d=b.getChannelData(0),r=seeded(seed);for(let i=0;i<d.length;i++)d[i]=r()*2-1;return b;}
/* Eco de floresta: resposta ao impulso estéreo gerada (ruído com decaimento exponencial, mais escuro no fim). */
function reverb(c,dest){
  let rv=reverbs.get(dest);if(rv)return rv;
  const seconds=3.2,len=Math.ceil(c.sampleRate*seconds),ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch),r=seeded(99+ch);let lp=0;for(let i=0;i<len;i++){const t=i/c.sampleRate,k=Math.min(.92,.35+t*.25);lp=lp*k+(r()*2-1)*(1-k);d[i]=lp*Math.exp(-t*2.1)*(t<.012?t/.012:1);}}
  const conv=c.createConvolver();conv.buffer=ir;const g=c.createGain();g.gain.value=2.2;conv.connect(g);g.connect(dest);
  rv=conv;reverbs.set(dest,rv);return rv;
}
function env(g,t0,a,peak,hold,r){g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(peak,t0+a);g.gain.setValueAtTime(peak,t0+a+hold);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+hold+r);}

/* Uma voz de lobo. pitch multiplica a nota (1 ≈ 520 Hz na sustentação). */
function voice(c,dest,t0,{dur=2.8,vol=.3,pitch=1,pan=0,wet=.35}={}){
  const T=dur,f=520*pitch;
  const out=c.createGain();
  const dry=c.createGain();dry.gain.value=1-wet*.6;out.connect(dry);
  const send=c.createGain();send.gain.value=wet;out.connect(send);send.connect(reverb(c,dest));
  let tail=dry;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;dry.connect(p);tail=p;}
  tail.connect(dest);
  // Vogal "a" → "u": passa-baixas que fecha, mais um leve reforço por volta de 750 Hz.
  const vowel=c.createBiquadFilter();vowel.type='lowpass';vowel.Q.value=.7;
  vowel.frequency.setValueAtTime(3400,t0);vowel.frequency.exponentialRampToValueAtTime(1500,t0+T*.4);vowel.frequency.exponentialRampToValueAtTime(1050,t0+T);
  const body=c.createBiquadFilter();body.type='peaking';body.frequency.value=750;body.Q.value=1.2;body.gain.value=4;
  vowel.connect(body);
  const amp=c.createGain();body.connect(amp);amp.connect(out);
  amp.gain.setValueAtTime(0.0001,t0);
  amp.gain.exponentialRampToValueAtTime(vol*.55,t0+T*.08);
  amp.gain.linearRampToValueAtTime(vol,t0+T*.25);
  amp.gain.linearRampToValueAtTime(vol*.88,t0+T*.55);
  amp.gain.linearRampToValueAtTime(vol*.82,t0+T*.7);
  amp.gain.linearRampToValueAtTime(vol*.6,t0+T*.9);
  amp.gain.exponentialRampToValueAtTime(0.0001,t0+T);
  // Vibrato que cresce + oscilação lenta (deixa o tom “vivo”).
  const vib=c.createOscillator();vib.frequency.value=5.1;const vibDepth=c.createGain();vibDepth.gain.setValueAtTime(0,t0);vibDepth.gain.linearRampToValueAtTime(f*.006,t0+T*.35);vibDepth.gain.linearRampToValueAtTime(f*.015,t0+T*.85);vib.connect(vibDepth);
  const wob=c.createOscillator();wob.frequency.value=.75;const wobDepth=c.createGain();wobDepth.gain.value=f*.008;wob.connect(wobDepth);
  // Fundamental quase pura + 2º e 3º harmônicos fracos, todos seguindo a mesma curva de altura.
  for(const [h,g] of [[1,.78],[2,.2],[3,.05]]){
    const o=c.createOscillator();o.type='sine';const fr=o.frequency,F=f*h;
    fr.setValueAtTime(F*.48,t0);
    fr.exponentialRampToValueAtTime(F*.8,t0+T*.12);
    fr.exponentialRampToValueAtTime(F*1.06,t0+T*.25);
    fr.exponentialRampToValueAtTime(F,t0+T*.33);
    fr.exponentialRampToValueAtTime(F*.95,t0+T*.68);
    fr.exponentialRampToValueAtTime(F*.58,t0+T*.97);
    const vg=c.createGain();vg.gain.value=h;vibDepth.connect(vg);vg.connect(fr);
    const wg=c.createGain();wg.gain.value=h;wobDepth.connect(wg);wg.connect(fr);
    const og=c.createGain();og.gain.value=g;o.connect(og);og.connect(vowel);
    o.start(t0);o.stop(t0+T+.05);
  }
  vib.start(t0);vib.stop(t0+T+.05);wob.start(t0);wob.stop(t0+T+.05);
  // Sopro bem discreto (principalmente no início).
  const n=c.createBufferSource();n.buffer=noiseBuffer(c,T,7+Math.round(pitch*100));const hp=c.createBiquadFilter();hp.type='bandpass';hp.frequency.value=2200;hp.Q.value=.8;
  const ng=c.createGain();ng.gain.setValueAtTime(0.0001,t0);ng.gain.exponentialRampToValueAtTime(vol*.06,t0+T*.06);ng.gain.exponentialRampToValueAtTime(vol*.015,t0+T*.3);ng.gain.exponentialRampToValueAtTime(0.0001,t0+T);
  n.connect(hp);hp.connect(ng);ng.connect(out);n.start(t0);n.stop(t0+T);
}
function chimeAt(c,dest,t0,freq=880,volume=.12){
  for(const [mult,g0] of [[1,1],[2.01,.35],[3.02,.15]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=freq*mult;env(g,t0,.005,volume*g0,0,1.4/mult);o.connect(g);g.connect(dest);o.start(t0);o.stop(t0+1.6);}
  const o=c.createOscillator();o.frequency.value=freq;const g=c.createGain();env(g,t0,.005,volume*.6,0,1);o.connect(g);g.connect(reverb(c,dest));o.start(t0);o.stop(t0+1.2);
}
function ambientAt(c,dest,t0,duration=7.2,volume=.1){
  const out=c.createGain();out.gain.setValueAtTime(0.0001,t0);out.gain.exponentialRampToValueAtTime(volume,t0+2.2);out.gain.setValueAtTime(volume,t0+duration-1.6);out.gain.exponentialRampToValueAtTime(0.0001,t0+duration);
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(420,t0);lp.frequency.exponentialRampToValueAtTime(1800,t0+3);lp.connect(out);out.connect(dest);
  const wet=c.createGain();wet.gain.value=.5;out.connect(wet);wet.connect(reverb(c,dest));
  for(const fq of [110,164.8,220,329.6])for(const d of [-6,6]){const o=c.createOscillator();o.type='triangle';o.frequency.value=fq;o.detune.value=d;const g=c.createGain();g.gain.value=.09;o.connect(g);g.connect(lp);o.start(t0);o.stop(t0+duration+.1);}
}
/* Partituras (também usadas para gerar a prévia em arquivo). */
const scores={
  single:(c,d,t)=>voice(c,d,t,{dur:2.9,vol:.34}),
  mascot:(c,d,t)=>voice(c,d,t,{dur:1.5,vol:.18,pitch:1.18,wet:.3}),
  pack:(c,d,t)=>{voice(c,d,t,{dur:2.6,vol:.2,pitch:1,pan:0});voice(c,d,t+.45,{dur:2.4,vol:.14,pitch:1.26,pan:-.5,wet:.45});voice(c,d,t+.9,{dur:2.7,vol:.12,pitch:.84,pan:.5,wet:.5});},
  intro:(c,d,t)=>{ambientAt(c,d,t,7.4);[0.3,0.65,1.0,1.35,1.7].forEach((x,i)=>chimeAt(c,d,t+x,[659,784,988,1175,1319][i],.07));chimeAt(c,d,t+2.05,1568,.09);
    voice(c,d,t+3.5,{dur:3.0,vol:.34});voice(c,d,t+4.7,{dur:2.4,vol:.09,pitch:1.2,pan:-.7,wet:.75});voice(c,d,t+5.3,{dur:2.5,vol:.08,pitch:.9,pan:.7,wet:.8});}
};
function play(score,when=0){const c=audio();if(!c||!enabled())return;scores[score](c,master,c.currentTime+when);}
// API usada pelo site (assinaturas mantidas da versão anterior).
function howl(when=0,duration=2.9,volume=.34){
  const c=audio();if(!c||!enabled())return;
  voice(c,master,c.currentTime+when,{dur:duration,vol:volume});
}
function chime(when=0,freq=880,volume=.12){const c=audio();if(!c||!enabled())return;chimeAt(c,master,c.currentTime+when,freq,volume);}
function ambient(duration=7.2,volume=.1){const c=audio();if(!c||!enabled())return;ambientAt(c,master,c.currentTime,duration,volume);}
function intro(){if(enabled()&&audio())play('intro');}
function packHowl(){if(enabled()&&audio())play('pack');}
function stop(){if(!ctx||!master)return;const old=master;old.gain.setTargetAtTime(0,ctx.currentTime,.08);setTimeout(()=>{try{old.disconnect();}catch(_){/* já desligado */}},400);master=makeMaster(ctx);}
/* Gera a partitura num áudio offline (prévia/teste); não toca nada. */
async function render(score,seconds){
  const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OAC)throw Error('Áudio offline indisponível.');
  const sr=44100,c=new OAC(2,Math.ceil(sr*seconds),sr),m=makeMaster(c);scores[score](c,m,0.05);return c.startRendering();
}
window.NexusSound={play,howl,chime,ambient,intro,packHowl,stop,render,enabled,available:()=>!!AC};
})();
