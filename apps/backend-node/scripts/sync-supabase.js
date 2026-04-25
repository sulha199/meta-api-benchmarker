// apps/backend-node/scripts/sync-supabase.js
const fs = require('fs');
const path = require('path');

// 1. Define absolute paths to the migration directories
const drizzleDir = path.join(__dirname, '../drizzle');
const supabaseDir = path.join(__dirname, '../../../apps/backend-supabase/supabase/migrations');

// 2. Read all SQL files from the Drizzle directory
const files = fs.readdirSync(drizzleDir).filter(file => file.endsWith('.sql'));

if (files.length === 0) {
  console.log('⚠️ No Drizzle migrations found. Skipping sync.');
  process.exit(0);
}

// 3. Sort files to ensure we grab the latest one (Drizzle prefixes with 0000_, 0001_, etc.)
files.sort();
const latestFile = files[files.length - 1];

// 4. Generate Supabase timestamp format (YYYYMMDDHHMMSS)
const now = new Date();
const timestamp = now.toISOString().replace(/\D/g, '').slice(0, 14);

// 5. Extract the descriptive part of Drizzle's filename
// Example: "0000_clean_frog.sql" becomes "clean_frog.sql"
const namePart = latestFile.split('_').slice(1).join('_') || latestFile;
const newFilename = `${timestamp}_${namePart}`;

const sourcePath = path.join(drizzleDir, latestFile);
const destPath = path.join(supabaseDir, newFilename);

// 6. Copy the file to the Supabase directory
fs.copyFileSync(sourcePath, destPath);

console.log(`✅ Successfully synced Drizzle migration to Supabase!`);
console.log(`📂 Source: ${latestFile}`);
console.log(`🚀 Destination: ${newFilename}`);
