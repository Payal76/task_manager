const express = require('express');
const { ensureAuthenticated, requireProjectMember, requireProjectAdmin } = require('../middleware/authMiddleware');
const {
  createTask,
  updateTask,
  getProjectTasks,
  getTaskById,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();
router.use(ensureAuthenticated);

router.post('/', requireProjectMember, requireProjectAdmin, createTask);
router.get('/project/:projectId', requireProjectMember, getProjectTasks);
router.get('/:taskId', getTaskById);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', requireProjectMember, requireProjectAdmin, deleteTask);

module.exports = router;
