const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes (we'll add these as we build them)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/', (req, res) => res.json({ message: 'TaskFlow API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));