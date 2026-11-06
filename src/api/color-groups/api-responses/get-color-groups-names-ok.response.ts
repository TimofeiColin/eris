import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorGroupsNamesOkResponse: ApiResponseOptions = {
  schema: {
    example: [
      { _id: 1, name: 'Red' },
      { _id: 2, name: 'Orange' },
    ],
  },
};
