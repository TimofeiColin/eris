import { ApiResponseOptions } from '@nestjs/swagger';

export const getDashboardStatsOkResponse: ApiResponseOptions = {
  schema: {
    example: {
      colorGroups: 5,
      colors: 23,
      sayings: 0,
    },
  },
};
