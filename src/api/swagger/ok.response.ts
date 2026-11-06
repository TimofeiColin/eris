import { ApiResponseOptions } from '@nestjs/swagger';

export const okResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'ok' },
  },
};
