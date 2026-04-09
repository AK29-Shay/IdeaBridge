import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildCategoryAndDateQuery } from '../utils/queryFilters.js';

const getProjects = asyncHandler(async (req, res) => {
  const query = buildCategoryAndDateQuery({
    category: req.query.category,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    dateField: 'createdDate'
  });

  const projects = await Project.find(query).sort({ createdDate: -1 });
  res.json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json(project);
});

const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  Object.assign(project, req.body);
  const updatedProject = await project.save();
  res.json(updatedProject);
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await project.deleteOne();
  res.json({ message: 'Project removed' });
});

export { getProjects, getProjectById, createProject, updateProject, deleteProject };
