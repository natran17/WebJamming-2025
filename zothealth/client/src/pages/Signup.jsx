import React, { useState } from 'react';
import { auth, setAuthToken, users } from '../lib/api';
export default function Signup({ onAuthed }) {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState('');
  async function submit(e){ e.preventDefault(); setError(''); try{ const res = await auth.register({ name, email, password }); setAuthToken(res.accessToken); const me = await users.me(); onAuthed(me);}catch(e){ setError(e.message); } }
  return (<div className="p-6 max-w-md mx-auto"><h2 className="text-2xl font-semibold mb-4">Create account</h2>{error&&<div className="text-red-600 mb-2">{error}</div>}<form onSubmit={submit} className="space-y-3"><input className="border p-2 w-full" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} /><input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} /><button className="bg-black text-white px-4 py-2 rounded" type="submit">Sign up</button></form></div>);
}
