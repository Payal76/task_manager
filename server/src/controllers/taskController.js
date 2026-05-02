const Task = require('../models/task');
const Project = require('../models/project');

async function createTask(req, res, next) {
  try {
    const { title, description, dueDate, priority, assignee, projectId } = req.body;
    if (!title || !dueDate || !projectId) {
      return res.status(400).json({ message: 'Title, due date, and project ID are required' });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    let task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project: projectId,
      assignee,
      createdBy: req.user.id,
    });
    task = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function getProjectTasks(req, res, next) {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isParticipant = project.owner.toString() === req.user.id || project.members.map((m) => m.toString()).includes(req.user.id);
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { status, title, description, dueDate, priority, assignee } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isAdmin = project.owner.toString() === req.user.id;
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id;
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Only admin or assignee can update this task' });
    }
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (assignee !== undefined && isAdmin) task.assignee = assignee;
    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { taskId } = req.params;
    if (!taskId) return res.status(400).json({ message: 'Task ID required' });
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isAdmin = project.owner.toString() === req.user.id;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only project admin can delete tasks' });
    }
    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createTask, getProjectTasks, getTaskById, updateTask, deleteTask };
