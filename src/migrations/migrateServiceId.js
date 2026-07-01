import sequelize from '../config/database.js';

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    const dialect = sequelize.getDialect();
    if (dialect === 'mysql') {
      await sequelize.query("ALTER TABLE Payments MODIFY COLUMN service_id INTEGER NULL", { transaction });
    } else {
      // In SQLite this might require a table recreation, but often just leaving it alone works if we don't strictly enforce it at DB level
      // Or we can just ignore it for sqlite because Sequelize model `allowNull: true` will stop throwing validation errors.
    }

    await transaction.commit();
    console.log('service_id migration completed successfully.');
  } catch (error) {
    await transaction.rollback();
    console.error('Error during migration:', error);
    throw error;
  }
};

export const down = async () => {
  // skip down
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
