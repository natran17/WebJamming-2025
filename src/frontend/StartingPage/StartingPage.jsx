import React, { useState, useEffect } from 'react';
import NavBar from '../Navbar/NavBar';
import './StartingPage.css'


const StartingPage = () => {
const saved = localStorage.getItem('userFormData');

const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    excerciseType: '',
    goals: ''
  });
useEffect(() => {
localStorage.setItem('userFormData', JSON.stringify(formData));
}, [formData]);

  const steps = [
    { id: 1, label: 'Create account', status: 'completed' },
    { id: 2, label: 'About You', status: 'active' },
    { id: 3, label: 'Exercise Types', status: 'pending' },
    { id: 4, label: 'Goals', status: 'pending' },
    // { id: 5, label: 'Tax information', status: 'pending' },
    // { id: 6, label: 'Two-factor authentication', status: 'pending' },
    // { id: 7, label: 'Confirm details', status: 'pending' }
  ];

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-container">
        <button className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        <div className="content-wrapper">
          <aside className="sidebar">
            <div className="steps-list">
              {steps.map((step, index) => (
                <div key={step.id} className={`step-item ${step.status}`}>
                  <div className="step-indicator">
                    {step.status === 'completed' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : step.status === 'active' ? (
                      <div className="active-dot"></div>
                    ) : (
                      <div className="pending-circle"></div>
                    )}
                  </div>
                  <span className="step-label">{step.label}</span>
                  {index < steps.length - 1 && <div className="step-connector"></div>}
                </div>
              ))}
            </div>
          </aside>

          <main className="main-content">
            <h1 className="form-title">About you</h1>

            <div className="form-container">
              <div className="form-group">
                <label className="form-label">Your name:</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Text input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

                <div className="form-group">
                    <label className="form-label">
                        Age:
                    </label>
                    <select
                        className="form-select"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    >
                        <option value="">Select age</option>
                        {Array.from({ length: 101 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>


              <div className="form-group">
                <label className="form-label">
                  Gender:
                </label>
                <div className="button-group">
                  <button 
                    type="button"
                    className={`option-button ${formData.Gender === 'Male' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, Gender: 'Male'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Male
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.Gender === 'Female' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, Gender: 'Female'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    Female
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.Gender === 'Other' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, Gender: 'Other'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z"/>
                    </svg>
                    Other
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Height (ft'in):</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Text input"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Weight (lbs):</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Text input"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                />
              </div>
            

              <button type="button" className="submit-button" onClick={handleSubmit}>
                Continue
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
    );
}
  export default StartingPage