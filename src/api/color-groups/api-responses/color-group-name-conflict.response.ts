import { ApiResponseOptions } from '@nestjs/swagger';

export const colorGroupNameConflictResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Color group "Neon" already exists', error: 'Conflict', statusCode: 409 },
  },
};
