import sequelize from '../config/database.js';

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    const tableInfo = await queryInterface.describeTable('Payments');
    
    if (!tableInfo.failure_reason) {
      await queryInterface.addColumn('Payments', 'failure_reason', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      }, { transaction });
    }
    
    if (!tableInfo.gateway_response) {
      await queryInterface.addColumn('Payments', 'gateway_response', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      }, { transaction });
    }

    await transaction.commit();
    console.log('Razorpay Payments migration completed successfully.');
  } catch (error) {
    await transaction.rollback();
    console.error('Error during Razorpay payments migration:', error);
    throw error;
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    await queryInterface.removeColumn('Payments', 'failure_reason', { transaction });
    await queryInterface.removeColumn('Payments', 'gateway_response', { transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Execute if run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
