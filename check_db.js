import sequelize from './src/config/database.js';
import { Payment, Service, Quote } from './src/models/index.js';

const checkDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("Payments:");
        const payments = await Payment.findAll();
        payments.forEach(p => console.log(p.toJSON()));
        
        console.log("Services:");
        const services = await Service.findAll();
        services.forEach(s => console.log(s.toJSON()));
        
        console.log("Quotes:");
        const quotes = await Quote.findAll({ where: { user_id: 4 } });
        quotes.forEach(q => console.log(q.toJSON()));
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
};

checkDb();
