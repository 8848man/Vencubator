import {blankStore} from './domain.mjs';
import {QUESTIONS} from './content.mjs';
export const STORAGE_KEY='vencubator.prototype.v1';
export function storageAdapter(storage,{fail=()=>false}={}){let expected;return{
 load(){const raw=storage.getItem(STORAGE_KEY);expected=raw;if(!raw)return blankStore();const s=JSON.parse(raw);if(s.schemaVersion!==1||!Array.isArray(s.projects)||!s.route||!s.preferences||!s.mastery||!Array.isArray(s.events))throw Error('저장 데이터 형식이 달라 자동으로 덮어쓰지 않았어요. 기존 기록을 백업한 뒤 데모를 초기화할 수 있어요.');return s;},
 commit(s){if(fail())throw Error('저장 실패를 재현 중이에요. 설정에서 저장 실패를 해제하고 다시 시도해 주세요.');if(expected!==undefined&&storage.getItem(STORAGE_KEY)!==expected)throw Error('다른 탭에서 기록이 바뀌었어요. 입력한 내용을 따로 보관한 뒤 새로고침해 주세요.');const raw=JSON.stringify(s);storage.setItem(STORAGE_KEY,raw);expected=raw;},
 reset(){storage.removeItem(STORAGE_KEY);expected=null;},raw(){return storage.getItem(STORAGE_KEY);}
};}
export async function interviewAdapter(step,{mode='normal'}={}){await new Promise(r=>setTimeout(r,mode==='slow'?1500:160));if(mode==='error')throw Error('질문 대역이 응답하지 않았어요. 준비된 기본 질문으로 계속할 수 있어요.');return QUESTIONS[step];}
