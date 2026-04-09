import Activity from '../models/Activity.js';
import asyncHandler from '../utils/asyncHandler.js';

const getActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.find({}).sort({ month: 1 });
  res.json(activity);
});

const getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity item not found');
  }

  res.json(activity);
});

const createActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.create(req.body);
  res.status(201).json(activity);
});

const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity item not found');
  }

  Object.assign(activity, req.body);
  const updatedActivity = await activity.save();
  res.json(updatedActivity);
});

const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity item not found');
  }

  await activity.deleteOne();
  res.json({ message: 'Activity item removed' });
});

export { getActivity, getActivityById, createActivity, updateActivity, deleteActivity };
