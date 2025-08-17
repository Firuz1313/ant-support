import express from 'express';
import { getDatabaseInfo } from '../controllers/dbInfoController.js';

const router = express.Router();

/**
 * @route GET /api/v1/db-info
 * @desc Get database structure information
 * @access Public (for development)
 */
router.get('/', getDatabaseInfo);

export default router;
