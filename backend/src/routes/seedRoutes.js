import express from 'express';
import { seedData } from '../controllers/seedController.js';

const router = express.Router();

// POST /api/v1/seed - Seed database with test data
router.post('/', seedData);

export default router;
