import { ContentBlock } from './src/models/index.js';
import sequelize from './src/config/database.js';

const seedCms = async () => {
    try {
        await sequelize.authenticate();
        await ContentBlock.sync({ alter: true }); // Ensure the table exists

        const blocks = [
            { key: 'home.hero.badge', type: 'text', value: 'Enterprise Grade Infrastructure' },
            { key: 'home.hero.title_start', type: 'text', value: 'Next-Generation' },
            { key: 'home.hero.title_highlight', type: 'text', value: 'Data Center' },
            { key: 'home.hero.title_end', type: 'text', value: 'Solutions' },
            { key: 'home.hero.subtitle', type: 'text', value: 'Empowering your digital transformation with high-performance computing, uncompromised security, and 99.99% uptime guarantee.' }
        ];

        for (const blockData of blocks) {
            const existingBlock = await ContentBlock.findOne({ where: { key: blockData.key } });
            if (!existingBlock) {
                await ContentBlock.create(blockData);
                console.log(`Created content block: ${blockData.key}`);
            } else {
                console.log(`Content block already exists: ${blockData.key}`);
            }
        }
        
        console.log('Successfully seeded CMS content.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding CMS:', error);
        process.exit(1);
    }
};

seedCms();
