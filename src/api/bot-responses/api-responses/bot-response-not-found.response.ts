import { ApiResponseOptions } from '@nestjs/swagger';

export const botResponseNotFoundResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Bot response 99 does not exist', error: 'Not Found', statusCode: 404 },
  },
};
