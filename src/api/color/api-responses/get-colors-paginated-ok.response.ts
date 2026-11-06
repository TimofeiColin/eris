import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorsPaginatedOkResponse: ApiResponseOptions = {
  schema: {
    example: {
      page: 1,
      totalPages: 25,
      hasNextPage: true,
      hasPreviousPage: false,
      items: [
        { _id: 1, name: 'Red', hex: '#FF0000', group: 1, groupName: 'Red' },
        { _id: 2, name: 'Crimson', hex: '#DC143C', group: 1, groupName: 'Red' },
      ],
    },
  },
};
