import React, { useState, useEffect } from 'react';
import NavBar from '../Navbar/NavBar';
import './StartingPage.css'


const StartingPage = () => {
const saved = localStorage.getItem('userFormData');
const [currentStep, setCurrentStep] = useState('form'); // 'form' or 'selection'


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
    { id: 3, label: 'Ready to go!', status: 'pending' },
    // { id: 4, label: 'Goals', status: 'pending' },
    // { id: 5, label: 'Tax information', status: 'pending' },
    // { id: 6, label: 'Two-factor authentication', status: 'pending' },
    // { id: 7, label: 'Confirm details', status: 'pending' }
  ];

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setCurrentStep('selection');
  };
  if (currentStep === 'selection') {
    return (
      <div className="onboarding-wrapper">
        <NavBar/>
        <div className="onboarding-container">
          <button className="back-button" onClick={() => setCurrentStep('form')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          <div className="selection-container">
            <h1 className="form-title">Get Started!</h1>
            
            <div className="selection-grid">
              <div className="selection-card">
                <div className="card-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                    <line x1="16" y1="8" x2="2" y2="22"/>
                    <line x1="17.5" y1="15" x2="9" y2="15"/>
                  </svg>
                </div>
                <h2>Learn More About Exercises</h2>
                <p>Discover workout routines, proper form, and training techniques to reach your fitness goals.</p>
                <a href="exercise" className="selection-button">Get Started</a>
              </div>

              <div className="selection-card">
                <div className="card-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                    <line x1="6" y1="1" x2="6" y2="4"/>
                    <line x1="10" y1="1" x2="10" y2="4"/>
                    <line x1="14" y1="1" x2="14" y2="4"/>
                  </svg>
                </div>
                <h2>Learn More About Nutrition</h2>
                <p>Explore healthy eating habits, meal planning, and nutritional guidance for optimal health.</p>
                <a href="nutrition" className="selection-button">Get Started</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-wrapper">
      <NavBar/>

      <div className="onboarding-container">
        <a href="/" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </a>

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
                <label className="form-label">Age:</label>
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
                <label className="form-label">Gender:</label>
                <div className="button-group">
                  <button 
                    type="button"
                    className={`option-button ${formData.gender === 'Male' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Male'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Male
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.gender === 'Female' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Female'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    Female
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.gender === 'Other' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Other'})}
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

              <div className="form-group">
                <label className="form-label">Fitness Goals:</label>
                <div className="button-group">
                  <button 
                    type="button"
                    className={`option-button ${formData.goals === 'Weight Loss' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, goals: 'Weight Loss'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 12h8"/>
                    </svg>
                    Weight Loss
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.goals === 'Muscle Gain' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, goals: 'Muscle Gain'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6.5 6.5h11v11h-11z"/>
                      <rect x="3" y="8" width="2" height="8" fill="currentColor"/>
                      <rect x="19" y="8" width="2" height="8" fill="currentColor"/>
                      <rect x="5" y="9" width="2" height="6"/>
                      <rect x="17" y="9" width="2" height="6"/>
                    </svg>
                    Muscle Gain
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.goals === 'Endurance' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, goals: 'Endurance'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    Endurance
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level:</label>
                <div className="button-group">
                  <button 
                    type="button"
                    className={`option-button ${formData.excerciseType === 'Beginner' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, excerciseType: 'Beginner'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Beginner
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.excerciseType === 'Intermediate' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, excerciseType: 'Intermediate'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Intermediate 
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.excerciseType === 'Advanced' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, excerciseType: 'Advanced'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Advanced
                  </button>
                </div>
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

export default StartingPage;