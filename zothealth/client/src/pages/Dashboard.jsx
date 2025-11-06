import React, { useEffect, useState } from 'react';
import { users, workouts, meals, ai } from '../lib/api';
export default function Dashboard(){
  const [me,setMe]=useState(null); const [wkts,setWkts]=useState([]); const [summary,setSummary]=useState(null);
  const today = new Date().toISOString().substring(0,10);
  useEffect(()=>{ users.me().then(setMe).catch(()=>{}); workouts.list().then(setWkts).catch(()=>{}); meals.dailySummary(today).then(setSummary).catch(()=>{}); },[]);
  async function genPlan(){ const plan = await ai.generatePlan({ goals: me?.goals || 'maintain', preferredExerciseTypes: me?.preferredExerciseTypes || [], experience: 'beginner' }); alert(`Generated plan: ${plan.title}`); }
  return (<div className="p-6 space-y-4"><h1 className="text-2xl font-semibold">Dashboard</h1>{me&&<div>Hello, {me.name}</div>}{summary&&<div>Today's calories: <b>{summary.totalCalories}</b></div>}<button className="px-3 py-2 border rounded" onClick={genPlan}>Generate Weekly Plan</button><div><h2 className="font-semibold mt-4 mb-2">Recent Workouts</h2><ul className="list-disc pl-5">{wkts.map((w)=> <li key={w._id}>{w.title} — {new Date(w.weekOf).toLocaleDateString()}</li>)}</ul></div></div>);
}
