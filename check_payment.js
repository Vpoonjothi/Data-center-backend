import sequelize from './src/config/database.js';
import { Payment } from './src/models/index.js';

const checkPayment = async () => {
    try {
        await sequelize.authenticate();
        const payments = await Payment.findAll({ where: { quote_id: 14 } });
        console.log(`Found ${payments.length} payments for Quote 14.`);
        payments.forEach(p => console.log(`ID: ${p.id}, Status: ${p.status}`));
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
};

checkPayment();
