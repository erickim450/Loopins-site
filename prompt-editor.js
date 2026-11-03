(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NexusPromptEditor=api;})(globalThis,function(){
'use strict';
function sections(value){return String(value||'').split(/\n\s*\n/).map((text,index)=>({index,title:(text.split('\n')[0]||'Seção').slice(0,80),text}));}
function replaceSection(value,index,next){const parts=sections(value);if(!parts[index])throw Error('Seção não encontrada.');parts[index].text=String(next).slice(0,6000);return parts.map(p=>p.text).join('\n\n').slice(0,18000);}
function createHistory(initial=''){let list=[initial],cursor=0;return {push(value){if(list[cursor]===value)return;list=list.slice(0,cursor+1);list.push(String(value).slice(0,18000));if(list.length>50)list.shift();cursor=list.length-1;},undo(){if(cursor>0)cursor--;return list[cursor];},redo(){if(cursor<list.length-1)cursor++;return list[cursor];},state(){return {canUndo:cursor>0,canRedo:cursor<list.length-1};},reset(value){list=[value];cursor=0;}};}
function snapshot(record,text){const versions=Array.isArray(record.versions)&&record.versions.length?record.versions:record.text?[{text:record.text,created:record.created||new Date().toISOString()}]:[];if(versions.at(-1)?.text===text)return versions;if(versions.length>=30)throw Error('Limite de 30 versões. Exporte antes de continuar.');return [...versions,{text:String(text).slice(0,18000),created:new Date().toISOString()}];}
return {sections,replaceSection,createHistory,snapshot};
});
