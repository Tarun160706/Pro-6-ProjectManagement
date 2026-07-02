const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

const DEFAULT_DATA = {
  questionnaires: [],
  questions: [],
  options: [],
  rules: [],
  submissions: []
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Ensure all collections exist
      return { ...DEFAULT_DATA, ...parsed };
    } catch (e) {
      console.error('Error reading data file, resetting:', e.message);
      return { ...DEFAULT_DATA };
    }
  }
  return { ...DEFAULT_DATA };
}

function saveData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving data file:', e.message);
    throw e;
  }
}

module.exports = { loadData, saveData };
