import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ApiKeyAuth } from '../guards';
import { getDashboardStatsOkResponse } from './api-responses';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller()
@ApiKeyAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard-stats')
  @ApiOkResponse(getDashboardStatsOkResponse)
  getStats() {
    return this.dashboardService.getStats();
  }
}
