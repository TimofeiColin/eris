import { ApiResponseOptions } from '@nestjs/swagger';

export const colorNameConflictResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Color "Crimson" already exists', error: 'Conflict', statusCode: 409 },
  },
};
