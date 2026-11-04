import { ApiResponseOptions } from '@nestjs/swagger';

export const deleteColorGroupOkResponse: ApiResponseOptions = {
  schema: {
    example: { message: 'ok' },
  },
};
