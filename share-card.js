/* Loopins 6.2 — Cartão de resultado para compartilhar.
 * Gera, no próprio navegador, uma imagem (1080×1350) com o pedido, as IAs recomendadas e o
 * Loopino, pronta para baixar ou compartilhar. Nada é enviado a servidor. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const W=1080,H=1350,FONT="'Space Grotesk','DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif";
const color=v=>/^#[0-9a-f]{3,8}$/i.test(v)?v:'#6c8aff';
function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
/* Quebra o texto em linhas que cabem na largura; a última leva “…” se sobrar texto. */
function wrap(ctx,text,maxW,maxLines){
  const words=String(text).split(/\s+/).filter(Boolean),lines=[];let line='';
  for(let i=0;i<words.length;i++){const test=line?line+' '+words[i]:words[i];
    if(ctx.measureText(test).width<=maxW){line=test;continue;}
    if(line)lines.push(line);line=words[i];
    if(lines.length===maxLines){line='';lines[maxLines-1]=fit(ctx,lines[maxLines-1]+' '+words.slice(i).join(' '),maxW);return lines;}}
  if(line)lines.push(line);
  if(lines.length>maxLines){const rest=lines.splice(maxLines-1).join(' ');lines.push(fit(ctx,rest,maxW));}
  return lines;
}
function fit(ctx,text,maxW){if(ctx.measureText(text).width<=maxW)return text;let t=text;while(t.length>1&&ctx.measureText(t+'…').width>maxW)t=t.slice(0,-1);return t.trimEnd()+'…';}
function loadImage(src){return new Promise(res=>{const img=new Image();img.onload=()=>res(img);img.onerror=()=>res(null);img.src=src;});}
function background(ctx){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0d1c');g.addColorStop(1,'#131a33');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(const [x,y,r,c] of [[260,40,420,'rgba(122,92,255,.30)'],[820,120,380,'rgba(70,220,205,.20)'],[540,1300,520,'rgba(90,110,255,.16)']]){const rg=ctx.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,c);rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);}
  const rnd=seeded(42);for(let i=0;i<170;i++){ctx.globalAlpha=.25+rnd()*.7;ctx.fillStyle='#e9ecff';ctx.beginPath();ctx.arc(rnd()*W,rnd()*H*.75,.6+rnd()*1.8,0,6.283);ctx.fill();}ctx.globalAlpha=1;
  // Lua.
  const mg=ctx.createRadialGradient(915,150,10,930,165,80);mg.addColorStop(0,'#fffbea');mg.addColorStop(.6,'#e6e1ff');mg.addColorStop(1,'#b7b4e6');
  ctx.shadowColor='rgba(205,210,255,.7)';ctx.shadowBlur=60;ctx.fillStyle=mg;ctx.beginPath();ctx.arc(930,165,74,0,6.283);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(140,140,195,.25)';for(const [x,y,r] of [[955,140,14],[905,190,9],[960,200,6]]){ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
}
async function render(data){
  if(document.fonts?.ready)await document.fonts.ready.catch(()=>{});
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
  background(ctx);
  const items=data.items.slice(0,3),query=String(data.request||data.intent?.originalQuery||'').trim();
  // Marca.
  ctx.textBaseline='alphabetic';ctx.font='700 60px '+FONT;ctx.fillStyle='#ffffff';ctx.fillText('loop',80,140);const lw=ctx.measureText('loop').width;ctx.fillStyle='#7ae6de';ctx.fillText('ins',80+lw,140);
  // Pedido.
  ctx.font='700 30px '+FONT;ctx.fillStyle='#a49bff';ctx.fillText((items.length===1?'A IA CERTA':items.length===2?'MINHAS 2 IAS':'MINHAS 3 IAS')+' PARA',80,270);
  ctx.font='700 62px '+FONT;ctx.fillStyle='#ffffff';const lines=wrap(ctx,'“'+query+'”',W-160,3);lines.forEach((l,i)=>ctx.fillText(l,80,350+i*76));
  // Recomendações.
  let y=350+lines.length*76+40;const rowH=160;
  const fam=data.category,best=t=>(fam&&t.best?.[fam==='research'?'study':fam])||t.facts?.description||Object.values(t.best||{})[0]||'';
  items.forEach((t,i)=>{
    roundRect(ctx,70,y,W-140,rowH-24,28);ctx.fillStyle=i===0?'rgba(38,36,78,.96)':'rgba(22,26,48,.94)';ctx.fill();
    ctx.lineWidth=i===0?3:1.5;ctx.strokeStyle=i===0?'rgba(164,155,255,.75)':'rgba(255,255,255,.12)';ctx.stroke();
    ctx.font='700 30px '+FONT;ctx.fillStyle=i===0?'#c8c1ff':'#8c97ae';ctx.fillText(String(i+1)+'º',100,y+80);
    const cx=205,cy=y+68,lg=ctx.createLinearGradient(cx-40,cy-40,cx+40,cy+40);lg.addColorStop(0,color(t.colors?.[0]));lg.addColorStop(1,color(t.colors?.[1]));
    roundRect(ctx,cx-42,cy-42,84,84,22);ctx.fillStyle=lg;ctx.fill();
    ctx.font='700 44px '+FONT;ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.fillText(t.name.charAt(0),cx,cy+16);ctx.textAlign='left';
    ctx.font='700 44px '+FONT;ctx.fillStyle='#ffffff';ctx.fillText(fit(ctx,t.name,W-460),275,y+62);
    ctx.font='400 26px '+FONT;ctx.fillStyle='#a8b3c8';ctx.fillText(fit(ctx,best(t),W-380-(i===items.length-1?0:0)),275,y+104);
    y+=rowH;
  });
  // Loopino com o acessório da área e a roupa do dia.
  const M=window.NexusMascot,svg=M?.svgFor?.({gear:M.gear?.[fam]||'',outfit:M.outfitFor?.()||''});
  if(svg){const img=await loadImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));if(img){ctx.shadowColor='rgba(120,110,255,.55)';ctx.shadowBlur=50;ctx.drawImage(img,W-270,H-262,200,208);ctx.shadowBlur=0;}}
  // Rodapé.
  ctx.font='700 34px '+FONT;ctx.fillStyle='#ffffff';ctx.fillText('A IA certa para cada ideia.',80,H-150);
  ctx.font='400 24px '+FONT;ctx.fillStyle='#8c97ae';ctx.fillText('Escolhidas por competências confirmadas em fontes oficiais.',80,H-108);
  const site=/^https?:$/.test(location.protocol)?(location.host+location.pathname).replace(/index\.html$/,'').replace(/\/$/,''):'';
  if(site){ctx.font='600 26px '+FONT;ctx.fillStyle='#7ae6de';ctx.fillText(fit(ctx,site,W-460),80,H-66);}
  return canvas;
}
function slug(t){return String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'resultado';}
async function open(data){
  if(!data?.items?.length){window.NexusApp?.toast('Faça uma busca com resultado para gerar o cartão.');return;}
  let dlg=$('shareCardDialog');
  if(!dlg){dlg=document.createElement('dialog');dlg.id='shareCardDialog';dlg.className='about-dialog share-dialog';dlg.setAttribute('aria-labelledby','shareCardTitle');
    dlg.innerHTML='<div class="dialog-head"><div><span class="section-kicker">COMPARTILHAR</span><h2 id="shareCardTitle">Cartão do seu resultado</h2></div><button class="icon-button" type="button" id="shareCardClose" aria-label="Fechar">×</button></div><div class="dialog-content"><p class="share-status" id="shareCardStatus" aria-live="polite">Desenhando o cartão…</p><img id="shareCardImg" alt="" hidden></div><div class="share-actions"><a class="primary-button" id="shareCardDownload" download="loopins.png" hidden>Baixar imagem</a><button class="outline-button" id="shareCardShare" type="button" hidden>Compartilhar</button></div>';
    document.body.appendChild(dlg);$('shareCardClose').onclick=()=>dlg.close();
    dlg.addEventListener('close',()=>{$('resultCard')?.focus();});}
  const img=$('shareCardImg'),dl=$('shareCardDownload'),sh=$('shareCardShare'),st=$('shareCardStatus');
  img.hidden=true;dl.hidden=true;sh.hidden=true;st.hidden=false;st.textContent='Desenhando o cartão…';
  if(!dlg.open)dlg.showModal?.();
  try{
    const canvas=await render(data),blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
    if(!blob)throw Error('sem imagem');
    const url=canvas.toDataURL('image/png');
    const name='loopins-'+slug(data.request||'')+'.png',query=String(data.request||'').trim();
    img.src=url;img.alt='Cartão: '+data.items.slice(0,3).map(t=>t.name).join(', ')+' para “'+query+'”';img.hidden=false;st.hidden=true;
    dl.href=url;dl.download=name;dl.hidden=false;
    const file=typeof File==='function'?new File([blob],name,{type:'image/png'}):null;
    if(file&&navigator.canShare?.({files:[file]})){sh.hidden=false;sh.onclick=()=>navigator.share({files:[file],title:'Loopins',text:'Minhas IAs para '+query}).catch(()=>{});}
  }catch(_){st.textContent='Não foi possível gerar a imagem neste navegador.';}
}
window.NexusShareCard={open,render};
})();
