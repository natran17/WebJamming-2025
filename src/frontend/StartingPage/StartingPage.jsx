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
                    {/* <img src="../../Images/male.jpg" alt="Male" width="20" height="20" /> */}
                    Male
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.gender === 'Female' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Female'})}
                  >
                  {/* <img src="/path/to/female-icon.png" alt="Female" width="20" height="20" /> */}
                    Female
                  </button>
                  <button 
                    type="button"
                    className={`option-button ${formData.gender === 'Other' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Other'})}
                  >
                   {/* <img src="/path/to/other-icon.png" alt="Other" width="20" height="20" /> */}
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