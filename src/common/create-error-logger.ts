import { Logger } from '@nestjs/common';

export const createErrorLogger = (logger: Logger) => (error: Error) => logger.error(error.message, error.stack);
