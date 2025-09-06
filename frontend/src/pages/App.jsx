import React, { useEffect, useState } from 'react';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Project from './Project.jsx';

export default function App(){
  const [user, setUser] = useState(()=>{
    const x = localStorage.getItem('user');
    return x ? JSON.parse(x) : null;
  });
  const [route, setRoute] = useState(()=>location.hash.slice(1) || 'dashboard');
  const [params, setParams] = useState({});

  useEffect(()=>{
    const onHash = () => {
      const hash = location.hash.slice(1) || 'dashboard';
      if (hash.startsWith('project:')){
        const id = hash.split(':')[1];
        setRoute('project'); setParams({ id });
      } else setRoute(hash);
    };
    window.addEventListener('hashchange', onHash);
    onHash();
    return ()=>window.removeEventListener('hashchange', onHash);
  },[]);

  if (!user) {
    return (
      <Login onLogin={(u,t)=>{ localStorage.setItem('user',JSON.stringify(u)); localStorage.setItem('token',t); location.hash='dashboard'; location.reload(); }} />
    );
  }

  if (route==='project') {
    return <Project id={params.id} user={user} onBack={()=>{ location.hash='dashboard'; }} onLogout={()=>{ localStorage.clear(); location.reload(); }} />;
  }

  return <Dashboard user={user} gotoProject={(id)=>{ location.hash='project:'+id; }} onLogout={()=>{ localStorage.clear(); location.reload(); }} />;
}
