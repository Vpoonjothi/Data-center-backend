import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function fixIndexes() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nexacore_db'
    });

    console.log('Connected to DB');

    // Get all indexes for Users table
    const [rows] = await connection.execute('SHOW INDEXES FROM Users');
    
    // Find all indexes on uuid that are not just "uuid" or we can drop all that start with uuid_
    for (const row of rows) {
      if (row.Key_name.startsWith('uuid') || row.Key_name.startsWith('Users_uuid_')) {
         if (row.Key_name === 'PRIMARY') continue;
         console.log(`Dropping index ${row.Key_name}`);
         try {
           await connection.execute(`ALTER TABLE Users DROP INDEX ${row.Key_name}`);
         } catch (e) {
           console.error(`Failed to drop ${row.Key_name}:`, e.message);
         }
      }
    }
    
    // Add one clean unique index back
    try {
      await connection.execute(`ALTER TABLE Users ADD UNIQUE INDEX uuid (uuid)`);
      console.log('Added clean uuid index');
    } catch(e) {
      console.error('Failed to add index:', e.message);
    }
    
    await connection.end();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixIndexes();
