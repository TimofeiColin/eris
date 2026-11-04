import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ApiKeyGuard } from '../guards/api-key.guard';
import { getDashboardStatsOkResponse } from './api-responses';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller()
@UseGuards(ApiKeyGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @Get('dashboard-stats')
  @ApiOkResponse(getDashboardStatsOkResponse)
  getStats() {
    return this.dashboardService.getStats();
  }
}
