import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Resolve backend directory and load .env from there
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

