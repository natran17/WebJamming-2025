const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Workout = require('../models/Workout');
const router = express.Router();

router.get('/', auth, async (req,res,next)=>{ try{ const items = await Workout.find({ user: req.user.id }).sort({ weekOf: -1 }); res.json(items);}catch(err){ next(err);} });

router.post('/', auth, [body('title').optional().isString(), body('weekOf').isISO8601(), body('days').isArray()], async (req,res,next)=>{
  try{ const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({ message:'Validation error', details: errors.array() }); const doc = await Workout.create({ ...req.body, user: req.user.id }); res.status(201).json(doc);}catch(err){ next(err); }
});

router.get('/:id', auth, async (req,res,next)=>{ try{ const found = await Workout.findOne({ _id: req.params.id, user: req.user.id }); if(!found) return res.status(404).json({ message:'Not found' }); res.json(found);}catch(err){ next(err);} });

router.put('/:id', auth, async (req,res,next)=>{ try{ const updated = await Workout.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true }); if(!updated) return res.status(404).json({ message:'Not found' }); res.json(updated);}catch(err){ next(err);} });

router.delete('/:id', auth, async (req,res,next)=>{ try{ const deleted = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id }); if(!deleted) return res.status(404).json({ message:'Not found' }); res.json({ message:'Deleted' });}catch(err){ next(err);} });

module.exports = router;
