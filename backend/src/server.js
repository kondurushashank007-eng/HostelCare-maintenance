import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { checkAndEscalateComplaints } from './services/escalationService.js';
import { isUsingFallbackDb } from './config/supabase.js';

const PORT = config.port || 5000;

app.listen(PORT, async () => {
  logger.info(`=======================================================`);
  logger.info(`  HostelCare Backend Server running on port ${PORT}`);
  logger.info(`  Mode: ${config.nodeEnv}`);
  logger.info(`  Database: ${isUsingFallbackDb() ? 'Local Resilient Fallback Engine' : 'Supabase PostgreSQL'}`);
  logger.info(`  Client URL: ${config.clientUrl}`);
  logger.info(`=======================================================`);

  // Run initial escalation check
  try {
    await checkAndEscalateComplaints();
  } catch (err) {
    logger.warn('[Startup] Initial escalation check skipped:', err.message);
  }

  // Schedule periodic escalation check every 15 minutes
  setInterval(async () => {
    try {
      await checkAndEscalateComplaints();
    } catch (err) {
      logger.warn('[Scheduled] Periodic escalation check error:', err.message);
    }
  }, 15 * 60 * 1000);
});

