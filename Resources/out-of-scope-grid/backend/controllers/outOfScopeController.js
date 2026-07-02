const outOfScopeService = require('../services/outOfScopeService');

const getAll = async (req, res) => {
  try {
    const { projectName, version, search } = req.query;
    const items = await outOfScopeService.getAll(projectName, version, search);
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching out of scope items:', error.message);
    res.status(500).json({ message: 'Failed to fetch items', error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { projectName, version, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Item text is required' });
    }
    const item = await outOfScopeService.create({ projectName, version, text: text.trim() });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating out of scope item:', error.message);
    res.status(500).json({ message: 'Failed to create item', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Item text is required' });
    }
    const item = await outOfScopeService.update(id, { text: text.trim() });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Error updating out of scope item:', error.message);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await outOfScopeService.remove(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting out of scope item:', error.message);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};

module.exports = { getAll, create, update, remove };
