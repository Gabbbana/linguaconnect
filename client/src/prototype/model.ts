export type Language = 'English' | 'Spanish';
export type Filter = 'Everyone' | 'Native speakers' | 'Fellow learners';
export interface DemoProfile { name: string; native: string; language: Language }
export interface Person { id: number; name: string; city: string; country: string; native: string; practices: Language[]; level: string; bio: string; interests: string[]; color: string; initials: string; }
// Fictional fixtures. They are never represented as real online members.
export const people: Person[] = [
  {id: 1, name: 'Emma Wilson', city: 'London', country: 'UK', native: 'English', practices: ['English', 'Spanish'], level: 'Native', bio: 'A good conversation starts with curiosity. Tell me about your corner of the world.', interests: ['Travel', 'Culture', 'Coffee'], color: 'peach', initials: 'EW'},
  {id: 2, name: 'Mateo Rivera', city: 'Mexico City', country: 'Mexico', native: 'Spanish', practices: ['English', 'Spanish'], level: 'Intermediate', bio: 'Learning a little every day. Usually talking about food, music, or my next adventure.', interests: ['Food', 'Music', 'Travel'], color: 'blue', initials: 'MR'},
  {id: 3, name: 'Sophie Martin', city: 'Lyon', country: 'France', native: 'French', practices: ['English'], level: 'Advanced', bio: 'Book lover, weekend explorer, and enthusiastic language learner. Mistakes welcome!', interests: ['Books', 'Art', 'Culture'], color: 'lilac', initials: 'SM'},
  {id: 4, name: 'Daniel Brooks', city: 'Toronto', country: 'Canada', native: 'English', practices: ['English', 'Spanish'], level: 'Native', bio: 'Let’s trade stories and learn something new. Happy to slow down and help.', interests: ['Outdoors', 'Food', 'Music'], color: 'green', initials: 'DB'},
  {id: 5, name: 'Lucía Torres', city: 'Madrid', country: 'Spain', native: 'Spanish', practices: ['English', 'Spanish'], level: 'Intermediate', bio: 'Small conversations, big discoveries. I love hearing what you’re passionate about.', interests: ['Culture', 'Art', 'Food'], color: 'rose', initials: 'LT'},
  {id: 6, name: 'Kenji Sato', city: 'Kyoto', country: 'Japan', native: 'Japanese', practices: ['English'], level: 'Intermediate', bio: 'A designer practicing English through everyday conversations. What inspires you?', interests: ['Art', 'Coffee', 'Travel'], color: 'sand', initials: 'KS'},
];
export function selectPeople(language: Language, filter: Filter, query: string, topic: string, blocked: number[]) {
  const q=query.trim().toLowerCase();
  return people.filter(p=>!blocked.includes(p.id) && p.practices.includes(language)
    && (filter === 'Everyone' || (filter === 'Native speakers' ? p.native === language : p.native !== language))
    && (topic === 'All interests' || p.interests.includes(topic))
    && (!q || `${p.name} ${p.city} ${p.native} ${p.interests.join(' ')}`.toLowerCase().includes(q)));
}
export type Phase = 'ready' | 'ringing' | 'incoming' | 'active' | 'reconnecting' | 'error' | 'ended';
export interface CallState { person: Person; phase: Phase; seconds: number; muted: boolean; error: string; connectedOnce: boolean }
export type CallEvent = {type:'start';person:Person;incoming?:boolean} | {type:'ring'} | {type:'connect'} | {type:'tick'} | {type:'mute'} | {type:'disconnect'} | {type:'fail';message:string} | {type:'end'} | {type:'close'};
export function callReducer(state: CallState|null, event: CallEvent): CallState|null {
  if(event.type==='start')return {person:event.person,phase:event.incoming?'incoming':'ready',seconds:0,muted:false,error:'',connectedOnce:false};
  if(event.type==='close')return null;
  if(!state)return state;
  switch(event.type){
    case 'ring': return ['ready','incoming','error'].includes(state.phase)?{...state,phase:'ringing',error:''}:state;
    case 'connect':return ['ringing','reconnecting'].includes(state.phase)?{...state,phase:'active',connectedOnce:true,error:''}:state;
    case 'tick':return state.phase==='active'?{...state,seconds:state.seconds+1}:state;
    case 'mute':return state.phase==='active'?{...state,muted:!state.muted}:state;
    case 'disconnect':return state.phase==='active'?{...state,phase:'reconnecting'}:state;
    case 'fail':return state.phase!=='ended'?{...state,phase:'error',error:event.message}:state;
    case 'end':return {...state,phase:'ended'};
    default:return state;
  }
}
export function formatDuration(seconds:number){return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}
export const prompts = [
  'What’s one place in your city everyone should visit?',
  'Tell me about a meal that reminds you of home.',
  'What’s something you’ve learned recently?',
  'If you had a free weekend, how would you spend it?',
  'Which small habit makes your day better?',
];
