import env from './config/env.js';
import app from './app.js';
import pool, { testConnection } from './config/db.js';

const start = async () => {
  try {
    await testConnection();
    console.log(`[db] Connected to MySQL ${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (err) {
    console.error(`[db] Unable to connect to MySQL: ${err.code || ''} ${err.message}`);
    console.error('[db] Check DB_* values in backend/.env and that MySQL is running. Retrying requests lazily…');
  }

  const server = app.listen(env.port, () => {
    console.log(`[api] NŌRÉA API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`[api] ${signal} received, shutting down…`);
    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));
};

start();
