import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import ucibackground from '../../Images/UCI background.jpg'
// import { login, signup } from '../../firebase'

const Login = () => {

  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const emailOk = (v)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||'').toLowerCase());
  const validate = ()=>{
    const e = {};
    if(signState === 'Sign Up'){
      if(!name.trim()) e.name = 'Name is required';
    }
    if(!email.trim()) e.email = 'Email is required';
    else if(!emailOk(email)) e.email = 'Enter a valid email';
    if(!password) e.password = 'Password is required';
    else if(password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  useEffect(()=>{ setErrors(validate()); }, [signState, name, email, password]);

  const user_auth = async (event)=>{
    event.preventDefault();
    try{
      const e = validate();
      setErrors(e);
      if(Object.keys(e).length>0) return;
      if(signState==="Sign In"){
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        if(!res.ok){ const err=await res.json().catch(()=>({message:`HTTP ${res.status}`})); throw new Error(err.message||'Login failed'); }
        const data = await res.json();
        if(data?.accessToken){ localStorage.setItem('accessToken', data.accessToken); }
        navigate('/GettingStarted');
      }else{
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password })
        });
        if(!res.ok){ const err=await res.json().catch(()=>({message:`HTTP ${res.status}`})); throw new Error(err.message||'Signup failed'); }
        const data = await res.json();
        if(data?.accessToken){ localStorage.setItem('accessToken', data.accessToken); }
        navigate('/GettingStarted');
      }
    }catch(e){
      alert(e.message || 'Something went wrong');
    }
  }

  return (
    <div className = 'login'>
        <div className='LeftImage'>
            
        </div>
      {/* <img src={ucibackground} className='login-logo' alt="" /> */}
      <div className="login-form">
        <h1>{signState}</h1>
        <form>
          {signState==="Sign Up"? (
            <>
              <input className={`login-input ${errors.name?'invalid':''}`} value = {name} onChange={(e)=>{setName(e.target.value)}} 
              type="text" placeholder='Your name' />
              {errors.name? <div className="error-text">{errors.name}</div>: null}
            </>
          ): null}
          
          <input className={`login-input ${errors.email?'invalid':''}`} type="email" value = {email} onChange={(e)=>{setEmail(e.target.value)}} 
          placeholder='Email' />
          {errors.email? <div className="error-text">{errors.email}</div>: null}
          <input className={`login-input ${errors.password?'invalid':''}`} type="password" value = {password} onChange={(e)=>{setPassword(e.target.value)}} 
          placeholder='Password' />
          {errors.password? <div className="error-text">{errors.password}</div>: null}
          <button onClick={user_auth} type='submit' disabled={Object.keys(errors).length>0}>{signState}</button>
          
          <div className='form-help'>
            <div className='remember'>
              <input type="checkbox"/>
              <label htmlFor="">Remember Me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>
        <div className="form-switch">
          {signState==="Sign In"?
          <p>New?<span onClick={()=>{setSignState("Sign Up")}}>Sign Up Now</span></p>:
          <p>Already have account?  <span onClick={()=>{setSignState("Sign In")}}>Sign In Now</span></p>
        }
          
          
        </div>
      </div>
    </div>
  )
}
export default Login
