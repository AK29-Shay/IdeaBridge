import { Router } from 'express';

import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
} from '../controllers/requestController.js';

const router = Router();

router.route('/').get(getRequests).post(createRequest);
router.route('/:id').get(getRequestById).put(updateRequest).delete(deleteRequest);

export default router;
