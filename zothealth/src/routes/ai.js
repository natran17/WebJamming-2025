const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/generate-plan', auth, [body('goals').isIn(['cut','gain','maintain']), body('preferredExerciseTypes').optional().isArray(), body('experience').optional().isIn(['beginner','intermediate','advanced'])], async (req,res,next)=>{
  try{
    const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({ message:'Validation error', details: errors.array() });
    const { goals, preferredExerciseTypes = [], experience = 'beginner' } = req.body;
    const pick=(arr,n)=>arr.slice(0,n);
    const baseExercises=[{name:'Squats',targetBodyPart:'legs',sets:3,reps:10,estimatedCaloriesBurned:120},{name:'Bench Press',targetBodyPart:'chest',sets:3,reps:8,estimatedCaloriesBurned:100},{name:'Deadlift',targetBodyPart:'back',sets:3,reps:5,estimatedCaloriesBurned:140},{name:'Overhead Press',targetBodyPart:'shoulders',sets:3,reps:8,estimatedCaloriesBurned:90},{name:'Pull-ups',targetBodyPart:'back',sets:3,reps:8,estimatedCaloriesBurned:80},{name:'Plank',targetBodyPart:'core',timeMinutes:5,estimatedCaloriesBurned:50},{name:'Jogging',targetBodyPart:'cardio',timeMinutes:20,estimatedCaloriesBurned:180}];
    const cardioBias = goals==='cut'?2:goals==='gain'?0:1;
    const strengthBias = goals==='gain'?2:goals==='cut'?0:1;
    const multiplier = experience==='advanced'?1.4:experience==='intermediate'?1.2:1.0;
    const preferredSet = preferredExerciseTypes.length ? baseExercises.filter((e)=> preferredExerciseTypes.includes(e.targetBodyPart) || preferredExerciseTypes.includes('cardio')) : baseExercises;
    const makeDay=(name)=>{ const strength=pick(preferredSet.filter((e)=>e.sets), 2+strengthBias); const cardio=pick(preferredSet.filter((e)=>e.timeMinutes), 1+cardioBias); const exercises=[...strength,...cardio].map((e)=>({ ...e, sets: e.sets?Math.round(e.sets*multiplier):undefined, reps: e.reps?Math.round(e.reps*multiplier):undefined, timeMinutes: e.timeMinutes?Math.round(e.timeMinutes*multiplier):undefined })); return { day:name, exercises }; };
    const daysOrder=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const plan={ title:'AI Generated Plan', weekOf:new Date().toISOString(), days: daysOrder.map((d)=> makeDay(d)) };
    res.json(plan);
  }catch(err){ next(err); }
});
module.exports = router;
