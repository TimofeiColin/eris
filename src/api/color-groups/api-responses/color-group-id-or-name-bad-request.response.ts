import { ApiResponseOptions } from '@nestjs/swagger';

export const colorGroupIdOrNameBadRequestResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Send either id or name', error: 'Bad Request', statusCode: 400 },
  },
};
