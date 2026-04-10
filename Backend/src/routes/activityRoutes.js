import { Router } from 'express';

import {
  getActivity,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity
} from '../controllers/activityController.js';

const router = Router();

router.route('/').get(getActivity).post(createActivity);
router.route('/:id').get(getActivityById).put(updateActivity).delete(deleteActivity);

export default router;
