import { ApiResponseOptions } from '@nestjs/swagger';

export const deleteColorGroupConflictResponse: ApiResponseOptions = {
  schema: {
    example: {
      message: 'Color group 1 still has 9 colors, remove them first',
      error: 'Conflict',
      statusCode: 409,
    },
  },
};
