const dotenv = require('dotenv'); dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Workout = require('../src/models/Workout');
const Meal = require('../src/models/Meal');

async function run(){
  await connectDB();
  await Promise.all([User.deleteMany({}), Workout.deleteMany({}), Meal.deleteMany({})]);
  const passwordHash = await User.hashPassword('Password123!');
  const user = await User.create({ name:'Demo User', email:'demo@zothealth.app', passwordHash, goals:'maintain', preferredExerciseTypes:['cardio','legs'], dailyCalorieLimit:2200 });
  const monday={ day:'monday', exercises:[{ name:'Jogging', targetBodyPart:'cardio', timeMinutes:20, estimatedCaloriesBurned:180 },{ name:'Squats', targetBodyPart:'legs', sets:3, reps:10, estimatedCaloriesBurned:120 }] };
  const tuesday={ day:'tuesday', exercises:[{ name:'Bench Press', targetBodyPart:'chest', sets:3, reps:8, estimatedCaloriesBurned:100 },{ name:'Plank', targetBodyPart:'core', timeMinutes:5, estimatedCaloriesBurned:50 }] };
  await Workout.create({ user: user._id, title:'Seed Weekly Plan', weekOf: new Date(), days:[monday,tuesday] });
  await Meal.create({ user: user._id, date: new Date(), items:[{ name:'Oatmeal', calories:150, quantity:1 },{ name:'Chicken Salad', calories:400, quantity:1 }] });
  console.log('Seeded demo user:', { email:'demo@zothealth.app', password:'Password123!' });
  await mongoose.connection.close();
}
run().catch((e)=>{ console.error(e); process.exit(1); });
