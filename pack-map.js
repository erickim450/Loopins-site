/* Loopins 6.2 — Mapa das alcateias.
 * As IAs do catálogo agrupadas em alcateias pela área principal de cada uma. Em cada alcateia,
 * o líder é a ferramenta com mais competências confirmadas (fonte oficial) daquela área:
 * critério editorial transparente, não um ranking de qualidade. Clicar abre a ficha da IA. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const color=v=>/^#[0-9a-f]{3,8}$/i.test(v)?v:'#6c8aff';
function families(E){return Object.keys(E.categories).filter(k=>k!=='all');}
/* Área principal: a categoria com maior peso editorial na ficha da ferramenta. */
function primaryFamily(t,cats){const r=Object.entries(t.ranks||{}).filter(([k])=>k!=='all'&&cats.includes(k)).sort((a,b)=>b[1]-a[1]);return r[0]?.[0]||(t.tasks||[]).find(x=>cats.includes(x))||'';}
/* Competências que importam para a área: as exigidas ou pontuadas pelos tipos de tarefa dela. */
// “Pesquisa” não tem tipos de tarefa próprios: usa os de artigos, web e documentos.
const FAMILY_SUBTASKS={research:['science','web','documents']};
function familyCaps(E,fam){const caps=new Set(),only=FAMILY_SUBTASKS[fam];for(const [id,s] of Object.entries(E.subtasks))if(only?only.includes(id):s.family===fam){for(const k of [...(s.required||[]),...(s.anyOf||[]),...Object.keys(s.weights||{})])caps.add(k);}return caps;}
function build(E=window.NexusEngine){
  const cats=families(E),groups={};
  for(const t of E.tools){const f=primaryFamily(t,cats);if(f)(groups[f]=groups[f]||[]).push(t);}
  return Object.entries(groups).map(([fam,tools])=>{
    const caps=familyCaps(E,fam),score=t=>[...caps].filter(k=>t.capabilities?.[k]?.status==='supported').length;
    // Empate: mais competências confirmadas no total; depois ordem alfabética.
    const total=t=>Object.values(t.capabilities||{}).filter(c=>c.status==='supported').length;
    const sorted=[...tools].sort((a,b)=>score(b)-score(a)||total(b)-total(a)||a.name.localeCompare(b.name,'pt-BR'));
    return {family:fam,label:E.categories[fam].label,leader:sorted[0],leaderScore:score(sorted[0]),members:sorted.slice(1),total:tools.length};
  }).sort((a,b)=>b.total-a.total||a.label.localeCompare(b.label,'pt-BR'));
}
/* Desenho da alcateia: líder no centro, membros em anéis ligados a ele. */
function packSVG(g){
  const W=240,C=W/2,ring=(i,n,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [C+r*Math.cos(a),C+r*Math.sin(a)];};
  const m=g.members,inner=m.slice(0,10),outer=m.slice(10),pos=[...inner.map((t,i)=>[t,...ring(i,inner.length,62)]),...outer.map((t,i)=>[t,...ring(i+.5,outer.length,100)])];
  const node=([t,x,y],r)=>'<g class="pm-node" data-panel-id="'+esc(t.id)+'"><title>'+esc(t.name)+'</title><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r+'" fill="url(#pm-'+esc(t.id)+')"/><text x="'+x.toFixed(1)+'" y="'+(y+r*.36).toFixed(1)+'" text-anchor="middle" font-size="'+(r*1.05).toFixed(1)+'">'+esc(t.name.charAt(0))+'</text></g>';
  const defs=[g.leader,...m].map(t=>'<linearGradient id="pm-'+esc(t.id)+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+color(t.colors?.[0])+'"/><stop offset="1" stop-color="'+color(t.colors?.[1])+'"/></linearGradient>').join('');
  return '<svg class="pm-svg" viewBox="0 0 '+W+' '+W+'" role="img" aria-label="Alcateia de '+esc(g.label)+': líder '+esc(g.leader.name)+' e mais '+m.length+' IAs"><defs>'+defs+'</defs>'+
    '<circle cx="'+C+'" cy="'+C+'" r="62" class="pm-ring"/>'+(outer.length?'<circle cx="'+C+'" cy="'+C+'" r="100" class="pm-ring"/>':'')+
    pos.map(([,x,y])=>'<line x1="'+C+'" y1="'+C+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" class="pm-link"/>').join('')+
    pos.map(p=>node(p,outer.length?11:13)).join('')+
    node([g.leader,C,C],24)+'<text x="'+C+'" y="'+(C-32)+'" text-anchor="middle" class="pm-crown">líder</text></svg>';
}
function show(){
  const E=window.NexusEngine,w=$('workspace');if(!E||!w)return;
  const groups=build(E);
  w.innerHTML='<div class="workspace-heading"><span class="section-kicker">MAPA DAS ALCATEIAS</span><h1 tabindex="-1">'+E.tools.length+' IAs em '+groups.length+' alcateias</h1><p>Cada IA entra na alcateia da sua área principal. O líder é a que tem mais competências confirmadas em fonte oficial para aquela área (no empate, mais competências no total): um critério aberto, não uma nota de qualidade. Clique em qualquer IA para ver a ficha.</p></div>'+
  '<div class="pm-grid">'+groups.map(g=>'<section class="ws-block pm-card"><header><h2>'+esc(g.label)+'</h2><span>'+g.total+' IA'+(g.total>1?'s':'')+'</span></header>'+packSVG(g)+
   '<p class="pm-leader"><b>Líder:</b> <button type="button" class="pm-chip lead" data-panel-id="'+esc(g.leader.id)+'"><i style="--a:'+color(g.leader.colors?.[0])+';--b:'+color(g.leader.colors?.[1])+'">'+esc(g.leader.name.charAt(0))+'</i>'+esc(g.leader.name)+'</button> <small>'+g.leaderScore+' competência'+(g.leaderScore===1?'':'s')+' da área confirmada'+(g.leaderScore===1?'':'s')+'</small></p>'+
   '<div class="pm-members">'+g.members.map(t=>'<button type="button" class="pm-chip" data-panel-id="'+esc(t.id)+'"><i style="--a:'+color(t.colors?.[0])+';--b:'+color(t.colors?.[1])+'">'+esc(t.name.charAt(0))+'</i>'+esc(t.name)+'</button>').join('')+'</div></section>').join('')+'</div>';
  w.querySelectorAll('[data-panel-id]').forEach(el=>el.addEventListener('click',()=>window.NexusApp?.openPanel(el.dataset.panelId)));
}
window.NexusPackMap={build,show,primaryFamily};
})();
