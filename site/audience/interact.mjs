import { audienceRoute, browserStorage, readChoice, saveChoice, safeSearch } from './state.mjs';
import { COMMON } from './content.mjs';
import { track, captureUtm } from './track.mjs';

export function bindAudience(win) {
  if (win.__audienceRedirect) return;
  const doc = win.document, shell = doc.querySelector('[data-audience]');
  if (!shell) return;
  const audience = shell.dataset.audience, dialog = shell.querySelector('dialog'), opener = shell.querySelector('[data-aud-open]');
  const local = browserStorage(win,'localStorage'), session = browserStorage(win,'sessionStorage');
  const page = audience === 'experienced' ? 'value' : audience === 'tester' ? 'test' : 'v31';
  const emit = (name, props) => track(name, props, { page, storage: local, session });
  captureUtm(win.location.search, session);
  let viewed = false, trigger = opener, firstPrompt = false;
  const view = () => { if (!viewed) { viewed = true; emit('audience_view',{audience}); } };
  const remember = choice => {
    if (!saveChoice(choice,local,session)) shell.querySelector('.aud-live').textContent = COMMON.failed;
    emit('audience_select',{audience:choice});
  };
  const close = () => { if (firstPrompt) remember('dismissed'); dialog.close(); view(); trigger?.focus(); };
  const open = placement => {
    firstPrompt = placement === 'first';
    trigger = opener;
    dialog.showModal(); shell.querySelector('#aud-title').focus(); emit('audience_prompt',{placement});
  };
  opener.hidden = false;
  opener.addEventListener('click',()=>open('reopen'));
  for (const button of shell.querySelectorAll('[data-aud-close]')) button.addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{ e.preventDefault(); close(); });
  for (const a of shell.querySelectorAll('[data-aud-choice]')) {
    a.href = a.getAttribute('href') + safeSearch(win.location.search);
    a.addEventListener('click',e=>{
      // Modified clicks retain normal link semantics and do not alter this tab's preference.
      if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      remember(a.dataset.audChoice);
      if (a.dataset.audChoice === audience) { e.preventDefault(); dialog.close(); view(); trigger?.focus(); }
    });
  }
  for (const a of doc.querySelectorAll('[data-aud-cta]')) a.addEventListener('click',()=>emit('audience_cta',{audience,placement:a.dataset.audCta}));
  if (audience === 'beginner') {
    for (const [selector,placement] of [['a[data-cta="prototype"][data-placement="hero"]','hero'],['#harvest a[data-cta="prototype"]','footer']]) {
      for (const a of doc.querySelectorAll(selector)) a.addEventListener('click',()=>emit('audience_cta',{audience,placement}));
    }
  }
  if (audienceRoute(win.location.pathname,win.location.hash,readChoice(local,session)).prompt) open('first'); else view();
  // History traversal must show the previous page, never force another stored-preference redirect.
}
if (typeof window !== 'undefined') bindAudience(window);
