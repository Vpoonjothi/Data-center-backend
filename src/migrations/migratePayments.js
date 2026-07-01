import sequelize from '../config/database.js';

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    // 1. Add new columns
    const tableInfo = await queryInterface.describeTable('Payments');
    
    if (!tableInfo.invoice_reference) {
      await queryInterface.addColumn('Payments', 'invoice_reference', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    }
    
    if (!tableInfo.payment_method) {
      await queryInterface.addColumn('Payments', 'payment_method', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    }

    if (!tableInfo.bank_name) {
      await queryInterface.addColumn('Payments', 'bank_name', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    }

    if (!tableInfo.payment_screenshot) {
      await queryInterface.addColumn('Payments', 'payment_screenshot', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    }

    if (!tableInfo.remarks) {
      await queryInterface.addColumn('Payments', 'remarks', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      }, { transaction });
    }

    // 2. Modify enum values manually (SQLite doesn't support changing enums, and MySQL/Postgres have varying support)
    // To be safe across dialects, we alter the column type. In SQLite we might just alter column to VARCHAR first.
    // If we're using SQLite, we can just leave it as is if it's treating ENUM as VARCHAR anyway.
    // Let's assume MySQL/PostgreSQL. We can just change the column type to ENUM with new values.
    
    // For SQLite, ENUM is just a VARCHAR restriction, sometimes we can't alter column easily.
    // However, since we are doing this for Greenleaf which seems to use MySQL (DataTypes.ENUM), 
    // let's do an ALTER TABLE.
    
    // A safer way to migrate ENUMs without dropping is to change the column to VARCHAR, then back to ENUM,
    // or just run a raw query to update ENUM. Let's do raw query if it's MySQL.
    
    const dialect = sequelize.getDialect();
    if (dialect === 'mysql') {
      await sequelize.query("ALTER TABLE Payments MODIFY COLUMN status ENUM('Pending Verification', 'Verified', 'Rejected') DEFAULT 'Pending Verification'", { transaction });
      
      // Update existing records
      await sequelize.query("UPDATE Payments SET status = 'Pending Verification' WHERE status = 'Pending'", { transaction });
      await sequelize.query("UPDATE Payments SET status = 'Verified' WHERE status = 'Paid'", { transaction });
      await sequelize.query("UPDATE Payments SET status = 'Rejected' WHERE status = 'Failed'", { transaction });
    } else {
      // For SQLite, we can update the strings directly since ENUM is just text
      await sequelize.query("UPDATE Payments SET status = 'Pending Verification' WHERE status = 'Pending'", { transaction });
      await sequelize.query("UPDATE Payments SET status = 'Verified' WHERE status = 'Paid'", { transaction });
      await sequelize.query("UPDATE Payments SET status = 'Rejected' WHERE status = 'Failed'", { transaction });
    }

    await transaction.commit();
    console.log('Payments migration completed successfully.');
  } catch (error) {
    await transaction.rollback();
    console.error('Error during payments migration:', error);
    throw error;
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    await queryInterface.removeColumn('Payments', 'invoice_reference', { transaction });
    await queryInterface.removeColumn('Payments', 'payment_method', { transaction });
    await queryInterface.removeColumn('Payments', 'bank_name', { transaction });
    await queryInterface.removeColumn('Payments', 'payment_screenshot', { transaction });
    await queryInterface.removeColumn('Payments', 'remarks', { transaction });
    
    // Note: Reverting enum back is complex and often skipped in down migrations unless strictly required.
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Execute if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
