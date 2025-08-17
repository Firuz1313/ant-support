import express from 'express';
import { testCreateProblem, populateData } from '../controllers/testController.js';

const router = express.Router();

// POST /api/v1/test/problems - Тестовое создание проблемы без валидации
router.post('/problems', testCreateProblem);

// POST /api/v1/test/populate - Заполнить базу тестовыми данными
router.post('/populate', populateData);

export default router;
