import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const migrateKyc = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const table = 'kyc_verifications';

  try {
    console.log('Starting migration for kyc_verifications...');

    // Define the columns to add
    const columnsToAdd = {
      customer_type: { type: DataTypes.ENUM('individual', 'company'), defaultValue: 'individual' },
      
      // Individual & General
      full_name: { type: DataTypes.STRING, allowNull: true },
      email_address: { type: DataTypes.STRING, allowNull: true },
      mobile_number: { type: DataTypes.STRING, allowNull: true },
      residential_address: { type: DataTypes.TEXT, allowNull: true },
      aadhaar_number: { type: DataTypes.STRING, allowNull: true },

      // Company
      company_name: { type: DataTypes.STRING, allowNull: true },
      gst_number: { type: DataTypes.STRING, allowNull: true },
      pan_number: { type: DataTypes.STRING, allowNull: true },
      registered_address: { type: DataTypes.TEXT, allowNull: true },
      auth_contact_person: { type: DataTypes.STRING, allowNull: true },
      designation: { type: DataTypes.STRING, allowNull: true },
      official_email: { type: DataTypes.STRING, allowNull: true },
      auth_aadhaar_number: { type: DataTypes.STRING, allowNull: true },

      // File Paths
      aadhaar_front_path: { type: DataTypes.STRING, allowNull: true },
      aadhaar_back_path: { type: DataTypes.STRING, allowNull: true },
      gst_cert_path: { type: DataTypes.STRING, allowNull: true },
      pan_card_path: { type: DataTypes.STRING, allowNull: true },
      company_reg_path: { type: DataTypes.STRING, allowNull: true },
      address_proof_path: { type: DataTypes.STRING, allowNull: true },

      // Admin & Audit
      internal_remarks: { type: DataTypes.TEXT, allowNull: true },
      reject_reason: { type: DataTypes.TEXT, allowNull: true },
      verification_comments: { type: DataTypes.TEXT, allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: true },
      submitted_at: { type: DataTypes.DATE, allowNull: true }
    };

    // Get current columns to avoid 'duplicate column' errors if run multiple times
    const currentTableDef = await queryInterface.describeTable(table);

    for (const [columnName, columnDef] of Object.entries(columnsToAdd)) {
      if (!currentTableDef[columnName]) {
        console.log(`Adding column ${columnName}...`);
        await queryInterface.addColumn(table, columnName, columnDef);
      } else {
        console.log(`Column ${columnName} already exists, skipping.`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateKyc();
