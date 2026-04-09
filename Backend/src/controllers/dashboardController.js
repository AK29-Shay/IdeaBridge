import Project from '../models/Project.js';
import Request from '../models/Request.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildCategoryAndDateQuery, isResolvedRequest } from '../utils/queryFilters.js';

const getDashboardData = asyncHandler(async (req, res) => {
  const { category, dateFrom, dateTo } = req.query;

  const projectQuery = buildCategoryAndDateQuery({
    category,
    dateFrom,
    dateTo,
    dateField: 'createdDate'
  });

  const requestQuery = buildCategoryAndDateQuery({
    category,
    dateFrom,
    dateTo,
    dateField: 'requestedAt'
  });

  const [projects, requests, activity] = await Promise.all([
    Project.find(projectQuery).sort({ createdDate: -1 }),
    Request.find(requestQuery).sort({ requestedAt: -1 }),
    Activity.find({}).sort({ month: 1 })
  ]);

  const totalContributions = projects.reduce((sum, project) => sum + Number(project.contributions || 0), 0);
  const resolvedRequests = requests.filter((item) => isResolvedRequest(item.status)).length;
  const openRequests = requests.length - resolvedRequests;
  const categories = [...new Set(projects.map((project) => project.category).filter(Boolean))];

  res.json({
    projects,
    requests,
    activity,
    categories,
    summary: {
      totalProjects: projects.length,
      totalContributions,
      openRequests,
      resolvedRequests
    }
  });
});

export { getDashboardData };
