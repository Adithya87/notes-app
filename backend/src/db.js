import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://notes_app_v3t6_user:v1XQ3XpA3edLCLR1kROeDPij4gHR9KKc@dpg-d7f0l97lk1mc73c3ddig-a/notes_app_v3t6'
});

export default pool;
