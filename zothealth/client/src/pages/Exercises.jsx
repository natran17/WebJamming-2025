import React, { useState } from 'react';
import { workouts } from '../lib/api';
export default function Exercises(){
  const [title,setTitle]=useState('Weekly Plan'); const [weekOf,setWeekOf]=useState(new Date().toISOString().substring(0,10)); const [status,setStatus]=useState('');
  async function submit(e){ e.preventDefault(); setStatus(''); try{ await workouts.create({ title, weekOf, days:[{ day:'monday', exercises:[{ name:'Jogging', timeMinutes:20 }] }] }); setStatus('Saved!'); }catch(e){ setStatus(e.message); } }
  return (<div className="p-6 max-w-xl"><h1 className="text-2xl font-semibold mb-4">Create Workout Plan</h1><form onSubmit={submit} className="space-y-3"><input className="border p-2 w-full" value={title} onChange={(e)=>setTitle(e.target.value)} /><input className="border p-2 w-full" type="date" value={weekOf} onChange={(e)=>setWeekOf(e.target.value)} /><button className="bg-black text-white px-4 py-2 rounded" type="submit">Save</button>{status&&<div className="mt-2">{status}</div>}</form></div>);
}
