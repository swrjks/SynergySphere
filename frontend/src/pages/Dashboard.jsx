import React, { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject } from '../services/api';

export default function Dashboard({ user, gotoProject, onLogout }){
  const [projects,setProjects]=useState([]);
  const [name,setName]=useState('');
  const [desc,setDesc]=useState('');

  const load = async()=> setProjects(await getProjects());
  useEffect(()=>{ load(); },[]);

  const create = async()=>{
    if (!name.trim()) return;
    const p = await createProject({ name, description: desc });
    setName(''); setDesc(''); setProjects(prev=>[p, ...prev]);
  };

  const remove = async(id)=>{
    if (!confirm('Delete this project and all its data? This cannot be undone.')) return;
    try{ await deleteProject(id); setProjects(prev=>prev.filter(p=>p.id!==id)); }
    catch(e){ alert(e?.response?.data?.error || 'Failed to delete (owner only). Log in as the project owner.'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-ink">
      <div className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-brand/20 grid place-items-center shadow"><span className="font-extrabold">⌘</span></div>
            <div>
              <div className="font-bold leading-tight">SynergySphere</div>
              <div className="text-xs text-muted -mt-1">Make things simple.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden md:block">Hi {user.name || user.email.split('@')[0]}</span>
            <button className="text-sm underline text-muted" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="card relative overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-extrabold">Plan, align, ship.</h1>
            <p className="text-sm text-muted mt-1">Create projects and track progress at a glance.</p>
            <div className="mt-3 grid md:grid-cols-3 gap-2">
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Project name" />
              <input className="input md:col-span-2" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description (optional)" />
            </div>
            <div className="mt-3">
              <button className="btn" onClick={create}>Create Project</button>
            </div>
          </div>

          <div className="grid gap-3">
            {projects.map(p=>{
              const done = Number(p.done_count||0), total = Number(p.total_count||0);
              const pct = total? Math.round(done*100/total) : 0;
              return (
                <div key={p.id} className="card relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-lg">{p.name}</div>
                      <div className="text-xs text-muted">Created {new Date(p.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded-xl bg-white/10 text-sm hover:bg-white/15" onClick={()=>gotoProject(p.id)}>Open</button>
                      <button className="px-3 py-1 rounded-xl bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30" onClick={()=>remove(p.id)} title="Owner only">Delete</button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-white/10 rounded-full">
                      <div className="h-2 bg-brand rounded-full" style={{width:`${pct}%`}}></div>
                    </div>
                    <div className="text-xs text-muted mt-1">{done}/{total} tasks done • {pct}%</div>
                  </div>
                </div>
              )
            })}
            {projects.length===0 && <div className="card text-muted text-sm">No projects yet. Create your first project above.</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="text-sm text-muted mb-1">Today note</div>
            <div className="font-semibold">Kickoff standup at 4:00 PM</div>
            <div className="text-xs text-muted mt-2">20 min ago</div>
          </div>

          <div className="card">
            <div className="text-sm text-muted mb-2">My files</div>
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 h-24 grid place-items-center text-muted">No files yet</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted">Activity</div>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-lg">This month</span>
            </div>
            <div className="mt-2 h-12 rounded-xl bg-gradient-to-r from-brand/20 to-white/5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
