import { config } from '@/config';
import { createLogger } from '@/lib/Logger';

export const logger = createLogger({ level: config.logLevel });
