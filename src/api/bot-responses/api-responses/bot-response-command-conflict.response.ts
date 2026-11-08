import { ApiResponseOptions } from '@nestjs/swagger';

export const botResponseCommandConflictResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Bot response for "hello" already exists', error: 'Conflict', statusCode: 409 },
  },
};
