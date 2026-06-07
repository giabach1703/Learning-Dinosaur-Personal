import dotenv from 'dotenv';
dotenv.config();

import { ensureDefaultBadges } from './services/badgeService';

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

import app from './app';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log('Seeding/verifying default badges...');
    await ensureDefaultBadges();
    
    app.listen(PORT, () => {
      console.log(`Learning Dinosaur API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to bootstrap server:', error);
    process.exit(1);
  }
}

bootstrap();
