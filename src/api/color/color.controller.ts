import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ApiKeyGuard } from '../guards/api-key.guard';
import { getColorNamesNotFoundResponse, getColorNamesOkResponse } from './api-responses';
import { ColorService } from './color.service';
import { GetColorNamesQueryDto } from './dto';

@ApiTags('Colors')
@Controller()
@UseGuards(ApiKeyGuard)
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @ApiBearerAuth()
  @Get('colors-by-group')
  @ApiOkResponse(getColorNamesOkResponse)
  @ApiNotFoundResponse(getColorNamesNotFoundResponse)
  getColorNamesByGroup(@Query() query: GetColorNamesQueryDto) {
    return this.colorService.getColorNamesByGroup(query.groupId);
  }
}
