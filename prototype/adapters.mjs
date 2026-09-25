import {blankStore} from './domain.mjs';
import {QUESTIONS} from './content.mjs';
export const STORAGE_KEY='vencubator.prototype.v1';
export function storageAdapter(storage,{fail=()=>false}={}){return{
 load(){const raw=storage.getItem(STORAGE_KEY);if(!raw)return blankStore();const s=JSON.parse(raw);if(s.schemaVersion!==1||!Array.isArray(s.projects)||!s.route||!s.preferences||!s.mastery||!Array.isArray(s.events))throw Error('저장 데이터 형식이 달라 자동으로 덮어쓰지 않았어요. 기존 기록을 백업한 뒤 데모를 초기화할 수 있어요.');return s;},
 commit(s){if(fail())throw Error('저장 실패를 재현 중이에요. 설정에서 저장 실패를 해제하고 다시 시도해 주세요.');storage.setItem(STORAGE_KEY,JSON.stringify(s));},
 reset(){storage.removeItem(STORAGE_KEY);},raw(){return storage.getItem(STORAGE_KEY);}
};}
export async function interviewAdapter(step,{mode='normal'}={}){await new Promise(r=>setTimeout(r,mode==='slow'?1500:160));if(mode==='error')throw Error('질문 대역이 응답하지 않았어요. 준비된 기본 질문으로 계속할 수 있어요.');return QUESTIONS[step];}
