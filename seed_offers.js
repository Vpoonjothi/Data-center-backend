import { Offer } from './src/models/index.js';
import sequelize from './src/config/database.js';

const seedOffers = async () => {
    try {
        await sequelize.authenticate();
        await Offer.sync({ alter: true }); // Ensure the table exists

        const offers = [
            { name: 'Enterprise Offer', discount: 20, min_vcpu: 16, min_ram: 32 },
            { name: 'Business Offer', discount: 15, min_vcpu: 8, min_ram: 16 },
            { name: 'Startup Offer', discount: 10, min_vcpu: 4, min_ram: 8 }
        ];

        for (const offerData of offers) {
            const existingOffer = await Offer.findOne({ where: { name: offerData.name } });
            if (!existingOffer) {
                await Offer.create(offerData);
                console.log(`Created offer: ${offerData.name}`);
            } else {
                console.log(`Offer already exists: ${offerData.name}`);
            }
        }
        
        console.log('Successfully seeded offers.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding offers:', error);
        process.exit(1);
    }
};

seedOffers();
