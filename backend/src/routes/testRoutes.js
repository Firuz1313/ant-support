import express from 'express';
import { testCreateProblem } from '../controllers/testController.js';

const router = express.Router();

// POST /api/v1/test/problems - Тестовое создание проблемы без валидации
router.post('/problems', testCreateProblem);

export default router;
