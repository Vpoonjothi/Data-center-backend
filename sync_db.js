import sequelize from './src/config/database.js';

const syncDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        await sequelize.query("ALTER TABLE Quotes MODIFY status ENUM('pending', 'quoted', 'verification_pending', 'verified', 'processing', 'paid', 'active', 'rejected') DEFAULT 'pending';");
        console.log('Quote table enum altered successfully');
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
};

syncDb();
