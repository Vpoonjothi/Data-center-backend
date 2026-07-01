import sequelize, { connectDB } from '../config/database.js';
import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
  try {
    await connectDB();
    console.log('Running KYC Document Status Migration...');

    const queryInterface = sequelize.getQueryInterface();

    const documents = [
      'aadhaar_front',
      'aadhaar_back',
      'gst_cert',
      'pan_card',
      'company_reg',
      'address_proof'
    ];

    for (const doc of documents) {
      // Add status column
      try {
        await queryInterface.addColumn('kyc_verifications', `${doc}_status`, {
          type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'),
          defaultValue: 'pending',
          allowNull: false
        });
        console.log(`Added ${doc}_status`);
      } catch (e) {
        console.log(`Column ${doc}_status might already exist:`, e.message);
      }

      // Add reason column
      try {
        await queryInterface.addColumn('kyc_verifications', `${doc}_reason`, {
          type: DataTypes.TEXT,
          allowNull: true
        });
        console.log(`Added ${doc}_reason`);
      } catch (e) {
        console.log(`Column ${doc}_reason might already exist:`, e.message);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
