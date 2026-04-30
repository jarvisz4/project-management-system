const Project = require('../models/Project');
const User = require('../models/User');

// @route GET /api/projects
const getProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { createdBy: req.user._id }
      : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: 'Project name required' });

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    await project.populate('createdBy', 'name email');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Access check: admin (creator) or member
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    if (!isMember && !isCreator) return res.status(403).json({ msg: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route POST /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ msg: 'userId required' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Only project creator can add members' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ msg: 'User already a member' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Only project creator can remove members' });
    }

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Only project creator can delete' });
    }

    await project.deleteOne();
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getProjects, createProject, getProject, addMember, removeMember, deleteProject };
