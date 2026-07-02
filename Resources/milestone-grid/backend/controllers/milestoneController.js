const milestoneService = require('../services/milestoneService');

const getAll = async (req, res) => {
  try {
    const { projectName, version, search } = req.query;
    const items = await milestoneService.getAll(projectName, version, search);
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching milestones:', error.message);
    res.status(500).json({ message: 'Failed to fetch milestones', error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { projectName, version, milestone, date } = req.body;
    if (!milestone || !milestone.trim()) {
      return res.status(400).json({ message: 'Milestone name is required' });
    }
    const item = await milestoneService.create({
      projectName,
      version,
      milestone: milestone.trim(),
      date: date || ''
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating milestone:', error.message);
    res.status(500).json({ message: 'Failed to create milestone', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { milestone, date } = req.body;
    const item = await milestoneService.update(id, { milestone, date });
    if (!item) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Error updating milestone:', error.message);
    res.status(500).json({ message: 'Failed to update milestone', error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await milestoneService.remove(id);
    if (!item) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error.message);
    res.status(500).json({ message: 'Failed to delete milestone', error: error.message });
  }
};

module.exports = { getAll, create, update, remove };
