import { ApiResponseOptions } from '@nestjs/swagger';

export const colorNotFoundResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Color 999 does not exist', error: 'Not Found', statusCode: 404 },
  },
};
