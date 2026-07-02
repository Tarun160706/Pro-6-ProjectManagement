require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5009;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Milestone Grid API running on http://127.0.0.1:${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/api/health`);
});
