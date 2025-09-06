
import React, { useState } from 'react';
import { login, register } from '../services/api';

export default function Login({ onLogin }){
  const [mode,setMode] = useState('login');
  const [email,setEmail]=useState('sahil@example.com');
  const [password,setPassword]=useState('password');
  const [name,setName]=useState('Sahil');
  const [error,setError]=useState('');

  const submit = async (e)=>{
    e.preventDefault();
    try{
      let res;
      if (mode==='login') res = await login({ email, password });
      else res = await register({ name, email, password });
      onLogin(res.user, res.token);
    }catch(err){
      setError(err.response?.data?.error || 'Failed');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">SynergySphere</h1>
        <p className="text-muted mb-6">{mode==='login' ? 'Welcome back — align and execute.' : 'Create your account — start orchestrating.'}</p>
        <form onSubmit={submit} className="space-y-3">
          {mode==='register' && (
            <div>
              <label className="block mb-1">Name</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
            </div>
          )}
          <div>
            <label className="block mb-1">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button className="btn w-full mt-2">{mode==='login'?'Log in':'Create account'}</button>
        </form>
        <div className="text-sm mt-4">
          {mode==='login' ? (
            <>No account? <button className="link" onClick={()=>setMode('register')}>Sign up</button></>
          ) : (
            <>Have an account? <button className="link" onClick={()=>setMode('login')}>Log in</button></>
          )}
        </div>
        <div className="text-xs text-muted mt-4">Tip: use the seeded user <b>sahil@example.com</b> / <b>password</b></div>
      </div>
    </div>
  )
}
