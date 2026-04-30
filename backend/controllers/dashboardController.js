const Task = require('../models/Task');
const Project = require('../models/Project');

// @route GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const now = new Date();

    // Task filter based on role
    const taskFilter = isAdmin
      ? { createdBy: userId }
      : { assignedTo: userId };

    const [allTasks, projects] = await Promise.all([
      Task.find(taskFilter).populate('assignedTo', 'name email').populate('projectId', 'name'),
      isAdmin
        ? Project.find({ createdBy: userId })
        : Project.find({ members: userId })
    ]);

    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const overdue = allTasks.filter(t =>
      t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < now
    ).length;

    // Recent tasks (last 5)
    const recentTasks = allTasks.slice(0, 5);

    res.json({
      stats: { total, completed, pending, inProgress, overdue, projects: projects.length },
      recentTasks,
      projects: projects.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard };
