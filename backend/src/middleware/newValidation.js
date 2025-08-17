import Joi from "joi";

// Базовые схемы
const commonSchemas = {
  id: Joi.string().min(1).max(255).required(),
  text: Joi.string().max(1000),
  longText: Joi.string().max(10000),
  boolean: Joi.boolean(),
  integer: Joi.number().integer(),
  positiveInteger: Joi.number().integer().min(1),
  percentage: Joi.number().integer().min(0).max(100),
  color: Joi.string().pattern(
    /^(from-\w+-\d+\s+to-\w+-\d+|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})$/,
  ),
  category: Joi.string().valid("critical", "moderate", "minor", "other"),
  difficulty: Joi.string().valid("beginner", "intermediate", "advanced"),
  jsonArray: Joi.array().items(Joi.any()),
};

// Валидация для создания проблем БЕЗ ID (SERIAL)
export const problemCreationValidation = Joi.object({
  device_id: commonSchemas.id.required(),
  title: Joi.string().min(1).max(500).required(),
  description: commonSchemas.longText,
  category: commonSchemas.category.default("other"),
  icon: Joi.string().max(100).default("HelpCircle"),
  color: commonSchemas.color.default("from-blue-500 to-blue-600"),
  tags: commonSchemas.jsonArray.default([]),
  priority: commonSchemas.positiveInteger.default(1),
  estimated_time: commonSchemas.positiveInteger.default(5),
  difficulty: commonSchemas.difficulty.default("beginner"),
  success_rate: commonSchemas.percentage.default(100),
  status: Joi.string().valid("draft", "published", "archived").default("draft"),
  metadata: Joi.object().unknown(true).optional(),
});

// Валидация для создания шагов БЕЗ ID (SERIAL)
export const stepCreationValidation = Joi.object({
  problem_id: commonSchemas.integer.required(),
  device_id: commonSchemas.id.required(),
  step_number: commonSchemas.positiveInteger.required(),
  title: Joi.string().min(1).max(500).required(),
  description: commonSchemas.longText,
  instruction: commonSchemas.longText.required(),
  estimated_time: commonSchemas.positiveInteger.default(60),
  hint: commonSchemas.text,
  success_text: commonSchemas.text,
  warning_text: commonSchemas.text,
  metadata: Joi.object().unknown(true).optional(),
});

// Валидация для создания устройств БЕЗ ID (SERIAL)
export const deviceCreationValidation = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  brand: Joi.string().min(1).max(255).required(),
  model: Joi.string().min(1).max(255).required(),
  description: commonSchemas.text,
  image_url: Joi.string().uri().max(500),
  logo_url: Joi.string().uri().max(500),
  color: commonSchemas.color.default("from-gray-500 to-gray-600"),
  order_index: commonSchemas.integer.default(0),
  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .default("active"),
  metadata: Joi.object().unknown(true).optional(),
});

// Middleware для валидации
export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    let dataToValidate;

    switch (source) {
      case "body":
        dataToValidate = req.body;
        break;
      case "params":
        dataToValidate = req.params;
        break;
      case "query":
        dataToValidate = req.query;
        break;
      default:
        dataToValidate = req.body;
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      console.warn(`⚠️  ��шибка валидации ${source}:`, validationErrors);

      return res.status(400).json({
        success: false,
        error: "Ошибка валидации данных",
        errorType: "VALIDATION_ERROR",
        details: validationErrors,
        timestamp: new Date().toISOString(),
      });
    }

    // Заменяем исходные данные на валидированные и очищенные
    switch (source) {
      case "body":
        req.body = value;
        break;
      case "params":
        req.params = value;
        break;
      case "query":
        req.query = value;
        break;
    }

    next();
  };
};

export default {
  problemCreationValidation,
  stepCreationValidation,
  deviceCreationValidation,
  validateRequest,
};
