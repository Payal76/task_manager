const Project = require('../models/project');
const User = require('../models/user');

async function createProject(req, res, next) {
  try {
    const { name, description, memberIds = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });
    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: memberIds.filter((id) => id !== req.user.id),
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

async function getUserProjects(req, res, next) {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).populate('owner', 'name email').lean();
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const projectObj = project.toObject();
    projectObj.isAdmin = project.owner._id.toString() === req.user.id;
    res.json(projectObj);
  } catch (error) {
    next(error);
  }
}

async function joinProject(req, res, next) {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() === req.user.id || project.members.map((id) => id.toString()).includes(req.user.id)) {
      return res.status(400).json({ message: 'You already belong to this project' });
    }
    project.members.push(req.user.id);
    await project.save();
    const populated = await Project.findById(projectId).populate('owner', 'name email').populate('members', 'name email');
    const projectObj = populated.toObject();
    projectObj.isAdmin = populated.owner._id.toString() === req.user.id;
    res.json(projectObj);
  } catch (error) {
    next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'Member ID required' });
    const member = await User.findById(memberId);
    if (!member) return res.status(404).json({ message: 'User not found' });
    if (req.project.members.includes(memberId) || req.project.owner.toString() === memberId) {
      return res.status(400).json({ message: 'User already belongs to this project' });
    }
    req.project.members.push(memberId);
    await req.project.save();
    const updated = await Project.findById(req.project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    const projectObj = updated.toObject();
    projectObj.isAdmin = updated.owner._id.toString() === req.user.id;
    res.json(projectObj);
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const { memberId } = req.params;
    if (!memberId) return res.status(400).json({ message: 'Member ID required' });
    req.project.members = req.project.members.filter((id) => id.toString() !== memberId);
    await req.project.save();
    const updated = await Project.findById(req.project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    const projectObj = updated.toObject();
    projectObj.isAdmin = updated.owner._id.toString() === req.user.id;
    res.json(projectObj);
  } catch (error) {
    next(error);
  }
}

async function getAllProjects(req, res, next) {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .lean();
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can delete the project' });
    }
    await Project.findByIdAndDelete(projectId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createProject, getUserProjects, getProjectById, addMember, removeMember, deleteProject, joinProject, getAllProjects };
