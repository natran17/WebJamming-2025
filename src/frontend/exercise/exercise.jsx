import React, { useState } from 'react';
import NavBar from '../Navbar/NavBar';

import './exercise.css';


const exercise = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const days = [
    { name: 'Monday', date: 'Jan 20', items: ['Morning workout', 'Cardio - 30 min', 'Stretching'] },
    { name: 'Tuesday', date: 'Jan 21', items: ['Upper body strength', 'Push-ups - 3 sets', 'Bench press'] },
    { name: 'Wednesday', date: 'Jan 22', items: ['Yoga session', 'Core exercises', 'Flexibility training'] },
    { name: 'Thursday', date: 'Jan 23', items: ['Leg day', 'Squats - 4 sets', 'Lunges'] },
    { name: 'Friday', date: 'Jan 24', items: ['Full body workout', 'HIIT training', 'Cool down'] },
    { name: 'Saturday', date: 'Jan 25', items: ['Swimming', 'Light cardio', 'Recovery stretches'] },
    { name: 'Sunday', date: 'Jan 26', items: ['Rest day', 'Light walk', 'Meal prep'] }
  ];

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

        <div className="days-container">
          {days.map((day, index) => (
            <div
              key={index}
              className={`day-card ${selectedDay === index ? 'active' : ''}`}
              onClick={() => setSelectedDay(index)}
            >
              <div className="day-header">
                <h2>{day.name}</h2>
                <p>{day.date}</p>
              </div>

              <div className="day-items">
                {day.items.map((item, i) => (
                  <div key={i} className="day-item">{item}</div>
                ))}
              </div>

              <button className="add-item">+ Add Item</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default exercise;