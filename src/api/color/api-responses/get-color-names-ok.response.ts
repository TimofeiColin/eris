import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorNamesOkResponse: ApiResponseOptions = {
  schema: {
    example: [
      { _id: 1, name: 'Red' },
      { _id: 2, name: 'Crimson' },
    ],
  },
};
