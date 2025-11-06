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

  const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  useEffect(() => {
    const initDays = dayOrder.map(d => ({ day: d, exercises: [] }));
    setPlan(p => ({ ...p, days: initDays }));
    setShowAdd(dayOrder.map(()=>false));
    setNewEx(dayOrder.map(()=>({ name:'', mode:'sets', sets:'', reps:'', timeMinutes:'' })));
  }, []);

  async function loadMyPlan(){
    try{
      if(!token) return alert('Please login first');
      const res = await fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` }});
      if(!res.ok) throw new Error('Failed to load plan');
      const items = await res.json();
      const latest = items?.[0];
      if(latest){ setPlanId(latest._id); setPlan({ title: latest.title, weekOf: latest.weekOf, days: latest.days }); }
      else { alert('No saved plan found. Try Generate AI Plan.'); }
    }catch(e){ alert(e.message || 'Error'); }
  }

  async function generateAI(){
    try{
      if(!token) return alert('Please login first');
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goals:'maintain', preferredExerciseTypes:['cardio','legs'], experience:'beginner' })
      });
      if(!res.ok) throw new Error('Failed to generate plan');
      const data = await res.json();
      setPlanId(null);
      setPlan({ title: data.title || 'AI Generated Plan', weekOf: data.weekOf, days: data.days || [] });
    }catch(e){ alert(e.message || 'Error'); }
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
      alert('Plan saved');
    }catch(e){ alert(e.message || 'Error'); }
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
          <button className="btn btn-accent" onClick={savePlan}>Save Plan</button>
        </div>

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