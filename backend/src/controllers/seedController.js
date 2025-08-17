import seedDatabase from '../utils/seedData.js';

export const seedData = async (req, res) => {
  try {
    console.log('🌱 Starting database seeding via API...');
    
    const result = await seedDatabase();
    
    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message
    });
  }
};

export default {
  seedData
};
