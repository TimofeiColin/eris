import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorGroupOkResponse: ApiResponseOptions = {
  description: 'The group, or { "message": "Color group \\"Neon\\" not found" } when no group matches',
  schema: {
    example: { _id: 1, name: 'Red' },
  },
};
