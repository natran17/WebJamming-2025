import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './nutrition.css'
import NavBar from '../Navbar/NavBar';
import weekDays from './mealinfo.json'

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
    return calculateMealCalories(day.lunch) + calculateMealCalories(day.dinner);
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
                <div className="quiz-grid">
                  {Object.keys(quiz.cuisines).map(key=> (
                    <label key={key} className="quiz-checkbox">
                      <input type="checkbox" checked={quiz.cuisines[key]} onChange={e=>setQuiz(q=>({...q, cuisines:{...q.cuisines, [key]:e.target.checked}}))} />
                      <span>{key.charAt(0).toUpperCase()+key.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">Dietary restrictions</label>
                <div className="quiz-grid">
                  {Object.keys(quiz.restrictions).map(key=> (
                    <label key={key} className="quiz-checkbox">
                      <input type="checkbox" checked={quiz.restrictions[key]} onChange={e=>setQuiz(q=>({...q, restrictions:{...q.restrictions, [key]:e.target.checked}}))} />
                      <span>{key.replace('free','-free').replace('gluten','Gluten').replace('dairy','Dairy').replace('Vegetarian','Vegetarian')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="quiz-section">
                <label className="quiz-label">About you</label>
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

        {/* Calorie target + progress (for today) */}
        <CalorieSummary />

        <div className="nutrition-layout">
          <div className="nutrition-main">
            {/* Food options based on cuisines */}
            <FoodOptions />

            <div className="nutrition-grid">
              {weekDays.map((day, dayIndex) => {
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
                      {expandedDays[dayIndex] ? (
                        <ChevronUp className="icon" />
                      ) : (
                        <ChevronDown className="icon" />
                      )}
                    </button>

                    {expandedDays[dayIndex] && (
                      <div className="day-details">
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
};

function CalorieSummary(){
  const prefs = (()=>{ try{return JSON.parse(localStorage.getItem('nutritionQuiz')||'{}');}catch{return {};}})();
  const target = prefs?.dailyCalorieLimit || 2000;
  // assume "today" is index 0 in weekDays demo; compute from data
  const today = weekDays[0] || { lunch:{items:[]}, dinner:{items:[]} };
  const consumed = (today.lunch.items||[]).reduce((s,i)=>s+i.calories,0) + (today.dinner.items||[]).reduce((s,i)=>s+i.calories,0);
  const pct = Math.min(100, Math.round(consumed/target*100));
  return (
    <div className="calorie-summary">
      <div className="calorie-meta">
        <div><strong>Today:</strong> {consumed} / {target} kcal</div>
        <div className="calorie-pct">{pct}%</div>
      </div>
      <div className="calorie-bar"><div className="calorie-fill" style={{width:`${pct}%`}} /></div>
    </div>
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