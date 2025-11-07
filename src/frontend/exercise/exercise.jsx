import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../Navbar/NavBar';

import './exercise.css';


const exercise = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [plan, setPlan] = useState({ title: 'Weekly Plan', weekOf: new Date().toISOString(), days: [] });
  const token = useMemo(() => localStorage.getItem('accessToken') || '', []);
  const [planId, setPlanId] = useState(null);
  const [showAdd, setShowAdd] = useState([]); // per-day toggle
  const [newEx, setNewEx] = useState([]); // per-day form state
  const [logs, setLogs] = useState([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState(null);

  const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  useEffect(() => {
    const initDays = dayOrder.map(d => ({ day: d, exercises: [] }));
    setPlan(p => ({ ...p, days: initDays }));
    setShowAdd(dayOrder.map(()=>false));
    setNewEx(dayOrder.map(()=>({ name:'', mode:'sets', sets:'', reps:'', timeMinutes:'' })));
    loadLogs();
  }, []);

  async function openInfo(name){
    try{
      setInfoOpen(true); setInfoData({ loading:true, name });
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/wger/exercises?search=${encodeURIComponent(name)}&limit=1`);
      if(!res.ok) throw new Error('Failed to load exercise info');
      const j = await res.json();
      const item = (j.results||[])[0]||null;
      setInfoData({ loading:false, item });
    }catch(e){ setInfoData({ loading:false, error: e.message||'Failed to load' }); }
  }

  async function loadMyPlan(){
    try{
      if(!token) return alert('Please login first');
      const res = await fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` }});
      if(!res.ok) throw new Error('Failed to load plan');
      const items = await res.json();
      const latest = items?.[0];
      if(latest){ setPlanId(latest._id); setPlan({ title: latest.title, weekOf: latest.weekOf, days: latest.days }); }
      else {
        // fallback: try localStorage copy
        try{
          const cached = JSON.parse(localStorage.getItem('exerciseLocalPlan')||'null');
          if(cached && Array.isArray(cached.days)){
            setPlanId(null); setPlan(cached);
            alert('Loaded your last local plan');
          }else {
            alert('No saved plan found. Try Generate AI Plan.');
          }
        }catch{ alert('No saved plan found. Try Generate AI Plan.'); }
      }
    }catch(e){ alert(e.message || 'Error'); }
  }

  async function useOriginalPlan(){
    try{
      if(!token) return alert('Please login first');
      const res = await fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` }});
      if(!res.ok) throw new Error('Failed to load plan');
      const items = await res.json();
      const latest = items?.[0];
      if(latest){ setPlanId(latest._id); setPlan({ title: latest.title, weekOf: latest.weekOf, days: latest.days }); }
      else { alert('No original plan found. Build your week and click "Save Plan" once. Then "Use Original Plan" will restore it anytime.'); }
    }catch(e){ alert(e.message || 'Error'); }
  }

  async function generateAI(){
    try{
      if(!token) return alert('Please login first');
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goals:'maintain', preferredExerciseTypes:['cardio','legs'], experience:'beginner', salt: Date.now() })
      });
      if(!res.ok) throw new Error('Failed to generate plan');
      const data = await res.json();
      const next = { title: data.title || 'AI Generated Plan', weekOf: data.weekOf || new Date().toISOString(), days: Array.isArray(data.days)? data.days: [] };
      if(!next.days.length){ throw new Error('Empty AI plan'); }
      setPlanId(null);
      setPlan(next);
      try{ localStorage.setItem('exerciseLocalPlan', JSON.stringify(next)); }catch{}
    }catch(e){
      // Fallback: client-side randomized plan (non-destructive addition)
      const fallback = buildFallbackPlan();
      setPlanId(null);
      setPlan(fallback);
      try{ localStorage.setItem('exerciseLocalPlan', JSON.stringify(fallback)); }catch{}
      alert('AI service unavailable. Generated a local plan for you.');
    }
  }

  async function savePlan(){
    try{
      if(!token) return alert('Please login first');
      const url = planId ? `/api/workouts/${planId}` : '/api/workouts';
      const method = planId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: plan.title, weekOf: plan.weekOf, days: plan.days })
      });
      if(!res.ok){ const err=await res.json().catch(()=>({message:`HTTP ${res.status}`})); throw new Error(err.message||'Failed to save'); }
      if(!planId){ const saved = await res.json(); setPlanId(saved._id || planId); }
      try{ localStorage.setItem('exerciseLocalPlan', JSON.stringify(plan)); }catch{}
      alert('Plan saved');
    }catch(e){ alert(e.message || 'Error'); }
  }

  // Helper: client-side fallback plan builder
  function buildFallbackPlan(){
    const base = [
      { name:'Warm-up Run', timeMinutes: 10 },
      { name:'Push-ups', sets:3, reps:12 },
      { name:'Bodyweight Squats', sets:3, reps:15 },
      { name:'Plank', timeMinutes: 2 },
      { name:'Dumbbell Rows', sets:3, reps:10 },
      { name:'Lunges', sets:3, reps:12 },
      { name:'Jump Rope', timeMinutes: 12 },
      { name:'Bench Press', sets:3, reps:8 },
      { name:'Deadlift (light)', sets:3, reps:6 },
      { name:'Cycling', timeMinutes: 20 },
      { name:'Stretching', timeMinutes: 10 }
    ];
    const rnd = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
    const pick = ()=> structuredClone(base.sort(()=>Math.random()-0.5)).slice(0, rnd(3,5));
    return {
      title: 'AI Generated Plan (Local)',
      weekOf: new Date().toISOString(),
      days: dayOrder.map(d=>({ day:d, exercises: pick() }))
    };
  }

  function toggleAdd(index){
    const next = [...showAdd]; next[index] = !next[index]; setShowAdd(next);
  }

  function handleNewExChange(index, field, value){
    const next = [...newEx];
    next[index] = { ...next[index], [field]: value };
    setNewEx(next);
  }

  function addExerciseInline(index){
    const form = newEx[index] || {};
    const name = (form.name || '').trim();
    if(!name) return alert('Enter a name');
    const nextPlan = structuredClone(plan);
    const ex = { name, estimatedCaloriesBurned: 0 };
    if(form.mode === 'time'){
      const t = parseInt(form.timeMinutes, 10) || 10; ex.timeMinutes = t;
      delete ex.sets; delete ex.reps;
    }else{
      const sets = parseInt(form.sets, 10) || 3; const reps = parseInt(form.reps, 10) || 10;
      ex.sets = sets; ex.reps = reps; delete ex.timeMinutes;
    }
    nextPlan.days[index].exercises.push(ex);
    setPlan(nextPlan);
    // reset form
    handleNewExChange(index, 'name', '');
    handleNewExChange(index, 'sets', '');
    handleNewExChange(index, 'reps', '');
    handleNewExChange(index, 'timeMinutes', '');
  }

  function clearDay(index){
    const next = structuredClone(plan);
    next.days[index].exercises = [];
    setPlan(next);
  }

  function moveExercise(dayIdx, idx, dir){
    const next = structuredClone(plan);
    const arr = next.days[dayIdx].exercises;
    const target = idx + dir;
    if(target < 0 || target >= arr.length) return;
    const [item] = arr.splice(idx,1);
    arr.splice(target,0,item);
    setPlan(next);
  }

  function deleteExercise(dayIdx, idx){
    const next = structuredClone(plan);
    next.days[dayIdx].exercises.splice(idx,1);
    setPlan(next);
  }

  async function completeExercise(dayIdx, idx){
    try{
      const token = localStorage.getItem('accessToken') || '';
      if(!token) return alert('Please login first');
      const dayObj = plan.days[dayIdx] || {};
      const item = (dayObj.exercises || [])[idx];
      if(!item) return;
      const payload = {
        name: item.name,
        day: dayObj.day,
        sets: item.sets,
        reps: item.reps,
        timeMinutes: item.timeMinutes,
        estimatedCaloriesBurned: item.estimatedCaloriesBurned
      };
      const res = await fetch('/api/exercise-logs', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if(!res.ok){ const err=await res.json().catch(()=>({message:`HTTP ${res.status}`})); throw new Error(err.message||'Failed to log'); }
      // After logging, remove from the plan (acts like completed)
      deleteExercise(dayIdx, idx);
      alert('Exercise logged');
      await loadLogs();
    }catch(e){ alert(e.message || 'Failed to log'); }
  }

  async function loadLogs(){
    try{
      const token = localStorage.getItem('accessToken') || '';
      if(!token) return; // silently skip when not logged in
      const res = await fetch('/api/exercise-logs?limit=50', { headers:{ Authorization:`Bearer ${token}` }});
      if(!res.ok) return;
      const items = await res.json();
      setLogs(items||[]);
    }catch{}
  }

  function trackerCounts(){
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 6*24*60*60*1000; // inclusive 7-day window
    let today = 0, week = 0;
    for(const l of logs){
      const t = new Date(l.completedAt || l.createdAt || l.updatedAt || l._id?.toString().substring(0,8)*1000).getTime();
      if(!isNaN(t)){
        if(t >= startOfToday) today++;
        if(t >= sevenDaysAgo) week++;
      }
    }
    return { today, week };
  }

  return (
    <div className="planner-wrapper">
      <NavBar />

      <div className="planner-container">
        <a href="/" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </a>

        <h1 className="planner-title">Weekly Exercise Planner</h1>

        <div className="planner-actions">
          <button className="btn btn-secondary" onClick={loadMyPlan}>Load My Plan</button>
          <button className="btn btn-primary" onClick={generateAI}>Generate AI Plan</button>
          <button className="btn btn-secondary" onClick={useOriginalPlan}>Use Original Plan</button>
          <button className="btn btn-accent" onClick={savePlan}>Save Plan</button>
        </div>

        {infoOpen && (
          <div className="info-overlay" onClick={closeInfo}>
            <div className="info-modal" onClick={(e)=>e.stopPropagation()}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h2 style={{margin:0}}>Exercise Info</h2>
                <button className="mini-btn danger" onClick={closeInfo}>✕</button>
              </div>
              {!infoData || infoData.loading ? (
                <div style={{padding:'1rem'}}>Loading…</div>
              ) : infoData.error ? (
                <div style={{color:'#b91c1c'}}>{infoData.error}</div>
              ) : infoData.item ? (
                <div className="card">
                  <h3 style={{marginTop:0}}>{infoData.item.name}</h3>
                  {infoData.item.image ? (
                    <img alt={infoData.item.name} src={infoData.item.image} style={{maxWidth:'100%', borderRadius:8, marginBottom:'0.5rem'}} />
                  ) : null}
                  {infoData.item.description ? (
                    <div style={{color:'#374151'}} dangerouslySetInnerHTML={{__html: infoData.item.description}} />
                  ) : <p style={{color:'#6b7280'}}>No description available.</p>}
                </div>
              ) : (
                <div style={{padding:'1rem', color:'#6b7280'}}>No data found.</div>
              )}
            </div>
          </div>
        )}

        

        

        <div className="days-container">
          {plan.days.map((day, index) => (
            <div
              key={day.day || index}
              className={`day-card ${selectedDay === index ? 'active' : ''}`}
              onClick={() => setSelectedDay(index)}
            >
              <div className="day-header">
                <h2>{(day.day || '').charAt(0).toUpperCase() + (day.day || '').slice(1)}</h2>
                <p>Week of {new Date(plan.weekOf).toLocaleDateString()}</p>
              </div>

              <div className="day-items">
                {(day.exercises || []).map((item, i) => (
                  <div key={i} className="day-item">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      {item.timeMinutes ? `${item.timeMinutes} min` : `${item.sets || 0} x ${item.reps || 0}`}
                    </div>
                    <div className="item-actions">
                      <button className="mini-btn" onClick={(e)=>{e.stopPropagation(); moveExercise(index,i,-1);}}>↑</button>
                      <button className="mini-btn" onClick={(e)=>{e.stopPropagation(); moveExercise(index,i,1);}}>↓</button>
                      <button className="mini-btn" title="Info" onClick={(e)=>{e.stopPropagation(); openInfo(item.name);}}>i</button>
                      <button className="mini-btn danger" onClick={(e)=>{e.stopPropagation(); deleteExercise(index,i);}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="day-buttons">
                <button className="add-item" onClick={(e)=>{e.stopPropagation(); toggleAdd(index);}}>{showAdd[index]?'Cancel':' + Add Exercise'}</button>
                <button className="clear-item" onClick={(e)=>{e.stopPropagation(); clearDay(index);}}>Clear Day</button>
              </div>

              {showAdd[index] && (
                <div className="inline-form" onClick={(e)=>e.stopPropagation()}>
                  <div className="form-row">
                    <input className="form-input" placeholder="Name (e.g., Squats)" value={newEx[index]?.name||''} onChange={(e)=>handleNewExChange(index,'name',e.target.value)} />
                    <select className="form-select" value={newEx[index]?.mode||'sets'} onChange={(e)=>handleNewExChange(index,'mode',e.target.value)}>
                      <option value="sets">Sets/Reps</option>
                      <option value="time">Time (min)</option>
                    </select>
                  </div>
                  {newEx[index]?.mode !== 'time' ? (
                    <div className="form-row">
                      <input className="form-input small" placeholder="Sets" value={newEx[index]?.sets||''} onChange={(e)=>handleNewExChange(index,'sets',e.target.value)} />
                      <input className="form-input small" placeholder="Reps" value={newEx[index]?.reps||''} onChange={(e)=>handleNewExChange(index,'reps',e.target.value)} />
                    </div>
                  ) : (
                    <div className="form-row">
                      <input className="form-input small" placeholder="Minutes" value={newEx[index]?.timeMinutes||''} onChange={(e)=>handleNewExChange(index,'timeMinutes',e.target.value)} />
                    </div>
                  )}
                  <div className="form-actions">
                    <button className="btn btn-accent" onClick={()=>addExerciseInline(index)}>Add</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default exercise;