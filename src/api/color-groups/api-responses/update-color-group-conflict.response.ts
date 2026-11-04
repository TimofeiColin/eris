import { ApiResponseOptions } from '@nestjs/swagger';

export const updateColorGroupConflictResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Color group "Blue" already exists', error: 'Conflict', statusCode: 409 },
  },
};
