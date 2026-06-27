const Task = require('../models/Task');
const Board = require('../models/Board');

// @route   GET /api/tasks/board/:boardId
exports.getTasks = async (req, res) => {
  try {
    // Verify board exists and user owns it
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ board: req.params.boardId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, estimatedEffort, boardId } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!boardId) {
    return res.status(400).json({ message: 'Board ID is required' });
  }

  try {
    // Verify board exists and user owns it
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      estimatedEffort: estimatedEffort || '',
      board: boardId,
      owner: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, estimatedEffort } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate ?? task.dueDate;
    task.estimatedEffort = estimatedEffort ?? task.estimatedEffort;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};