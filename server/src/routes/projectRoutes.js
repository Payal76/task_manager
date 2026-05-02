const express = require('express');
const { ensureAuthenticated, requireProjectMember, requireProjectAdmin } = require('../middleware/authMiddleware');
const {
  createProject,
  getUserProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
  joinProject,
  getAllProjects,
} = require('../controllers/projectController');

const router = express.Router();

router.use(ensureAuthenticated);
router.post('/', createProject);
router.post('/join', joinProject);
router.get('/all/list', getAllProjects);
router.get('/', getUserProjects);
router.get('/:projectId', requireProjectMember, getProjectById);
router.post('/:projectId/members', requireProjectMember, requireProjectAdmin, addMember);
router.delete('/:projectId/members/:memberId', requireProjectMember, requireProjectAdmin, removeMember);
router.delete('/:projectId', requireProjectMember, requireProjectAdmin, deleteProject);

module.exports = router;
