const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', '..', 'data.json');

const loadItems = () => {
  if (fs.existsSync(dataFilePath)) {
    try {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    } catch (e) {
      return [];
    }
  }
  return [];
};

const saveItems = (items) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
};

const getAll = async (projectName = '', version = '', searchQuery = '') => {
  let items = loadItems();
  let result = items.filter(item =>
    (item.projectName || '') === (projectName || '') &&
    (item.version || '') === (version || '')
  );
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(item =>
      (item.milestone || '').toLowerCase().includes(q) ||
      (item.date || '').includes(q)
    );
  }
  return result.sort((a, b) => b.createdAt - a.createdAt);
};

const create = async (data) => {
  let items = loadItems();
  const item = {
    _id: crypto.randomUUID(),
    projectName: data.projectName || '',
    version: data.version || '',
    milestone: data.milestone || '',
    date: data.date || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  items.push(item);
  saveItems(items);
  return item;
};

const update = async (id, data) => {
  let items = loadItems();
  const index = items.findIndex(item => item._id === id);
  if (index !== -1) {
    items[index] = {
      ...items[index],
      milestone: data.milestone !== undefined ? data.milestone : items[index].milestone,
      date: data.date !== undefined ? data.date : items[index].date,
      updatedAt: new Date()
    };
    saveItems(items);
    return items[index];
  }
  return null;
};

const remove = async (id) => {
  let items = loadItems();
  const index = items.findIndex(item => item._id === id);
  if (index !== -1) {
    const deleted = items[index];
    items.splice(index, 1);
    saveItems(items);
    return deleted;
  }
  return null;
};

module.exports = { getAll, create, update, remove };
