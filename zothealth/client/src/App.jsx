import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Exercises from './pages/Exercises.jsx';
import MealPlanner from './pages/MealPlanner.jsx';
import { auth, users, setAuthToken } from './lib/api.js';

function useRoute(){ const [path,setPath]=useState(window.location.pathname); useEffect(()=>{ const h=()=>setPath(window.location.pathname); window.addEventListener('popstate',h); return ()=>window.removeEventListener('popstate',h); },[]); function nav(to){ window.history.pushState({},'',to); setPath(to);} return { path, nav }; }
const routes = { '/':Home, '/login':Login, '/signup':Signup, '/dashboard':Dashboard, '/exercises':Exercises, '/meal-planner':MealPlanner };

export default function App(){
  const { path, nav } = useRoute(); const Page = routes[path] || Home; const [user,setUser]=useState(null);
  useEffect(()=>{ users.me().then(setUser).catch(()=>{}); },[]);
  async function handleLogout(){ await auth.logout(); setUser(null); setAuthToken(''); nav('/'); }
  return (<div className="min-h-screen"><NavBar user={user} onLogout={handleLogout} /><div className="max-w-5xl mx-auto"><Page onAuthed={(u)=>{ setUser(u); nav('/dashboard'); }} /></div></div>);
}
