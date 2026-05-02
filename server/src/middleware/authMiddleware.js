const Project = require('../models/project');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Authentication required' });
}

async function requireProjectMember(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const memberIds = project.members.map((m) => m.toString());
  if (project.owner.toString() === req.user.id || memberIds.includes(req.user.id)) {
    req.project = project;
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}

function requireProjectAdmin(req, res, next) {
  if (!req.project) return res.status(500).json({ message: 'Project context missing' });
  if (req.project.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}

module.exports = { ensureAuthenticated, requireProjectMember, requireProjectAdmin };
