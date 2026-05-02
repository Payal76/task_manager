const Task = require('../models/task');
const Project = require('../models/project');

async function dashboardStats(req, res, next) {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }).lean();
    const projectIds = projects.map((project) => project._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email')
      .lean();
    const totalTasks = tasks.length;
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    const tasksPerUser = tasks.reduce((acc, task) => {
      const key = task.assignee?.name || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const overdueTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done');
    res.json({ totalTasks, statusCounts, tasksPerUser, overdueTasks });
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboardStats };
