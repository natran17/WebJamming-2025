import React, { useState } from 'react';
import { meals } from '../lib/api';
export default function MealPlanner(){
  const [date,setDate]=useState(new Date().toISOString().substring(0,10));
  const [item,setItem]=useState({ name:'', calories:0 }); const [status,setStatus]=useState('');
  async function add(e){ e.preventDefault(); setStatus(''); try{ await meals.create({ date, items:[{ ...item, calories: Number(item.calories) }] }); setStatus('Added!'); }catch(e){ setStatus(e.message); } }
  return (<div className="p-6 max-w-xl"><h1 className="text-2xl font-semibold mb-4">Meal Planner</h1><form onSubmit={add} className="space-y-3"><input className="border p-2 w-full" type="date" value={date} onChange={(e)=>setDate(e.target.value)} /><input className="border p-2 w-full" placeholder="Item name" value={item.name} onChange={(e)=>setItem({ ...item, name: e.target.value })} /><input className="border p-2 w-full" placeholder="Calories" value={item.calories} onChange={(e)=>setItem({ ...item, calories: e.target.value })} /><button className="bg-black text-white px-4 py-2 rounded" type="submit">Add</button>{status&&<div className="mt-2">{status}</div>}</form></div>);
}
