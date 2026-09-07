import { useEffect, useId, useRef, type ReactNode } from 'react';
export function Icon({name,size=20}:{name:string;size?:number}) {
 const paths:Record<string,ReactNode>={
  mic:<><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>,
  mute:<><path d="m3 3 18 18M9 9v2a3 3 0 0 0 5 2M9 4a3 3 0 0 1 6 1v4M5 10v2a7 7 0 0 0 12 5M19 10v2M12 19v3m-4 0h8"/></>,
  phone:<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>,
  search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,
  down:<path d="m7 10 5 5 5-5"/>,
  check:<path d="m5 12 4 4L19 6"/>,
  close:<path d="m6 6 12 12M6 18 18 6"/>,
  users:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/></>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/></>,
  shuffle:<><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6m3-5c1-1 2-1 3-1h3m-4-4 4 4-4 4"/></>,
  shield:<><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
  spark:<><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/></>,
  flag:<><path d="M4 22V3c5-4 10 4 16 0v10c-6 4-11-4-16 0"/></>,
  volume:<><path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
  exit:<><path d="M9 3H3v18h6m-1-9h13m-5-5 5 5-5 5"/></>,
  refresh:<><path d="M20 7a9 9 0 1 0 1 8M20 2v6h-6"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]??paths.globe}</svg>;
}
export function Brand(){return <span className="brand"><span className="brand-mark"><Icon name="mic" size={23}/></span><span>lingua<span className="brand-light">connect</span><span className="brand-dot">.</span></span></span>;}
export function Avatar({initials,color='peach',large=false}:{initials:string;color?:string;large?:boolean}){return <div className={`avatar ${color} ${large?'large':''}`} aria-hidden="true">{initials}</div>;}
export function Modal({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null); const id=useId();
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 return <dialog ref={ref} className={`lc-dialog ${wide?'wide':''}`} aria-labelledby={id} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="dialog-top"><h2 id={id}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></div>{children}</dialog>;
}
