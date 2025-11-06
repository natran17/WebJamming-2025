const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { issueAccessToken, issueRefreshToken, refreshCookieOptions } = require('../utils/jwt');
const router = express.Router();

router.post('/register', [body('name').isString().isLength({min:2}), body('email').isEmail(), body('password').isLength({min:8})], async (req,res,next)=>{
  try{
    const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({message:'Validation error', details: errors.array()});
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email }); if(existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    const accessToken = issueAccessToken(user._id.toString());
    const { refreshToken, expiresAt } = issueRefreshToken(user._id.toString());
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent'), expiresAt }); await user.save();
    res.cookie('refreshToken', refreshToken, refreshCookieOptions).status(201).json({ accessToken, user: { id: user._id, name: user.name, email: user.email, goals: user.goals, dailyCalorieLimit: user.dailyCalorieLimit } });
  }catch(err){ next(err); }
});

router.post('/login', [body('email').isEmail(), body('password').isString()], async (req,res,next)=>{
  try{
    const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({message:'Validation error', details: errors.array()});
    const { email, password } = req.body;
    const user = await User.findOne({ email }); if(!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password); if(!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = issueAccessToken(user._id.toString());
    const { refreshToken, expiresAt } = issueRefreshToken(user._id.toString());
    user.refreshTokens = user.refreshTokens.filter((t)=> t.expiresAt > new Date());
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent'), expiresAt }); await user.save();
    res.cookie('refreshToken', refreshToken, refreshCookieOptions).json({ accessToken, user: { id: user._id, name: user.name, email: user.email } });
  }catch(err){ next(err); }
});

router.post('/refresh', async (req,res,next)=>{
  try{
    const token = req.cookies?.refreshToken; if(!token) return res.status(401).json({ message:'Missing refresh token' });
    let payload; try{ payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }catch{ return res.status(401).json({ message:'Invalid refresh token' }); }
    const user = await User.findById(payload.sub); if(!user) return res.status(401).json({ message:'Invalid refresh token' });
    const found = user.refreshTokens.find((t)=> t.token === token && t.expiresAt > new Date()); if(!found) return res.status(401).json({ message:'Refresh token not recognized' });
    const accessToken = issueAccessToken(user._id.toString());
    const { refreshToken, expiresAt } = issueRefreshToken(user._id.toString());
    user.refreshTokens = user.refreshTokens.filter((t)=> t.token !== token && t.expiresAt > new Date());
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent'), expiresAt }); await user.save();
    res.cookie('refreshToken', refreshToken, refreshCookieOptions).json({ accessToken });
  }catch(err){ next(err); }
});

router.post('/logout', async (req,res,next)=>{
  try{
    const token = req.cookies?.refreshToken;
    if(token){
      let payload=null; try{ payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);}catch{}
      if(payload){ const user = await User.findById(payload.sub); if(user){ user.refreshTokens = user.refreshTokens.filter((t)=> t.token !== token); await user.save(); } }
    }
    res.clearCookie('refreshToken', refreshCookieOptions);
    res.json({ message: 'Logged out' });
  }catch(err){ next(err); }
});

module.exports = router;
