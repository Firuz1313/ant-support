import { query, transaction } from '../utils/database.js';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const createTimestamp = () => {
  return new Date().toISOString();
};

export const createTestData = async (req, res) => {
  try {
    console.log('🧪 Creating test data...');
    
    await transaction(async (client) => {
      // Create test problems (using SERIAL ID, so no ID specified)
      const problems = [
        {
          device_id: 'hdbox',
          title: 'Нет сигнала',
          description: 'На экране телевизора отображается сообщение "Нет сигнала" или черный экран',
          category: 'critical',
          icon: 'Monitor',
          color: 'from-red-500 to-red-600',
          tags: ['сигнал', 'экран', 'черный экран'],
          priority: 5,
          estimated_time: 10,
          difficulty: 'beginner',
          success_rate: 95,
          status: 'published'
        },
        {
          device_id: 'hdbox',
          title: 'Пульт не работает',
          description: 'Пульт дистанционного управления не реагирует на нажатие кнопок',
          category: 'moderate',
          icon: 'Radio',
          color: 'from-orange-500 to-orange-600',
          tags: ['пульт', 'батарейки', 'управление'],
          priority: 3,
          estimated_time: 5,
          difficulty: 'beginner',
          success_rate: 90,
          status: 'published'
        },
        {
          device_id: 'hdbox',
          title: 'Нет звука',
          description: 'Изображение есть, но звук отсутствует на всех каналах',
          category: 'moderate',
          icon: 'VolumeX',
          color: 'from-blue-500 to-blue-600',
          tags: ['звук', 'аудио', 'mute'],
          priority: 4,
          estimated_time: 8,
          difficulty: 'beginner',
          success_rate: 85,
          status: 'published'
        }
      ];

      const createdProblems = [];
      for (const problem of problems) {
        const problemData = {
          ...problem,
          tags: JSON.stringify(problem.tags), // Convert array to JSON string for PostgreSQL
          is_active: true,
          created_at: createTimestamp(),
          updated_at: createTimestamp()
        };

        const columns = Object.keys(problemData);
        const values = Object.values(problemData);
        const placeholders = columns.map((_, index) => `$${index + 1}`);

        const result = await client.query(
          `INSERT INTO problems (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
          values
        );
        
        createdProblems.push(result.rows[0]);
        console.log(`✅ Created problem: ${problem.title}`);
      }

      // Create test steps for the first problem
      if (createdProblems.length > 0) {
        const firstProblem = createdProblems[0];
        
        const steps = [
          {
            problem_id: firstProblem.id,
            device_id: 'hdbox',
            step_number: 1,
            title: 'Проверьте соединения кабелей',
            description: 'Убедитесь, что все кабели подключены правильно',
            instruction: 'Проверьте подключение HDMI или AV кабеля между приставкой и телевизором. Убедитесь, что кабель плотно вставлен в разъемы.',
            estimated_time: 60,
            hint: 'Попробуйте отключить и снова подключить кабель',
            success_text: 'Кабели подключены правильно'
          },
          {
            problem_id: firstProblem.id,
            device_id: 'hdbox',
            step_number: 2,
            title: 'Проверьте питание приставки',
            description: 'Убедитесь, что приставка включена и получает питание',
            instruction: 'Проверьте, что индикатор питания на приставке горит. Если не горит, проверьте подключение блока питания.',
            estimated_time: 30,
            hint: 'Индикатор обычно находится на передней панели',
            success_text: 'Приставка получает питание'
          }
        ];

        for (const step of steps) {
          const stepData = {
            ...step,
            is_active: true,
            created_at: createTimestamp(),
            updated_at: createTimestamp()
          };

          const columns = Object.keys(stepData);
          const values = Object.values(stepData);
          const placeholders = columns.map((_, index) => `$${index + 1}`);

          await client.query(
            `INSERT INTO diagnostic_steps (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
          );
          
          console.log(`✅ Created step: ${step.title}`);
        }
      }

      // Create some test sessions
      for (let i = 0; i < 5; i++) {
        const sessionData = {
          device_id: 'hdbox',
          problem_id: createdProblems[0]?.id || 1,
          session_id: generateId(),
          start_time: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          total_steps: 2,
          completed_steps: Math.random() > 0.3 ? 2 : 1,
          success: Math.random() > 0.2,
          duration: Math.floor(Math.random() * 300) + 60,
          user_agent: 'Mozilla/5.0 (Test Browser)',
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          is_active: true,
          created_at: createTimestamp(),
          updated_at: createTimestamp()
        };

        const columns = Object.keys(sessionData);
        const values = Object.values(sessionData);
        const placeholders = columns.map((_, index) => `$${index + 1}`);

        await client.query(
          `INSERT INTO diagnostic_sessions (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
          values
        );
      }
      
      console.log(`✅ Created 5 test sessions`);
    });

    console.log('🎉 Test data created successfully!');
    
    res.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        problems: 3,
        steps: 2,
        sessions: 5
      }
    });
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test data',
      error: error.message
    });
  }
};

export default {
  createTestData
};
