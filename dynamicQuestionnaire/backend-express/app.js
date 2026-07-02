const express = require('express');
const cors = require('cors');
const statusRoutes = require('./routes/statusRoutes');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const questionRoutes = require('./routes/questionRoutes');
const optionRoutes = require('./routes/optionRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const engineRoutes = require('./routes/engineRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
// Status routes must be before questionnaire routes to prevent "/:id" from catching "status"
app.use('/api/v1/questionnaires/status', statusRoutes);
app.use('/api/v1/questionnaires', questionnaireRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/options', optionRoutes);
app.use('/api/v1/rules', ruleRoutes);
app.use('/api/v1/engine', engineRoutes);
app.use('/api/v1/submissions', submissionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'dynamic-questionnaire' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
