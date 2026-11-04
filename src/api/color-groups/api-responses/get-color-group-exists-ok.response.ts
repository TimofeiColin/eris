import { ApiResponseOptions } from '@nestjs/swagger';

export const getColorGroupExistsOkResponse: ApiResponseOptions = {
  schema: {
    example: { exists: true },
  },
};
