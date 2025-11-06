const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

dotenv.config();
const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'], credentials: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

app.use('/api/auth', authLimiter, require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/workouts', require('./src/routes/workouts'));
app.use('/api/meals', require('./src/routes/meals'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/search', require('./src/routes/search'));
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`)))
    .catch((err) => { console.error('DB connection failed', err); process.exit(1); });
}
module.exports = app;
