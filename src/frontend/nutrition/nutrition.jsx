import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './nutrition.css'
import NavBar from '../Navbar/NavBar';
import weekDays from './mealinfo.json'

const CUISINES = [
  { key:'american', label:'American' },
  { key:'asian', label:'Asian' },
  { key:'mediterranean', label:'Mediterranean' },
  { key:'mexican', label:'Mexican' },
  { key:'indian', label:'Indian' },
  { key:'italian', label:'Italian' },
  { key:'japanese', label:'Japanese' },
  { key:'thai', label:'Thai' },
  { key:'middleeastern', label:'Middle Eastern' }
];

const RESTRICTIONS = [
  { key:'vegetarian', label:'Vegetarian' },
  { key:'vegan', label:'Vegan' },
  { key:'glutenfree', label:'Gluten-free' },
  { key:'dairyfree', label:'Dairy-free' },
  { key:'halal', label:'Halal' },
  { key:'kosher', label:'Kosher' },
  { key:'nutfree', label:'Nut-free' }
];

const NutritionPlanner = () => {
  const [expandedMeals, setExpandedMeals] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [showQuiz, setShowQuiz] = useState(()=> localStorage.getItem('nutritionQuizDone') === '1' ? false : true);
  const [quiz, setQuiz] = useState({
    goals: 'maintain',
    cuisines: { american:false, asian:false, mediterranean:false, mexican:false, indian:false, italian:false, japanese:false, thai:false, middleeastern:false },
    restrictions: { vegetarian:false, vegan:false, glutenfree:false, dairyfree:false, halal:false, kosher:false, nutfree:false },
    sex: 'male',
    age: '',
    heightCm: '',
    weightKg: '',
    activity: 'moderate'
  });
  const [chat, setChat] = useState([{ role:'assistant', text: 'Hi! Tell me what you feel like eating, your goal, or where you are, and I\'ll suggest meals.' }]);
  const [chatInput, setChatInput] = useState('');
  const [days, setDays] = useState(()=> {
    const base = JSON.parse(JSON.stringify(weekDays||[]));
    // ensure breakfast exists for all days and seed with a default item (non-zero kcal)
    const bopts = [
      { name:'Greek yogurt bowl', calories: 400 },
      { name:'Oatmeal with banana & PB', calories: 380 },
      { name:'Eggs, toast & avocado', calories: 400 }
    ];
    base.forEach((d,idx)=>{
      if(!d.breakfast){ d.breakfast = { name:'Breakfast', items:[] }; }
      if(!Array.isArray(d.breakfast.items) || d.breakfast.items.length===0){
        const pick = bopts[idx % bopts.length];
        d.breakfast.items = [{ name: pick.name, calories: pick.calories }];
      }
    });
    return base;
  });
  const [doneMap, setDoneMap] = useState(()=>{ try{return JSON.parse(localStorage.getItem('nutritionDone')||'{}');}catch{return {}}});
  const [mealDoneMap, setMealDoneMap] = useState(()=>{ try{return JSON.parse(localStorage.getItem('nutritionMealDone')||'{}');}catch{return {}}});
  const [mealPrep, setMealPrep] = useState([]); // detailed multi-day plan


  const toggleMeal = (dayIndex, mealType) => {
    const key = `${dayIndex}-${mealType}`;
    setExpandedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDay = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const calculateMealCalories = (meal) => {
    return meal.items.reduce((sum, item) => sum + item.calories, 0);
  };

  const calculateDayCalories = (day) => {
    return calculateMealCalories(day.breakfast||{items:[]}) + calculateMealCalories(day.lunch) + calculateMealCalories(day.dinner);
  };

  function computeCalories(){
    const age = parseInt(quiz.age,10) || 25;
    const height = parseFloat(quiz.heightCm) || 170;
    const weight = parseFloat(quiz.weightKg) || 70;
    const sex = quiz.sex === 'female' ? 'female':'male';
    const bmr = sex==='male' ? (10*weight + 6.25*height - 5*age + 5) : (10*weight + 6.25*height - 5*age - 161);
    const factors = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryactive:1.9 };
    const actKey = quiz.activity;
    const tdee = bmr * (factors[actKey] || 1.55);
    let target = tdee;
    if(quiz.goals==='cut') target = tdee * 0.85;
    if(quiz.goals==='gain') target = tdee * 1.10;
    // round to nearest 50
    return Math.round(target/50)*50;
  }

  function generateMealPlan(){
    const prefs = getSavedPrefs();
    const options = pickFoodOptions(prefs, 12);
    const bbank = breakfastFoodBank();
    const pickTwo = (arr, start) => [arr[start % arr.length], arr[(start+1) % arr.length]];
    const next = JSON.parse(JSON.stringify(days));
    for(let i=0;i<next.length;i++){
      const bfOpt = bbank[i % bbank.length];
      const pair1 = pickTwo(options, i*3+1);
      const pair2 = pickTwo(options, i*3+2);
      next[i].breakfast = next[i].breakfast || { name:'Breakfast', items:[] };
      next[i].breakfast.items = [{ name: bfOpt.name, calories: bfOpt.calories }];
      next[i].lunch.items = pair1;
      next[i].dinner.items = pair2;
    }
    setDays(next);
  }

  function toggleDayDone(idx){
    const next = { ...(doneMap||{}) };
    next[idx] = !next[idx];
    setDoneMap(next);
    try{ localStorage.setItem('nutritionDone', JSON.stringify(next)); }catch{}
  }

  function toggleMealDone(dayIdx, mealKey){
    const next = { ...(mealDoneMap||{}) };
    const perDay = { ...(next[dayIdx]||{}) };
    perDay[mealKey] = !perDay[mealKey];
    next[dayIdx] = perDay;
    setMealDoneMap(next);
    try{ localStorage.setItem('nutritionMealDone', JSON.stringify(next)); }catch{}
  }

  function generateMealPrep(){
    // simple rules-based generator using target calories and cuisine bank
    const prefs = getSavedPrefs();
    const target = prefs?.dailyCalorieLimit || 1800;
    const bank = cuisineFoodBank();
    const pool = Object.keys(prefs?.cuisines||{}).filter(k=>prefs.cuisines[k]).flatMap(k=>bank[k]||[]);
    const pick = (n, off=0)=>{
      const src = pool.length?pool:Object.values(bank).flat();
      return Array.from({length:n}).map((_,i)=> src[(i+off)%src.length]);
    };
    const macroLine=(p,c,f)=>`Macros: ${p}g protein | ${c}g carbs | ${f}g fat`;
    const day = (idx)=>{
      const kcal = (pct)=> Math.round((target*pct)/10)*10;
      return {
        title:`Day ${idx+1}`,
        total: target,
        meals:[
          { name:'Breakfast', kcal:kcal(0.22), items:[ pick(1,idx)[0].name+' – '+kcal(0.22)+' kcal' ], macros: macroLine(25,50,12) },
          { name:'Lunch',     kcal:kcal(0.28), items:[ pick(1,idx+1)[0].name+' – '+kcal(0.28)+' kcal' ], macros: macroLine(35,35,18) },
          { name:'Snack',     kcal:kcal(0.12), items:[ 'Fruit or bar – '+kcal(0.12)+' kcal' ], macros: macroLine(12,22,8) },
          { name:'Dinner',    kcal:kcal(0.38), items:[ pick(1,idx+2)[0].name+' – '+kcal(0.38)+' kcal' ], macros: macroLine(35,35,20) },
        ]
      };
    };
    setMealPrep([day(0), day(1), day(2)]);
  }

  function getSavedPrefs(){
    try{ return JSON.parse(localStorage.getItem('nutritionQuiz')||'{}'); }catch{ return {}; }
  }

  function cuisineFoodBank(){
    return {
      american:[{name:'Grilled Chicken Salad',calories:420},{name:'Turkey Sandwich',calories:430}],
      asian:[{name:'Teriyaki Chicken Bowl',calories:520},{name:'Veggie Stir Fry',calories:380}],
      mediterranean:[{name:'Greek Salad with Feta',calories:350},{name:'Chicken Shawarma Bowl',calories:550}],
      mexican:[{name:'Chicken Burrito Bowl',calories:600},{name:'Veggie Tacos (2)',calories:420}],
      indian:[{name:'Chana Masala with Rice',calories:520},{name:'Tandoori Chicken + Salad',calories:480}],
      italian:[{name:'Margherita Flatbread',calories:520},{name:'Pasta Primavera',calories:540}],
      japanese:[{name:'Salmon Sushi (8pc)',calories:420},{name:'Chicken Udon',calories:560}],
      thai:[{name:'Pad Thai (Chicken)',calories:680},{name:'Tom Yum + Rice',calories:420}],
      middleeastern:[{name:'Falafel Bowl',calories:520},{name:'Chicken Kabob Plate',calories:600}],
    };
  }

  function breakfastFoodBank(){
    return [
      { name:'Greek yogurt (1 cup) + granola + berries', calories:400 },
      { name:'Oatmeal (1/2 cup oats) + banana + PB', calories:380 },
      { name:'2 eggs + toast + 1/2 avocado', calories:400 },
      { name:'Protein smoothie (milk, banana, protein)', calories:420 }
    ];
  }

  function pickFoodOptions(prefs, limit=6){
    const bank = cuisineFoodBank();
    const chosen = [];
    Object.keys(prefs?.cuisines||{}).forEach(k=>{ if(prefs.cuisines[k]) chosen.push(...(bank[k]||[])); });
    if(chosen.length===0){ Object.values(bank).forEach(list=> chosen.push(...list)); }
    return chosen.slice(0, limit);
  }

  function handleChatSend(e){
    e.preventDefault();
    const text = chatInput.trim(); if(!text) return;
    const prefs = getSavedPrefs();
    const suggestions = pickFoodOptions(prefs, 3).map(i=>`- ${i.name} (~${i.calories} cal)`).join('\n');
    const goal = prefs?.goals||'maintain';
    const reply = `Based on your goal (${goal}) and favorites, here are ideas:\n${suggestions}\nAsk me for high-protein or low-calorie options!`;
    setChat((c)=>[...c,{role:'user',text},{role:'assistant',text:reply}]);
    setChatInput('');
  }

  async function handleQuizSubmit(e){
    e.preventDefault();
    try{
      const dailyCalorieLimit = computeCalories();
      localStorage.setItem('nutritionQuiz', JSON.stringify({ ...quiz, dailyCalorieLimit }));
      localStorage.setItem('nutritionQuizDone','1');
      const token = localStorage.getItem('accessToken') || '';
      const payload = {};
      if(quiz.goals) payload.goals = quiz.goals;
      if(!isNaN(dailyCalorieLimit) && dailyCalorieLimit>0) payload.dailyCalorieLimit = dailyCalorieLimit;
      const h = parseFloat(quiz.heightCm); if(!isNaN(h) && h>0) payload.heightCm = h;
      const w = parseFloat(quiz.weightKg); if(!isNaN(w) && w>0) payload.weightKg = w;
      if(token && (payload.goals || payload.dailyCalorieLimit)){
        await fetch('/api/users/me', {
          method:'PUT',
          headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }
      setShowQuiz(false);
    }catch(err){
      alert('Failed to save preferences');
    }
  }

  return (
    <div className="nutrition-container">
        <NavBar/>
      {showQuiz && (
        <div className="quiz-overlay">
          <div className="quiz-modal">
            <h2 className="quiz-title">Tell us your preferences</h2>
            <form onSubmit={handleQuizSubmit}>
              <div className="quiz-section">
                <label className="quiz-label">Your goal</label>
                <select className="quiz-select" value={quiz.goals} onChange={e=>setQuiz(q=>({...q, goals:e.target.value}))}>
                  <option value="cut">Cut (lose weight)</option>
                  <option value="maintain">Maintain</option>
                  <option value="gain">Gain</option>
                </select>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">Preferred cuisines</label>
                <p className="quiz-help">Pick as many as you like. We’ll use these to suggest meals.</p>
                <div className="quiz-grid">
                  {CUISINES.map(c => (
                    <label key={c.key} className="quiz-checkbox">
                      <input type="checkbox" checked={!!quiz.cuisines[c.key]} onChange={e=>setQuiz(q=>({...q, cuisines:{...q.cuisines, [c.key]:e.target.checked}}))} />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">Dietary restrictions</label>
                <p className="quiz-help">We’ll avoid suggesting foods that don’t fit.</p>
                <div className="quiz-grid">
                  {RESTRICTIONS.map(r => (
                    <label key={r.key} className="quiz-checkbox">
                      <input type="checkbox" checked={!!quiz.restrictions[r.key]} onChange={e=>setQuiz(q=>({...q, restrictions:{...q.restrictions, [r.key]:e.target.checked}}))} />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">About you</label>
                <p className="quiz-help">We use this to estimate your daily energy needs.</p>
                <div className="quiz-grid">
                  <select className="quiz-select" value={quiz.sex} onChange={e=>setQuiz(q=>({...q, sex:e.target.value}))}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <input className="quiz-input" type="number" min="10" max="99" placeholder="Age" value={quiz.age} onChange={e=>setQuiz(q=>({...q, age:e.target.value}))} />
                  <input className="quiz-input" type="number" min="100" max="250" placeholder="Height (cm)" value={quiz.heightCm} onChange={e=>setQuiz(q=>({...q, heightCm:e.target.value}))} />
                  <input className="quiz-input" type="number" min="30" max="250" placeholder="Weight (kg)" value={quiz.weightKg} onChange={e=>setQuiz(q=>({...q, weightKg:e.target.value}))} />
                </div>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">Activity level</label>
                <p className="quiz-help">Choose the option that best matches an average week.</p>
                <select className="quiz-select" value={quiz.activity} onChange={e=>setQuiz(q=>({...q, activity:e.target.value}))}>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="veryactive">Very Active (physical job or intense training)</option>
                </select>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">Suggested daily calories</label>
                <div className="quiz-result">{computeCalories()} kcal/day (auto-calculated)</div>
              </div>

              <div className="quiz-actions">
                <button type="submit" className="quiz-submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {!showQuiz && (
      <div className="nutrition-wrapper">
        <button className="back-btn">
          <span className="mr-2">←</span>
          <span className="font-medium">Back to Home</span>
        </button>

        <h1 className="title">Weekly Nutrition Planner</h1>
        <div className="planner-cta-row">
          <button className="btn btn-primary ai-generate" onClick={generateMealPlan}>AI Generate Meal Plan</button>
          <button className="btn btn-accent ai-generate" onClick={generateMealPrep} style={{marginLeft:'.5rem'}}>AI Meal Prep (3 days)</button>
          <button className="btn btn-secondary ai-generate" onClick={()=>{ localStorage.removeItem('nutritionQuizDone'); window.location.reload(); }} style={{marginLeft:'.5rem'}}>Change Preferences</button>
        </div>

        {/* Calorie target + progress (for today) */}
        <CalorieSummary days={days} mealDoneMap={mealDoneMap} />

        <div className="nutrition-layout">
          <div className="nutrition-main">
            {/* Food options based on cuisines */}
            <FoodOptions />

            {mealPrep.length>0 && (
              <div className="prep-card">
                {mealPrep.map((d,di)=> (
                  <div key={di} className="prep-day">
                    <div className="prep-day-title">🗓 {d.title} <span className="prep-total">Total: ~{d.total} kcal</span></div>
                    {d.meals.map((m,mi)=> (
                      <div key={mi} className="prep-meal">
                        <div className="prep-meal-name">{m.name} <span className="prep-kcal">({m.kcal} kcal)</span></div>
                        <ul className="prep-list">
                          {m.items.map((it,ii)=>(<li key={ii}>{it}</li>))}
                        </ul>
                        <div className="prep-macros">{m.macros}</div>
                        <div className="prep-instructions">Prep: Preheat pan/oven, cook protein until done, assemble with grains/veg, finish with sauce or drizzle. Adjust portions to meet kcal.</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="nutrition-grid">
              {days.map((day, dayIndex) => {
                const dayCalories = calculateDayCalories(day);

                return (
                  <div key={dayIndex} className="day-card">
                    <button
                      onClick={() => toggleDay(dayIndex)}
                      className="day-header"
                    >
                      <div>
                        <h2 className="day-name">{day.day}</h2>
                        <p className="day-date">{day.date}</p>
                        <p className="day-total">Total: {dayCalories} cal</p>
                      </div>
                      <div className="day-actions">
                        <button
                          type="button"
                          className={`day-done-toggle ${doneMap?.[dayIndex]? 'done' : ''}`}
                          onClick={(e)=>{ e.stopPropagation(); toggleDayDone(dayIndex); }}
                        >{doneMap?.[dayIndex]? '✓ Done' : 'Mark Done'}</button>
                      </div>
                      {expandedDays[dayIndex] ? (
                        <ChevronUp className="icon" />
                      ) : (
                        <ChevronDown className="icon" />
                      )}
                    </button>

                    {expandedDays[dayIndex] && (
                      <div className="day-details">
                        {/* Breakfast */}
                        <div className="meal-card">
                          <button
                            onClick={() => toggleMeal(dayIndex, "breakfast")}
                            className="meal-header"
                          >
                            <div className="flex-1">
                              <h3 className="meal-title">Breakfast</h3>
                              <p className="meal-name">{(day.breakfast&&day.breakfast.name)||'Breakfast'}</p>
                              <p className="meal-calories">
                                {calculateMealCalories(day.breakfast||{items:[]})} cal
                              </p>
                            </div>
                            <button
                              type="button"
                              className={`day-done-toggle ${mealDoneMap?.[dayIndex]?.breakfast? 'done' : ''}`}
                              onClick={(e)=>{ e.stopPropagation(); toggleMealDone(dayIndex,'breakfast'); }}
                            >{mealDoneMap?.[dayIndex]?.breakfast? '✓ Done' : 'Mark Done'}</button>
                            {expandedMeals[`${dayIndex}-breakfast`] ? (
                              <ChevronUp className="icon-small" />
                            ) : (
                              <ChevronDown className="icon-small" />
                            )}
                          </button>

                          {expandedMeals[`${dayIndex}-breakfast`] && (
                            <div className="meal-items">
                              {(day.breakfast?.items||[]).map((item, itemIndex) => (
                                <div key={itemIndex} className="meal-item">
                                  <span>{item.name}</span>
                                  <span>{item.calories} cal</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Lunch */}
                        <div className="meal-card">
                          <button
                            onClick={() => toggleMeal(dayIndex, "lunch")}
                            className="meal-header"
                          >
                            <div className="flex-1">
                              <h3 className="meal-title">Lunch</h3>
                              <p className="meal-name">{day.lunch.name}</p>
                              <p className="meal-calories">
                                {calculateMealCalories(day.lunch)} cal
                              </p>
                            </div>
                            <button
                              type="button"
                              className={`day-done-toggle ${mealDoneMap?.[dayIndex]?.lunch? 'done' : ''}`}
                              onClick={(e)=>{ e.stopPropagation(); toggleMealDone(dayIndex,'lunch'); }}
                            >{mealDoneMap?.[dayIndex]?.lunch? '✓ Done' : 'Mark Done'}</button>
                            {expandedMeals[`${dayIndex}-lunch`] ? (
                              <ChevronUp className="icon-small" />
                            ) : (
                              <ChevronDown className="icon-small" />
                            )}
                          </button>

                          {expandedMeals[`${dayIndex}-lunch`] && (
                            <div className="meal-items">
                              {day.lunch.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="meal-item">
                                  <span>{item.name}</span>
                                  <span>{item.calories} cal</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dinner */}
                        <div className="meal-card">
                          <button
                            onClick={() => toggleMeal(dayIndex, "dinner")}
                            className="meal-header"
                          >
                            <div className="flex-1">
                              <h3 className="meal-title">Dinner</h3>
                              <p className="meal-name">{day.dinner.name}</p>
                              <p className="meal-calories">
                                {calculateMealCalories(day.dinner)} cal
                              </p>
                            </div>
                            <button
                              type="button"
                              className={`day-done-toggle ${mealDoneMap?.[dayIndex]?.dinner? 'done' : ''}`}
                              onClick={(e)=>{ e.stopPropagation(); toggleMealDone(dayIndex,'dinner'); }}
                            >{mealDoneMap?.[dayIndex]?.dinner? '✓ Done' : 'Mark Done'}</button>
                            {expandedMeals[`${dayIndex}-dinner`] ? (
                              <ChevronUp className="icon-small" />
                            ) : (
                              <ChevronDown className="icon-small" />
                            )}
                          </button>

                          {expandedMeals[`${dayIndex}-dinner`] && (
                            <div className="meal-items">
                              {day.dinner.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="meal-item">
                                  <span>{item.name}</span>
                                  <span>{item.calories} cal</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
          {/* Right sidebar: Chat assistant */}
          <aside className="nutrition-aside">
            <div className="chat-card">
              <div className="chat-title">Meal Assistant</div>
              <div className="chat-body">
                {chat.map((m,i)=> (
                  <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
                ))}
              </div>
              <form className="chat-input-row" onSubmit={handleChatSend}>
                <input className="chat-input" value={chatInput} placeholder="Ask for ideas..." onChange={e=>setChatInput(e.target.value)} />
                <button className="chat-send" type="submit">Send</button>
              </form>
            </div>
          </aside>
        </div>

        <div className="nutrition-divider"></div>
      </div>
      )}
    </div>
  );
}

function CalorieSummary({ days, mealDoneMap }){
  const ReactRef = React;
  const [consumed, setConsumed] = ReactRef.useState(0);
  const prefs = (()=>{ try{return JSON.parse(localStorage.getItem('nutritionQuiz')||'{}');}catch{return {};}})();
  const target = prefs?.dailyCalorieLimit || 2000;

  ReactRef.useEffect(()=>{
    const today = (days && days[0]) ? days[0] : { breakfast:{items:[]}, lunch:{items:[]}, dinner:{items:[]} };
    const done = mealDoneMap?.[0] || {};
    const kcal = (arr)=> (arr||[]).reduce((s,i)=> s + (i.calories||0), 0);
    const total = (done.breakfast? kcal(today.breakfast?.items):0)
               + (done.lunch? kcal(today.lunch?.items):0)
               + (done.dinner? kcal(today.dinner?.items):0);
    setConsumed(total);
  }, [days, mealDoneMap]);

  const pct = Math.min(100, Math.round((consumed/target)*100));
  return (
    <div className="calorie-summary">
      <div className="calorie-meta">
        <div className="calorie-title">Today</div>
        <div className="calorie-numbers"><span className="calorie-consumed">{consumed}</span><span className="calorie-sep">/</span><span className="calorie-target">{target}</span> <span className="calorie-unit">kcal</span></div>
      </div>
      <CircularProgress percent={pct} />
    </div>
  );
}

function CircularProgress({ percent=0 }){
  const r = 32; // smaller radius for compact chart
  const c = 2 * Math.PI * r;
  const off = c - (percent/100)*c;
  return (
    <svg className="circular" viewBox="0 0 100 100" aria-label={`Progress ${percent}%`}>
      <circle className="circular-bg" cx="50" cy="50" r={r} />
      <circle className="circular-fg" cx="50" cy="50" r={r} strokeDasharray={c} strokeDashoffset={off} />
      <text x="50" y="54" textAnchor="middle" className="circular-text">{percent}%</text>
    </svg>
  );
}

function FoodOptions(){
  const prefs = (()=>{ try{return JSON.parse(localStorage.getItem('nutritionQuiz')||'{}');}catch{return {};}})();
  const options = (function(){
    const bank = {
      american:[{name:'Grilled Chicken Salad',calories:420},{name:'Turkey Sandwich',calories:430}],
      asian:[{name:'Teriyaki Chicken Bowl',calories:520},{name:'Veggie Stir Fry',calories:380}],
      mediterranean:[{name:'Greek Salad with Feta',calories:350},{name:'Chicken Shawarma Bowl',calories:550}],
      mexican:[{name:'Chicken Burrito Bowl',calories:600},{name:'Veggie Tacos (2)',calories:420}],
      indian:[{name:'Chana Masala with Rice',calories:520},{name:'Tandoori Chicken + Salad',calories:480}],
      italian:[{name:'Margherita Flatbread',calories:520},{name:'Pasta Primavera',calories:540}],
      japanese:[{name:'Salmon Sushi (8pc)',calories:420},{name:'Chicken Udon',calories:560}],
      thai:[{name:'Pad Thai (Chicken)',calories:680},{name:'Tom Yum + Rice',calories:420}],
      middleeastern:[{name:'Falafel Bowl',calories:520},{name:'Chicken Kabob Plate',calories:600}],
    };
    const picked=[]; Object.keys(prefs?.cuisines||{}).forEach(k=>{ if(prefs.cuisines[k]) picked.push(...(bank[k]||[])); });
    return picked.length?picked.slice(0,6):Object.values(bank).flat().slice(0,6);
  })();
  return (
    <div className="options-card">
      <div className="options-title">Suggested Meals</div>
      <div className="options-grid">
        {options.map((o,i)=> (
          <div key={i} className="option-pill">
            <div className="option-name">{o.name}</div>
            <div className="option-cal">{o.calories} cal</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NutritionPlanner;