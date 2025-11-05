import React, {useState} from 'react'
import './Login.css'
import ucibackground from '../../Images/UCI background.jpg'
// import { login, signup } from '../../firebase'

const Login = () => {

  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user_auth = async (event)=>{
    event.preventDefault();
    if(signState==="Sign In"){
      await login(email, password);
    }else{
      await signup(name, email, password);
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
          {signState==="Sign Up"? <input className="login-input" value = {name} onChange={(e)=>{setName(e.target.value)}} 
          type="text" placeholder='Your name' />:<></>}
          
          <input className="login-input" type="email" value = {email} onChange={(e)=>{setEmail(e.target.value)}} 
          placeholder='Email' />
          <input className="login-input" type="password" value = {password} onChange={(e)=>{setPassword(e.target.value)}} 
          placeholder='Password' />
          <button onClick={user_auth} type='submit'>{signState}</button>
          
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
