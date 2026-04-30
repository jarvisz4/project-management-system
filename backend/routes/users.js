const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

router.get('/', protect, getUsers);

module.exports = router;
