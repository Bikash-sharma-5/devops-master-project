const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// 1. Import prom-client
const client = require('prom-client'); 
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- PROMETHEUS SETUP ---
// 2. Initialize the registry and collect default metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// 3. Custom metric: Track total HTTP requests (Optional but helpful)
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(httpRequestCounter);

// Middleware to count requests for custom metric
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://db:27017/tasks')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Task Schema & Model (Unchanged)
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: 'Pending' }
});
const Task = mongoose.model('Task', TaskSchema);

// --- ROUTES ---

// 4. THE METRICS ENDPOINT (This is what Prometheus is looking for)
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.status(201).json(newTask);
});

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task Deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));