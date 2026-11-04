import { ApiResponseOptions } from '@nestjs/swagger';

export const colorGroupNotFoundResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Color group 99 does not exist', error: 'Not Found', statusCode: 404 },
  },
};
