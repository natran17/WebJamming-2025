import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './frontend/Login/Login.jsx'
import Home from './frontend/Home/Home.jsx'
import StartingPage from './frontend/StartingPage/StartingPage.jsx'

function App() {


  return (
    <>     
     <Routes>
      <Route path="/" element={<Home />} />      
      <Route path="/login" element={<Login />} /> 
      <Route path="/GettingStarted" element={<StartingPage />} /> 
    </Routes>
    </>
  )
}

export default App
