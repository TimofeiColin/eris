import { ApiResponseOptions } from '@nestjs/swagger';

export const botResponseOkResponse: ApiResponseOptions = {
  schema: {
    example: { _id: 4, command: 'good morning', responses: ['Good morning! ☀️', 'Rise and shine!'] },
  },
};
