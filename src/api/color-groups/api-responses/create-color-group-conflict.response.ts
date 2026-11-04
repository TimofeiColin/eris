import { ApiResponseOptions } from '@nestjs/swagger';

export const createColorGroupConflictResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Color group "Neon" already exists', error: 'Conflict', statusCode: 409 },
  },
};
