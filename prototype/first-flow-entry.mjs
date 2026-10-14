// S1 static-site entry. Completion is a local UX preference, never authentication.
export const FIRST_FLOW_MARK_KEY='vencubator.firstFlow.v1';
export function isFirstFlowCompleted(storage){
 try{return JSON.parse(storage.getItem(FIRST_FLOW_MARK_KEY))?.completedVersion>=1;}catch{return false;}
}
export function firstFlowDestination({pathname,search='',storage,state,loadError=''}){
 if(!/^\/app\/(?:index\.html)?$/.test(pathname)||loadError)return null;
 const params=new URLSearchParams(search);
 if(params.has('v33Guide')||params.has('v33Explore'))return null;
 if(state.user||state.projects?.length||state.forms?.onboarding?.completed)return null;
 let raw;
 try{raw=storage.getItem(FIRST_FLOW_MARK_KEY);}catch{return null;}
 try{if(raw&&JSON.parse(raw)?.completedVersion>=1)return null;}catch{/* damaged preference: show introduction */}
 return '/v3.3/';
}
