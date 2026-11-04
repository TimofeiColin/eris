import { ApiResponseOptions } from '@nestjs/swagger';

export const createColorGroupOkResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'ok' },
  },
};
