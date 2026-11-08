import { ApiResponseOptions } from '@nestjs/swagger';

export const getBotResponsesPaginatedOkResponse: ApiResponseOptions = {
  schema: {
    example: {
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      items: [
        { _id: 1, command: 'hello', responses: ['Hi!', 'Hey there!', 'Hello 👋'] },
        { _id: 2, command: 'good morning', responses: ['Good morning! ☀️', 'Rise and shine!'] },
      ],
    },
  },
};
