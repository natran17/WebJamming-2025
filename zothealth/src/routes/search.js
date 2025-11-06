const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
router.get('/dining-hall', auth, async (req,res)=>{ res.json({ venue:'Anteater Dining', date:new Date().toISOString().substring(0,10), meals:[{name:'Grilled Chicken Bowl', calories:520, protein:45, carbs:55, fat:16},{name:'Veggie Stir Fry', calories:380, protein:15, carbs:60, fat:10},{name:'Turkey Sandwich', calories:430, protein:28, carbs:48, fat:12}] }); });
module.exports = router;
