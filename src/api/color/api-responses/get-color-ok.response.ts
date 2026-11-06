import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorOkResponse: ApiResponseOptions = {
  description: 'The color, or { "message": "Color \\"Neon\\" not found" } when no color matches',
  schema: {
    example: { _id: 2, name: 'Crimson', hex: '#DC143C', group: 1 },
  },
};
