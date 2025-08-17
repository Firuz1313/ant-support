import express from "express";

const router = express.Router();

// Временная заглушка для remotes эндпоинта
// Возвращает пустой массив пока не будет реализован функционал remotes

/**
 * @route GET /api/v1/remotes
 * @desc Получить все remotes (заглушка)
 * @access Public
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Remotes endpoint placeholder - empty array returned",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /api/v1/remotes/:id
 * @desc Получить remote по ID (заглушка)
 * @access Public
 */
router.get("/:id", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Remote not found",
    message: "Remotes functionality not implemented yet",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route POST /api/v1/remotes
 * @desc Создать remote (заглушка)
 * @access Public
 */
router.post("/", (req, res) => {
  res.status(501).json({
    success: false,
    error: "Not implemented",
    message: "Remote creation not implemented yet",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route PUT /api/v1/remotes/:id
 * @desc Обновить remote (заглушка)
 * @access Public
 */
router.put("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    error: "Not implemented",
    message: "Remote update not implemented yet",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route DELETE /api/v1/remotes/:id
 * @desc Удалить remote (заглушка)
 * @access Public
 */
router.delete("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    error: "Not implemented",
    message: "Remote deletion not implemented yet",
    timestamp: new Date().toISOString(),
  });
});

export default router;
