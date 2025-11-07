import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './nutrition.css'
import NavBar from '../Navbar/NavBar';
import weekDays from './mealinfo.json'

  function totalForMeal(items){ return (items||[]).reduce((s,i)=> s + (parseInt(i.calories,10)||0), 0); }
  function totalForDay(day, mealDone, dayIndex){
    const all = {
      breakfast: totalForMeal(day?.breakfast?.items||[]),
      lunch: totalForMeal(day?.lunch?.items||[]),
      dinner: totalForMeal(day?.dinner?.items||[])
    };


    if(!mealDone) return all.breakfast + all.lunch + all.dinner;
    const key = (m)=> `${dayIndex}-${m}`;
    let sum = 0;
    if(mealDone[key('breakfast')]) sum += all.breakfast;
    if(mealDone[key('lunch')]) sum += all.lunch;
    if(mealDone[key('dinner')]) sum += all.dinner;
    return sum;
  }

  

  

  function CalorieSummary({ days, mealDoneMap }){
    const prefs = (()=>{ try{return JSON.parse(localStorage.getItem('nutritionQuiz')||'{}');}catch{return {};}})();
    const target = (typeof prefs.dailyCalorieLimit==='number' && prefs.dailyCalorieLimit>0)
      ? Math.round(prefs.dailyCalorieLimit/50)*50
      : 2000;
    const today = days && days[0] ? days[0] : { breakfast:{items:[]}, lunch:{items:[]}, dinner:{items:[]} };
    const consumed = totalForDay(today, null, 0);
    const pct = Math.max(0, Math.min(100, Math.round((consumed/target)*100)));
    const over = Math.max(0, consumed - target);
    const remain = Math.max(0, target - consumed);
    return (
      <div className="calorie-summary">
        <div className="calorie-meta">
          <div><strong>Today:</strong> {consumed} / {target} kcal</div>
          <div className="calorie-pct">{pct}%</div>
        </div>
        <div className="calorie-bar"><div className="calorie-fill" style={{width:`${pct}%`}} /></div>
        <div style={{marginTop:'.25rem', fontWeight:600, color: over>0? '#b91c1c':'#065f46'}}>
          {over>0 ? `Over by ${over} kcal` : `Remaining ${remain} kcal`}
        </div>
      </div>
    );
  }

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
  const [customInputs, setCustomInputs] = useState({}); // key: `${dayIndex}-${meal}` -> {name, calories, serving}
  const [planMode, setPlanMode] = useState('ai'); // 'ai' | 'custom'


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
    const items = (meal && Array.isArray(meal.items)) ? meal.items : [];
    return items.reduce((sum, item) => sum + (parseInt(item.calories,10)||0), 0);
  };

  const calculateDayCalories = (day) => {
    return calculateMealCalories(day.breakfast||{items:[]}) + calculateMealCalories(day.lunch||{items:[]}) + calculateMealCalories(day.dinner||{items:[]});
  };

  function computeCaloriesFromData(data){
    const age = parseInt(data?.age,10) || 25;
    const height = parseFloat(data?.heightCm) || 170;
    const weight = parseFloat(data?.weightKg) || 70;
    const sex = (data?.sex === 'female') ? 'female' : 'male';
    const bmr = sex==='male' ? (10*weight + 6.25*height - 5*age + 5) : (10*weight + 6.25*height - 5*age - 161);
    const factors = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryactive:1.9 };
    const actKey = data?.activity || 'moderate';
    const tdee = bmr * (factors[actKey] || 1.55);
    let target = tdee;
    const goal = data?.goals || 'maintain';
    if(goal==='cut') target = tdee * 0.85;
    if(goal==='gain') target = tdee * 1.10;
    return Math.round(target/50)*50;
  }

  function computeCalories(){
    return computeCaloriesFromData(quiz);
  }

  function generateMealPlan(){
    const prefs = getSavedPrefs();
    const salt = Math.floor(Math.random()*100000);
    const target = getDailyTarget();
    const bBudget = Math.round(target * 0.25);
    const lBudget = Math.round(target * 0.35);
    const dBudget = target - bBudget - lBudget; // ensure sums to target

    const allOptions = pickFoodOptions(prefs, 60);
    const options = shuffle(allOptions);
    const bbank = shuffle(breakfastFoodBank());

    const next = JSON.parse(JSON.stringify(days));
    for(let i=0;i<next.length;i++){
      const used = new Set();
      // Breakfast: closest single item to breakfast budget
      const bfOpt = closestItem(bbank, bBudget);
      used.add(bfOpt.name);

      // Lunch/Dinner: best pairs close to each budget
      const pair1 = bestPairToBudget(options, lBudget, used);
      used.add(pair1[0].name); used.add(pair1[1].name);
      const pair2 = bestPairToBudget(options, dBudget, used);

      next[i].breakfast = next[i].breakfast || { name:'Breakfast', items:[] };
      next[i].breakfast.items = [{ name: bfOpt.name, calories: bfOpt.calories }];
      next[i].lunch.items = pair1.map(p=>({ name:p.name, calories:p.calories }));
      next[i].dinner.items = pair2.map(p=>({ name:p.name, calories:p.calories }));
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

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }

  function getDailyTarget(){
    const prefs = getSavedPrefs();
    if(prefs && typeof prefs.dailyCalorieLimit === 'number' && prefs.dailyCalorieLimit>0){
      return Math.round(prefs.dailyCalorieLimit/50)*50;
    }
    // fallback to prefs fields if present, else current quiz, else safe default
    const fromPrefs = computeCaloriesFromData(prefs||{});
    if(fromPrefs && !isNaN(fromPrefs)) return fromPrefs;
    return 2000;
  }

  function closestItem(bank, budget){
    let best = bank[0]; let diff = Math.abs(bank[0].calories - budget);
    for(const it of bank){ const d = Math.abs(it.calories - budget); if(d < diff){ best = it; diff = d; } }
    return best;
  }

  function bestPairToBudget(options, budget, usedNames){
    // limit search to first 18 to keep it fast
    const arr = options.slice(0, Math.min(18, options.length));
    let best = [arr[0], arr[1]]; let bestDiff = Math.abs(arr[0].calories + arr[1].calories - budget);
    for(let i=0;i<arr.length;i++){
      for(let j=i+1;j<arr.length;j++){
        if(usedNames.has(arr[i].name) || usedNames.has(arr[j].name)) continue;
        const sum = arr[i].calories + arr[j].calories;
        const d = Math.abs(sum - budget);
        if(d < bestDiff){ best = [arr[i], arr[j]]; bestDiff = d; }
      }
    }
    return best;
  }

  function pickFoodOptions(prefs, limit=6){
    const bank = cuisineFoodBank();
    const chosen = [];
    Object.keys(prefs?.cuisines||{}).forEach(k=>{ if(prefs.cuisines[k]) chosen.push(...(bank[k]||[])); });
    if(chosen.length===0){ Object.values(bank).forEach(list=> chosen.push(...list)); }
    return chosen.slice(0, limit);
  }

  function servingFor(name=''){
    const n = (name||'').toLowerCase();
    const map = [
      [/yogurt|greek/, '1 cup'],
      [/granola/, '1/4 cup'],
      [/berries|fruit/, '1 cup'],
      [/oatmeal|oats/, '1/2 cup dry'],
      [/banana/, '1 medium'],
      [/peanut butter|pb/, '1 tbsp'],
      [/egg/, '2 eggs'],
      [/toast|bread/, '1 slice'],
      [/avocado/, '1/2 avocado'],
      [/smoothie/, '12 oz'],
      [/chicken/, '5 oz'],
      [/turkey/, '4 oz'],
      [/beef|pork/, '5 oz'],
      [/shrimp/, '5 oz'],
      [/tofu/, '150 g'],
      [/rice|quinoa/, '3/4 cup cooked'],
      [/pasta|udon/, '1.5 cups cooked'],
      [/salad|greens|bowl/, '2 cups'],
      [/taco|tortilla/, '2 pieces'],
      [/sushi|pieces/, '8 pieces'],
      [/broccoli|veggie|vegetable|asparagus|green beans/, '1 cup']
    ];
    for(const [re,serv] of map){ if(re.test(n)) return serv; }
    return '1 serving';
  }

  function setCustomField(dayIndex, meal, field, value){
    const key = `${dayIndex}-${meal}`;
    setCustomInputs(prev => ({
      ...prev,
      [key]: { ...(prev[key]||{}), [field]: value }
    }));
  }

  function addCustomItem(dayIndex, meal){
    const key = `${dayIndex}-${meal}`;
    const data = customInputs[key]||{};
    const name = (data.name||'').trim();
    const cal = parseInt(data.calories,10);
    const serving = (data.serving||'').trim();
    if(!name || !Number.isFinite(cal) || cal <= 0){ return; }
    const next = JSON.parse(JSON.stringify(days));
    if(!next[dayIndex][meal]) next[dayIndex][meal] = { name: meal[0].toUpperCase()+meal.slice(1), items:[] };
    next[dayIndex][meal].items.push({ name, calories: cal, ...(serving?{serving}:{} ) });
    setDays(next);
    setCustomInputs(prev=>({ ...prev, [key]: { name:'', calories:'', serving:'' } }));
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

  function assignSuggested(opt, dayIndex, mealKey){
    try{
      const next = JSON.parse(JSON.stringify(days));
      const key = mealKey || 'lunch';
      if(!next[dayIndex][key]) next[dayIndex][key] = { name: key[0].toUpperCase()+key.slice(1), items:[] };
      next[dayIndex][key].items = [{ name: opt.name, calories: opt.calories }];
      setDays(next);
    }catch{}
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
        <div className="planner-cta-row" style={{marginTop:'.25rem'}}>
          <div style={{fontWeight:700, marginRight:'.5rem'}}>Plan mode:</div>
          <button
            className={`btn ${planMode==='ai'?'btn-primary':'btn-secondary'}`}
            onClick={()=>{ setPlanMode('ai'); generateMealPlan(); }}
          >Use AI plan</button>
          <button
            className={`btn ${planMode==='custom'?'btn-primary':'btn-secondary'}`}
            onClick={()=>{ setPlanMode('custom'); clearWeek(); }}
            style={{marginLeft:'.5rem'}}
          >Add your own</button>
        </div>
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
            <FoodOptions days={days} onAssign={assignSuggested} />

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
                                  <span>{item.name} <span style={{color:'#6b7280'}}>({item.serving || servingFor(item.name)})</span></span>
                                  <span>{item.calories} cal</span>
                                </div>
                              ))}
                              <div className="meal-item" style={{gap:'0.5rem', alignItems:'flex-end'}}>
                                <input
                                  type="text"
                                  placeholder="Item name"
                                  value={(customInputs[`${dayIndex}-breakfast`]||{}).name||''}
                                  onChange={e=>setCustomField(dayIndex,'breakfast','name',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'40%'}}
                                />
                                <input
                                  type="number"
                                  placeholder="Calories"
                                  value={(customInputs[`${dayIndex}-breakfast`]||{}).calories||''}
                                  onChange={e=>setCustomField(dayIndex,'breakfast','calories',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'25%'}}
                                />
                                <input
                                  type="text"
                                  placeholder="Serving"
                                  value={(customInputs[`${dayIndex}-breakfast`]||{}).serving||''}
                                  onChange={e=>setCustomField(dayIndex,'breakfast','serving',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'25%'}}
                                />
                                <button className="btn-primary" onClick={()=>addCustomItem(dayIndex,'breakfast')}>Add</button>
                              </div>
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
                              <p className="meal-name">{(day.lunch && day.lunch.name) || 'Lunch'}</p>
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
                              {(day.lunch?.items||[]).map((item, itemIndex) => (
                                <div key={itemIndex} className="meal-item">
                                  <span>{item.name} <span style={{color:'#6b7280'}}>({item.serving || servingFor(item.name)})</span></span>
                                  <span>{item.calories} cal</span>
                                </div>
                              ))}
                              <div className="meal-item" style={{gap:'0.5rem', alignItems:'flex-end'}}>
                                <input
                                  type="text"
                                  placeholder="Item name"
                                  value={(customInputs[`${dayIndex}-lunch`]||{}).name||''}
                                  onChange={e=>setCustomField(dayIndex,'lunch','name',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'40%'}}
                                />
                                <input
                                  type="number"
                                  placeholder="Calories"
                                  value={(customInputs[`${dayIndex}-lunch`]||{}).calories||''}
                                  onChange={e=>setCustomField(dayIndex,'lunch','calories',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'25%'}}
                                />
                                <input
                                  type="text"
                                  placeholder="Serving"
                                  value={(customInputs[`${dayIndex}-lunch`]||{}).serving||''}
                                  onChange={e=>setCustomField(dayIndex,'lunch','serving',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'25%'}}
                                />
                                <button className="btn-primary" onClick={()=>addCustomItem(dayIndex,'lunch')}>Add</button>
                              </div>
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
                              <p className="meal-name">{(day.dinner && day.dinner.name) || 'Dinner'}</p>
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
                              {(day.dinner?.items||[]).map((item, itemIndex) => (
                                <div key={itemIndex} className="meal-item">
                                  <span>{item.name} <span style={{color:'#6b7280'}}>({item.serving || servingFor(item.name)})</span></span>
                                  <span>{item.calories} cal</span>
                                </div>
                              ))}
                              <div className="meal-item" style={{gap:'0.5rem', alignItems:'flex-end'}}>
                                <input
                                  type="text"
                                  placeholder="Item name"
                                  value={(customInputs[`${dayIndex}-dinner`]||{}).name||''}
                                  onChange={e=>setCustomField(dayIndex,'dinner','name',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'40%'}}
                                />
                                <input
                                  type="number"
                                  placeholder="Calories"
                                  value={(customInputs[`${dayIndex}-dinner`]||{}).calories||''}
                                  onChange={e=>setCustomField(dayIndex,'dinner','calories',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'25%'}}
                                />
                                <input
                                  type="text"
                                  placeholder="Serving"
                                  value={(customInputs[`${dayIndex}-dinner`]||{}).serving||''}
                                  onChange={e=>setCustomField(dayIndex,'dinner','serving',e.target.value)}
                                  className="quiz-input"
                                  style={{maxWidth:'25%'}}
                                />
                                <button className="btn-primary" onClick={()=>addCustomItem(dayIndex,'dinner')}>Add</button>
                              </div>
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

function FoodOptions({ days=[], onAssign }){
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
  const [open, setOpen] = React.useState(-1);
  const [selDay, setSelDay] = React.useState(0);
  const [selMeal, setSelMeal] = React.useState('lunch');
  const dayNames = days.map(d=> d?.day || 'Day');
  return (
    <div className="options-card">
      <div className="options-title">Suggested Meals</div>
      <div className="options-grid">
        {options.map((o,i)=> (
          <div key={i} className="option-pill" onClick={()=> setOpen(open===i? -1 : i)} style={{cursor:'pointer'}}>
            <div className="option-name">{o.name}</div>
            <div className="option-cal">{o.calories} cal</div>
          </div>
        ))}
      </div>
      {open>-1 && (
        <div className="card" style={{marginTop:'.5rem'}}>
          <div style={{fontWeight:700, marginBottom:6}}>{options[open]?.name}</div>
          <div style={{color:'#6b7280', marginBottom:8}}>Quick how-to: Build a balanced plate. Aim for protein + fiber. Adjust portions to meet calories.</div>
          <div style={{display:'flex', gap:'.5rem', alignItems:'center', flexWrap:'wrap'}}>
            <select className="quiz-select" value={selDay} onChange={e=>setSelDay(parseInt(e.target.value,10))} style={{maxWidth:'200px'}}>
              {dayNames.map((n,di)=> (<option key={di} value={di}>{n||`Day ${di+1}`}</option>))}
            </select>
            <select className="quiz-select" value={selMeal} onChange={e=>setSelMeal(e.target.value)} style={{maxWidth:'180px'}}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
            <button className="btn btn-primary" onClick={()=> onAssign && onAssign(options[open], selDay, selMeal)}>Use for this day</button>
            <button className="btn btn-secondary" onClick={()=> setOpen(-1)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NutritionPlanner;