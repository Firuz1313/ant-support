/**
 * Database Fallback Middleware
 * Обрабатывает ошибки подключения к базе данных и возвращает fallback ответы
 */

export const databaseFallbackWrapper = (asyncFn) => {
  return async (req, res, next) => {
    try {
      await asyncFn(req, res, next);
    } catch (error) {
      console.error('Database operation failed:', error.message);
      
      // Проверяем тип ошибки базы данных
      if (error.code === 'ECONNREFUSED' || 
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('connect ECONNREFUSED')) {
        
        // Возвращаем fallback ответ для отсутствующей БД
        return res.json({
          success: true,
          data: [],
          message: 'Database unavailable, returning empty result set',
          fallback: true,
          timestamp: new Date().toISOString()
        });
      }

      // Для других ошибок возвращаем стандартную ошибку 500
      return res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        errorType: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        debug: process.env.DEBUG === 'true' ? {
          originalMessage: error.message,
          stack: error.stack
        } : undefined
      });
    }
  };
};

export const safeDatabaseCall = async (fn, fallbackValue = []) => {
  try {
    return await fn();
  } catch (error) {
    console.warn('Database call failed, using fallback:', error.message);
    
    if (error.code === 'ECONNREFUSED' || 
        error.message.includes('ECONNREFUSED')) {
      return fallbackValue;
    }
    
    throw error; // Re-throw non-connection errors
  }
};

export default databaseFallbackWrapper;
