import Problem from '../models/Problem.js';
import Device from '../models/Device.js';

const problemModel = new Problem();
const deviceModel = new Device();

/**
 * Тестовое создание проблемы без валидации
 */
export const testCreateProblem = async (req, res) => {
  try {
    console.log('🧪 Test problem creation without validation');
    console.log('📤 Request body:', JSON.stringify(req.body, null, 2));
    
    const problemData = req.body;

    // Проверяем существование устройства
    if (problemData.device_id) {
      const device = await deviceModel.findById(problemData.device_id);
      if (!device || !device.is_active) {
        return res.status(400).json({
          success: false,
          error: 'Указанное устройство не найдено или неактивно',
          errorType: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('✅ Device validation passed');

    const newProblem = await problemModel.create(problemData);
    console.log('✅ Problem created:', newProblem);

    res.status(201).json({
      success: true,
      data: newProblem,
      message: 'Тестовая проблема успешно создана',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test problem creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

export default {
  testCreateProblem
};
