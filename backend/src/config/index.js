import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'hostelcare_super_secret_jwt_key_2025_antigravity',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'hostelcare_refresh_secret_key_2025_antigravity',
    expiresIn: '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
};

