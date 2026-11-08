import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorOkResponse: ApiResponseOptions = {
  schema: {
    example: { _id: 2, name: 'Crimson', hex: '#DC143C', group: 1 },
  },
};
