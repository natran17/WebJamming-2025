const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');
const router = express.Router();

router.get('/', auth, async (req,res,next)=>{ try{ const { date } = req.query; const q = { user: req.user.id }; if(date){ const d = new Date(date); const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const end = new Date(start); end.setUTCDate(end.getUTCDate()+1); q.date = { $gte: start, $lt: end }; } const items = await Meal.find(q).sort({ date: -1 }); res.json(items);}catch(err){ next(err);} });

router.post('/', auth, [body('date').isISO8601(), body('items').optional().isArray(), body('recipes').optional().isArray()], async (req,res,next)=>{ try{ const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({ message:'Validation error', details: errors.array() }); const doc = await Meal.create({ ...req.body, user: req.user.id }); res.status(201).json(doc);}catch(err){ next(err);} });

router.put('/:id', auth, async (req,res,next)=>{ try{ const updated = await Meal.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true }); if(!updated) return res.status(404).json({ message:'Not found' }); res.json(updated);}catch(err){ next(err);} });

router.delete('/:id', auth, async (req,res,next)=>{ try{ const deleted = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user.id }); if(!deleted) return res.status(404).json({ message:'Not found' }); res.json({ message:'Deleted' });}catch(err){ next(err);} });

router.get('/daily/summary', auth, [query('date').isISO8601()], async (req,res,next)=>{ try{ const errors = validationResult(req); if(!errors.isEmpty()) return res.status(400).json({ message:'Validation error', details: errors.array() }); const d = new Date(req.query.date); const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const end = new Date(start); end.setUTCDate(end.getUTCDate()+1); const entries = await Meal.find({ user: req.user.id, date: { $gte: start, $lt: end } }); const total = entries.reduce((sum,e)=>{ const itemsCals=(e.items||[]).reduce((s,i)=> s + i.calories*(i.quantity||1),0); const recipesCals=(e.recipes||[]).reduce((s,r)=> s + (r.estimatedCalories||0),0); return sum + itemsCals + recipesCals; },0); res.json({ date: start.toISOString().substring(0,10), totalCalories: total }); }catch(err){ next(err);} });
module.exports = router;
