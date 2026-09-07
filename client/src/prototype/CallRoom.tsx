import { useEffect, useReducer, useRef, useState } from 'react';
import { Avatar, Icon, Modal } from './UI';
import { callReducer, formatDuration, prompts, type CallState, type Person } from './model';
export type Scenario = 'normal'|'denied'|'busy'|'timeout';
export function CallRoom({person,language,incoming,scenario,onClose,onFinish}:{person:Person;language:string;incoming:boolean;scenario:Scenario;onClose:()=>void;onFinish:(name:string,seconds:number)=>void}){
 const [call,dispatch]=useReducer(callReducer,{person,phase:incoming?'incoming':'ready',seconds:0,muted:false,error:'',connectedOnce:false} as CallState);
 const [prompt,setPrompt]=useState(0); const [rating,setRating]=useState(0); const [report,setReport]=useState(false);const [reportSaved,setReportSaved]=useState(false);const [reason,setReason]=useState('Uncomfortable conversation');
 const [mic,setMic]=useState<'idle'|'checking'|'ok'|'error'>('idle');const [micMessage,setMicMessage]=useState('');
 const streamRef=useRef<MediaStream|null>(null);const micGeneration=useRef(0);const micTimer=useRef<ReturnType<typeof setTimeout>>();const recorded=useRef(false);
 const stopMic=()=>{micGeneration.current++;clearTimeout(micTimer.current);streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;};
 useEffect(()=>()=>stopMic(),[]);
 useEffect(()=>{
  if(call?.phase!=='ringing')return;
  const id=setTimeout(()=>{
   if(scenario==='denied')dispatch({type:'fail',message:'Microphone access was denied. You can retry in demo mode or return to partners.'});
   else if(scenario==='busy')dispatch({type:'fail',message:`${person.name.split(' ')[0]} is already in another call. Try another partner.`});
   else if(scenario==='timeout')dispatch({type:'fail',message:'The call could not connect. Check your connection and try again.'});
   else dispatch({type:'connect'});
  },scenario==='timeout'?6000:1800);
  return()=>clearTimeout(id);
 },[call?.phase,scenario,person.name]);
 useEffect(()=>{if(call?.phase!=='active')return;const id=setInterval(()=>dispatch({type:'tick'}),1000);return()=>clearInterval(id);},[call?.phase]);
 useEffect(()=>{if(call?.phase!=='reconnecting')return;const id=setTimeout(()=>dispatch({type:'connect'}),2200);return()=>clearTimeout(id);},[call?.phase]);
 useEffect(()=>{if(call?.phase==='ended'&&call.connectedOnce&&!recorded.current){recorded.current=true;onFinish(person.name,call.seconds);}},[call?.phase]);
 if(!call)return null;
 async function checkMic(){
  stopMic();const generation=micGeneration.current;setMic('checking');setMicMessage('Allow microphone access in your browser.');
  micTimer.current=setTimeout(()=>{if(generation===micGeneration.current){stopMic();setMic('error');setMicMessage('Permission is still pending. You can continue with the simulated call.');}},12000);
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone access is unavailable in this browser.');
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});
   if(generation!==micGeneration.current){stream.getTracks().forEach(t=>t.stop());return;}
   clearTimeout(micTimer.current);streamRef.current=stream;setMic('ok');setMicMessage('Microphone detected. Access has been released; nothing was recorded.');stopMic();
  }catch{if(generation!==micGeneration.current)return;stopMic();setMic('error');setMicMessage('Microphone unavailable or permission denied. Simulated calls still work.');}
 }
 function start(){stopMic();setMic('idle');dispatch({type:'ring'});}
 function finish(){stopMic();dispatch({type:'end'});}
 const first=person.name.split(' ')[0];
 return <main className="call-page">
  <div className="call-page-top"><button className="text-button" onClick={onClose}><Icon name="close"/> {['ready','incoming','ended','error'].includes(call.phase)?'Back to partners':'Leave call'}</button><span className="demo-tag">Simulated call · no audio transmitted</span></div>
  <section className="call-surface">
   <div className="call-language"><Icon name="globe" size={17}/>{language} practice</div>
   {call.phase==='ended'?<>
    <span className="completion-icon"><Icon name="check" size={30}/></span><h1>{call.connectedOnce?'A little practice. A big step.':'Call cancelled.'}</h1>
    <p>{call.connectedOnce?`You practiced with ${first} for ${formatDuration(call.seconds)} in this demo.`:'You can choose another partner whenever you’re ready.'}</p>
    {call.connectedOnce&&<div className="rating"><p>How did the demo session feel?</p><div role="group" aria-label="Rate the demo session">{['Difficult','Okay','Great'].map((label,i)=><button key={label} className={rating===i+1?'selected':''} onClick={()=>setRating(i+1)} aria-pressed={rating===i+1}>{label}</button>)}</div>{rating>0&&<small role="status">Feedback noted for this preview session.</small>}</div>}
    <button className="primary" onClick={onClose}>Find another partner <Icon name="arrow"/></button>
   </>:<>
    <div className={`call-avatar ${['ringing','reconnecting'].includes(call.phase)?'pulsing':''}`}><Avatar initials={person.initials} color={person.color} large/></div>
    <h1>{call.phase==='ready'?`Say hello to ${first}.`:call.phase==='incoming'?`${first} would like to talk.`:call.phase==='ringing'?`Calling ${first}…`:call.phase==='error'?'Let’s try that again.':person.name}</h1>
    <p>{person.city}, {person.country} <span aria-hidden="true">·</span> Native {person.native}</p>
    {call.phase==='ready'&&<div className="precall"><p className="precall-copy">A relaxed conversation, at your own pace.<br/>You can mute or leave at any time.</p><button className="secondary full" onClick={checkMic} disabled={mic==='checking'}><Icon name={mic==='ok'?'check':'mic'}/>{mic==='checking'?'Waiting for permission…':mic==='ok'?'Microphone detected':'Check my microphone (optional)'}</button><small className={mic==='error'?'error-text':''} role="status">{micMessage||'This check requests browser permission. It does not record or send audio.'}</small><button className="primary full" onClick={start}><Icon name="phone"/>Start simulated call</button></div>}
    {call.phase==='incoming'&&<div className="precall"><p>This is a sample incoming call. Choose whether to join.</p><div className="button-row"><button className="secondary" onClick={onClose}>Decline</button><button className="primary" onClick={start}><Icon name="phone"/>Accept call</button></div></div>}
    {call.phase==='ringing'&&<><div className="connection-status" role="status">{scenario==='timeout'?'Waiting for a connection…':'Connecting your demo session…'}</div><button className="secondary" onClick={onClose}>Cancel call</button></>}
    {call.phase==='error'&&<div className="precall"><div className="error-box" role="alert"><Icon name="mic"/><p>{call.error}</p></div><div className="button-row"><button className="secondary" onClick={onClose}>Back to partners</button><button className="primary" onClick={()=>{dispatch({type:'ring'});dispatch({type:'connect'});}}>Try demo again</button></div></div>}
    {['active','reconnecting'].includes(call.phase)&&<>
     <div className="call-timer">{formatDuration(call.seconds)}</div>
     <div className="live-indicator" role="status">{call.phase==='reconnecting'?'Reconnecting demo…':call.muted?'Your microphone is muted (demo)':'Demo session in progress'}</div>
     <div className={`audio-wave ${call.muted||call.phase==='reconnecting'?'still':''}`} aria-hidden="true">{Array.from({length:25},(_,i)=><i key={i} style={{height:8+((i*17+9)%35),animationDelay:`${i*.07}s`}}/>)}</div>
     <div className="icebreaker"><span><Icon name="spark" size={16}/> A little conversation starter</span><p>{prompts[prompt]}</p><button className="text-button" onClick={()=>setPrompt((prompt+1)%prompts.length)}>Another idea <Icon name="refresh" size={16}/></button></div>
     <div className="call-controls"><button className={`control ${call.muted?'active':''}`} disabled={call.phase!=='active'} onClick={()=>dispatch({type:'mute'})} aria-pressed={call.muted}><span><Icon name={call.muted?'mute':'mic'} size={23}/></span>{call.muted?'Unmute':'Mute'}</button><button className="control hangup" onClick={finish}><span><Icon name="phone" size={23}/></span>End call</button><button className="control" onClick={()=>setReport(true)}><span><Icon name="flag" size={23}/></span>Report</button></div>
     <button className="subtle-button" onClick={()=>dispatch({type:'disconnect'})} disabled={call.phase==='reconnecting'}>Test connection recovery</button>
    </>}
   </>}
  </section>
  <p className="call-footnote"><Icon name="shield" size={17}/> Your comfort comes first. Leave whenever you need to.</p>
  {report&&<Modal title="Report this demo call" onClose={()=>setReport(false)}>{reportSaved?<div className="empty-state"><Icon name="check" size={32}/><h3>Report preview complete</h3><p>No report was sent. This tests the reporting experience.</p><button className="primary" onClick={()=>setReport(false)}>Done</button></div>:<form onSubmit={e=>{e.preventDefault();setReportSaved(true);}}><p className="muted">Tell us what happened. This preview does not submit a real report.</p><label>Reason<select value={reason} onChange={e=>setReason(e.target.value)}><option>Uncomfortable conversation</option><option>Harassment or inappropriate behavior</option><option>Spam or misleading profile</option><option>Technical issue</option></select></label><label>Additional details (optional)<textarea maxLength={500} placeholder="Describe what happened…"/></label><button className="primary full" type="submit">Preview report submission</button></form>}</Modal>}
 </main>;
}
