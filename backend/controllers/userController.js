const User = require('../models/User');

// @route GET /api/users  (admin: get all users to assign to projects)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getUsers };
