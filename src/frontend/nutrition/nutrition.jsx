import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './nutrition.css'
import NavBar from '../Navbar/NavBar';
import weekDays from './mealinfo.json'

const NutritionPlanner = () => {
  const [expandedMeals, setExpandedMeals] = useState({});
  const [expandedDays, setExpandedDays] = useState({});


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

  return (
    <div className="nutrition-container">
        <NavBar/>
      <div className="nutrition-wrapper">
        <button className="back-btn">
          <span className="mr-2">←</span>
          <span className="font-medium">Back to Home</span>
        </button>

        <h1 className="title">Weekly Nutrition Planner</h1>

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

        <div className="nutrition-divider"></div>
      </div>
    </div>
  );
};

export default NutritionPlanner;