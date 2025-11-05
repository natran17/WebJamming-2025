import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './frontend/Login/Login.jsx'
import Home from './frontend/Home/Home.jsx'

function App() {


  return (
    <>
     <div>
     
     <Routes>
      <Route path="/" element={<Home />} />      
      <Route path="/login" element={<Login />} /> 
    </Routes>
    </div>
    </>
  )
}

export default App
