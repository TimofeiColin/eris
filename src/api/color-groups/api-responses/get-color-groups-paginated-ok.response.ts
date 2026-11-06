import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorGroupsPaginatedOkResponse: ApiResponseOptions = {
  schema: {
    example: {
      page: 1,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
      items: [
        { _id: 1, name: 'Red', colorsCount: 9 },
        { _id: 2, name: 'Orange', colorsCount: 5 },
      ],
    },
  },
};
