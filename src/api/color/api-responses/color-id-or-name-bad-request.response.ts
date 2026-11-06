import { ApiResponseOptions } from '@nestjs/swagger';

export const colorIdOrNameBadRequestResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'Send either id or name', error: 'Bad Request', statusCode: 400 },
  },
};
