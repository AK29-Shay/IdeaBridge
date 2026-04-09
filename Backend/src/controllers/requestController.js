import Request from '../models/Request.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildCategoryAndDateQuery } from '../utils/queryFilters.js';

const getRequests = asyncHandler(async (req, res) => {
  const query = buildCategoryAndDateQuery({
    category: req.query.category,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    dateField: 'requestedAt'
  });

  const requests = await Request.find(query).sort({ requestedAt: -1 });
  res.json(requests);
});

const getRequestById = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  res.json(request);
});

const createRequest = asyncHandler(async (req, res) => {
  const request = await Request.create(req.body);
  res.status(201).json(request);
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  Object.assign(request, req.body);
  const updatedRequest = await request.save();
  res.json(updatedRequest);
});

const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  await request.deleteOne();
  res.json({ message: 'Request removed' });
});

export { getRequests, getRequestById, createRequest, updateRequest, deleteRequest };
