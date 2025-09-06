import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import Whiteboard from '../components/Whiteboard.jsx';
import { getProject, getTasks, createTask, patchTask, getMessages, postMessage, addMember } from '../services/api';

export default function Project({ id, user, onBack, onLogout }){
  const [project,setProject]=useState(null);
  const [tasks,setTasks]=useState([]);
  const [newTask,setNewTask]=useState({ title:'', description:'', assignee_id:'', due_date:'', status:'todo' });
  const [chat,setChat]=useState([]);
  const [msg,setMsg]=useState('');
  const [inviteEmail,setInviteEmail]=useState('');
  const [wbCollapsed, setWbCollapsed] = useState(true);
  const [wbFull, setWbFull] = useState(false);

  useEffect(()=>{
    const load = async()=>{
      try{
        const p = await getProject(id);
        setProject(p);
        setTasks(await getTasks(id));
        setChat(await getMessages(id));
      }catch(e){ alert(e?.response?.data?.error || 'Failed to load project'); }
    };
    load();

    const s = io('http://localhost:8080');
    s.emit('join', id);
    s.on('task:new', t=>{ if (String(t.project_id)===String(id)) setTasks(prev=>[...prev, t]); });
    s.on('task:update', t=>{ if (String(t.project_id)===String(id)) setTasks(prev=>prev.map(x=>x.id===t.id?t:x)); });
    s.on('message:new', m=>{ if (String(m.project_id)===String(id)) setChat(prev=>[...prev, m]); });
    s.on('project:deleted', p=>{ if (String(p.id)===String(id)) { alert('This project was deleted.'); onBack(); } });
    return ()=>{ s.disconnect(); };
  },[id, onBack]);

  const grouped = useMemo(()=>{
    const g = { todo:[], inprogress:[], done:[] };
    for (const t of tasks) g[t.status]?.push(t);
    return g;
  },[tasks]);

  const create = async()=>{ if (!newTask.title.trim()) return; const payload = { ...newTask, assignee_id: newTask.assignee_id || null }; await createTask(id, payload); setNewTask({ title:'', description:'', assignee_id:'', due_date:'', status:'todo' }); };
  const updateStatus = async(task, status)=>{ await patchTask(task.id, { status }); };
  const sendMsg = async()=>{ if (!msg.trim()) return; await postMessage(id, { body: msg }); setMsg(''); };
  const invite = async()=>{ if (!inviteEmail) return; try { await addMember(id, { email: inviteEmail, role: 'member' }); alert('Member added (if account exists).'); } catch(e){ alert(e?.response?.data?.error || 'Failed to add'); } finally{ setInviteEmail(''); } };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-muted hover:underline">&larr; Back</button>
          <h1 className="text-xl font-bold">{project?.name || 'Project'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <input className="input" placeholder="Invite by email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
          <button className="btn" onClick={invite}>Invite</button>
          <button className="text-sm text-muted underline" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Whiteboard card */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Whiteboard</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm" onClick={()=>setWbCollapsed(v=>!v)}>{wbCollapsed?'Expand':'Collapse'}</button>
            <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm" onClick={()=>setWbFull(true)}>Maximize</button>
          </div>
        </div>
        {!wbCollapsed && (
          <div className="mt-3">
            <Whiteboard projectId={id} user={user} height="50vh" />
          </div>
        )}
      </div>

      {/* Tasks + Chat */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <div className="grid md:grid-cols-3 gap-3">
            {['todo','inprogress','done'].map(col=>(
              <div key={col} className="card kb-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold uppercase tracking-wide text-xs">{col}</h2>
                  {col==='todo' && (
                    <details>
                      <summary className="cursor-pointer text-sm">+ Task</summary>
                      <div className="mt-2 space-y-2">
                        <input className="input" placeholder="Title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})}/>
                        <textarea className="input h-24" placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})}></textarea>
                        <div className="grid grid-cols-2 gap-2">
                          <select className="input" value={newTask.assignee_id} onChange={e=>setNewTask({...newTask, assignee_id:e.target.value})}>
                            <option value="">Unassigned</option>
                            {project?.members?.map(m=>(<option key={m.id} value={m.id}>{m.name || m.email}</option>))}
                          </select>
                          <input className="input" type="date" value={newTask.due_date} onChange={e=>setNewTask({...newTask, due_date:e.target.value})}/>
                        </div>
                        <button className="btn w-full" onClick={create}>Save Task</button>
                      </div>
                    </details>
                  )}
                </div>
                <div className="space-y-2">
                  {grouped[col].map(t=>(
                    <div key={t.id} className="bg-slate-900/60 rounded-xl border border-white/10 p-3">
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs text-muted">{t.due_date || 'No due date'}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {col!=='todo' && <button className="text-xs underline text-muted" onClick={()=>updateStatus(t,'todo')}>To-Do</button>}
                        {col!=='inprogress' && <button className="text-xs underline text-muted" onClick={()=>updateStatus(t,'inprogress')}>In Progress</button>}
                        {col!=='done' && <button className="text-xs underline text-muted" onClick={()=>updateStatus(t,'done')}>Done</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-2">Project Chat</h2>
          <div className="max-h-[50vh] overflow-auto space-y-2 mb-2">
            {chat.map(m=>(
              <div key={m.id} className="text-sm">
                <span className="text-brand font-semibold">{m.author_name || m.author_email}:</span>{' '}
                <span>{m.body}</span>
                <span className="text-xs text-muted"> • {new Date(m.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Message…" />
            <button className="btn" onClick={sendMsg}>Send</button>
          </div>
        </div>
      </div>

      {wbFull && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Whiteboard — Maximized</div>
              <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm" onClick={()=>setWbFull(false)}>Close</button>
            </div>
            <Whiteboard projectId={id} user={user} height="80vh" />
          </div>
        </div>
      )}
    </div>
  )
}
