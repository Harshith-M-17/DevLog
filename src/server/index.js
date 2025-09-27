require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Example model
const LogSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', LogSchema);

// CRUD endpoints
app.get('/api/logs', async (req, res) => {
  const logs = await Log.find();
  res.json(logs);
});

app.post('/api/logs', async (req, res) => {
  const log = new Log(req.body);
  await log.save();
  res.status(201).json(log);
});

app.put('/api/logs/:id', async (req, res) => {
  const log = await Log.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(log);
});

app.delete('/api/logs/:id', async (req, res) => {
  await Log.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
