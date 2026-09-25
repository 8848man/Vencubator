import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const s=JSON.parse(readFileSync('docs/execution/STATE.json','utf8'));
const m=JSON.parse(readFileSync(s.checkpoint.manifest,'utf8'));
const errors=[];
if(m.checkpoint_id!==s.checkpoint.id||m.target_state_revision!==s.revision)errors.push('STATE/manifest revision mismatch');
if(!existsSync(s.checkpoint.path))errors.push('Missing checkpoint');
for(const f of m.files){const exists=existsSync(f.path);if(exists!==f.exists)errors.push(`Existence changed: ${f.path}`);else if(exists&&createHash('sha256').update(readFileSync(f.path)).digest('hex').toUpperCase()!==f.sha256)errors.push(`Changed since checkpoint: ${f.path}`);}
const running=Object.entries(s.work_items).filter(([,w])=>['in_progress','validating'].includes(w.status));
if(running.length>1)errors.push('More than one active W');
if(running.length===1&&running[0][0]!==s.active.work_item)errors.push('Active pointer mismatch');
for(const name of ['CURRENT','HANDOFF'])if(!readFileSync(`docs/context/${name}.md`,'utf8').includes(s.checkpoint.id))errors.push(`Stale ${name}`);
console.log(JSON.stringify({checkpoint:s.checkpoint.id,revision:s.revision,active:s.active.work_item,next:s.next.work_item,files:m.files.length,errors},null,2));
if(errors.length)process.exitCode=1;
