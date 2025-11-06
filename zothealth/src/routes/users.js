const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

router.get('/me', auth, async (req,res,next)=>{ try{ const user = await User.findById(req.user.id).select('-passwordHash -refreshTokens'); res.json(user);}catch(err){ next(err);} });

router.put('/me', auth, [body('name').optional().isString().isLength({min:2}), body('dateOfBirth').optional().isISO8601(), body('heightCm').optional().isNumeric(), body('weightKg').optional().isNumeric(), body('goals').optional().isIn(['cut','gain','maintain']), body('preferredExerciseTypes').optional().isArray(), body('dailyCalorieLimit').optional().isNumeric(), body('timezone').optional().isString()], async (req,res,next)=>{
  try{
    const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({ message:'Validation error', details: errors.array() });
    const updates = { ...req.body }; delete updates.password; delete updates.email;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash -refreshTokens');
    res.json(user);
  }catch(err){ next(err); }
});
module.exports = router;
