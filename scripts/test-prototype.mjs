import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import ts from '../client/node_modules/typescript/lib/typescript.js';
const source=readFileSync(new URL('../client/src/prototype/model.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {callReducer:reduce,selectPeople,people,formatDuration}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name);}
check('English and Spanish filters use the selected practice language',()=>{assert.equal(selectPeople('English','Everyone','','All interests',[]).length,6);assert.equal(selectPeople('Spanish','Everyone','','All interests',[]).length,4);});
check('Native and fellow learner filters partition candidates',()=>{assert.equal(selectPeople('English','Native speakers','','All interests',[]).length,2);assert.equal(selectPeople('English','Fellow learners','','All interests',[]).length,4);});
check('Search, topic, and hidden profiles combine',()=>{assert.equal(selectPeople('English','Everyone','london','Travel',[])[0].id,1);assert.equal(selectPeople('English','Everyone','london','Travel',[1]).length,0);});
check('Call lifecycle tracks elapsed time and mute, then ends',()=>{let s=reduce(null,{type:'start',person:people[0]});s=reduce(s,{type:'ring'});s=reduce(s,{type:'connect'});s=reduce(s,{type:'tick'});s=reduce(s,{type:'mute'});assert.equal(s.muted,true);assert.equal(s.seconds,1);s=reduce(s,{type:'end'});assert.equal(s.phase,'ended');assert.equal(reduce(s,{type:'tick'}).seconds,1);assert.equal(reduce(s,{type:'connect'}).phase,'ended');});
check('Failure can be retried or closed without trapping a call',()=>{let s=reduce(null,{type:'start',person:people[1]});s=reduce(s,{type:'fail',message:'Denied'});assert.equal(s.phase,'error');s=reduce(s,{type:'ring'});s=reduce(s,{type:'connect'});assert.equal(s.phase,'active');assert.equal(reduce(s,{type:'close'}),null);});
check('Reconnection preserves mute and pauses the session clock',()=>{let s=reduce(null,{type:'start',person:people[2]});s=reduce(s,{type:'ring'});s=reduce(s,{type:'connect'});s=reduce(s,{type:'mute'});s=reduce(s,{type:'disconnect'});assert.equal(reduce(s,{type:'tick'}).seconds,0);s=reduce(s,{type:'connect'});assert.equal(s.muted,true);assert.equal(s.phase,'active');});
check('Incoming calls wait for acceptance before connecting',()=>{let s=reduce(null,{type:'start',person:people[0],incoming:true});assert.equal(s.phase,'incoming');assert.equal(reduce(s,{type:'connect'}).phase,'incoming');s=reduce(s,{type:'ring'});assert.equal(reduce(s,{type:'connect'}).phase,'active');});
check('Durations remain correct after a minute',()=>{assert.equal(formatDuration(65),'01:05');});
console.log(`${checks} checks passed.`);
