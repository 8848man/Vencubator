// SPEC-012: shared, single modal surface; never mutates product state.
let active=null;
export function closeFocusDialog(){active?.close();}
export function openFocusDialog({title,body,actionLabel,onAction,returnFocus,className=''}){
 if(active||document.querySelector('dialog[open]'))return false;
 const origin=document.activeElement, previousOverflow=document.body.style.overflow;
 const dialog=document.createElement('dialog');dialog.className='focus-dialog '+className;
 dialog.setAttribute('aria-labelledby','focus-dialog-title');
 dialog.innerHTML='<header class="focus-dialog-head"><h2 id="focus-dialog-title" tabindex="-1"></h2><button type="button" class="iconbtn" aria-label="닫기">×</button></header><div class="focus-dialog-body"></div><footer class="focus-dialog-actions"><button type="button" class="btn primary wide"></button></footer>';
 dialog.querySelector('h2').textContent=title;
 dialog.querySelector('.focus-dialog-body').innerHTML=body;
 const action=dialog.querySelector('footer button');action.textContent=actionLabel||'문제로 돌아가기';
 let cleaned=false;
 const cleanup=()=>{if(cleaned)return;cleaned=true;active=null;document.body.style.overflow=previousOverflow;dialog.remove();const target=origin?.isConnected?origin:document.querySelector(returnFocus||'.lesson-paper h1');if(target){if(!target.matches('button,input,a'))target.tabIndex=-1;target.focus({preventScroll:true});}};
 const close=()=>{dialog.close();cleanup();};
 dialog.querySelector('header button').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('close',cleanup);
 action.onclick=()=>{close();onAction?.();};
 document.body.append(dialog);active={close};document.body.style.overflow='hidden';
 dialog.showModal();dialog.querySelector('h2').focus();return true;
}
