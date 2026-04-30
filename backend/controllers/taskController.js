const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check project access
const checkAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) return { err: 'Project not found', status: 404 };
  const isMember = project.members.some(m => m.toString() === userId.toString());
  const isCreator = project.createdBy.toString() === userId.toString();
  if (!isMember && !isCreator) return { err: 'Access denied', status: 403 };
  return { project };
};

// @route GET /api/tasks?projectId=xxx
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) {
      const { err, status } = await checkAccess(projectId, req.user._id, req.user.role);
      if (err) return res.status(status).json({ msg: err });
      filter.projectId = projectId;
    } else {
      // Members only see their tasks; admins see all tasks in their projects
      if (req.user.role === 'member') {
        filter.assignedTo = req.user._id;
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route POST /api/tasks
const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    const { title, description, projectId, assignedTo, dueDate } = req.body;
    if (!title || !projectId) return res.status(400).json({ msg: 'Title and projectId required' });

    const { err, status, project } = await checkAccess(projectId, req.user._id, req.user.role);
    if (err) return res.status(status).json({ msg: err });

    // Validate assignee is a project member
    if (assignedTo && !project.members.some(m => m.toString() === assignedTo)) {
      return res.status(400).json({ msg: 'Assigned user is not a project member' });
    }

    const task = await Task.create({
      title, description, projectId, assignedTo, dueDate,
      createdBy: req.user._id
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'name' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: 'Can only update your own tasks' });
      }
      const { status } = req.body;
      if (status) task.status = status;
    } else {
      // Admin can update everything
      const { title, description, assignedTo, status, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'name' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    await task.deleteOne();
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
