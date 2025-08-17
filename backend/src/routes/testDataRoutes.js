import express from 'express';
import { createTestData } from '../controllers/testDataController.js';

const router = express.Router();

// POST /api/v1/test-data - Create test data
router.post('/', createTestData);

export default router;
