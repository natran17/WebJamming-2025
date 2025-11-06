import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './frontend/Login/Login.jsx'
import Home from './frontend/Home/Home.jsx'
import StartingPage from './frontend/StartingPage/StartingPage.jsx'
import ExercisePage from './frontend/exercise/exercise.jsx'
import NutritionPage from './frontend/nutrition/nutrition.jsx'

function App() {


  return (
    <>     
     <Routes>
      <Route path="/" element={<Home />} />      
      <Route path="/login" element={<Login />} /> 
      <Route path="/GettingStarted" element={<StartingPage />} /> 
      <Route path="/exercise" element={<ExercisePage />} /> 
      <Route path="/nutrition" element={<NutritionPage />} /> 

    </Routes>
    </>
  )
}

export default App
