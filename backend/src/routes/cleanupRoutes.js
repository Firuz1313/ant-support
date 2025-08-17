import express from "express";
import { cleanupTVInterfaces } from "../controllers/cleanupController.js";
import { clearAllData } from "../controllers/clearDataController.js";

const router = express.Router();

// POST /api/cleanup/tv-interfaces - Очистить и создать пользовательские TV интерфейсы
router.post("/tv-interfaces", cleanupTVInterfaces);

// POST /api/cleanup/clear-all - Полная очистка всех данных
router.post("/clear-all", clearAllData);

export default router;
