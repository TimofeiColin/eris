import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorGroupOkResponse: ApiResponseOptions = {
  schema: {
    example: { _id: 1, name: 'Red' },
  },
};
