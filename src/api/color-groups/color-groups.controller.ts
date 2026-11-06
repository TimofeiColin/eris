import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiKeyAuth } from '../guards';
import { okResponse } from '../swagger';
import {
  colorGroupHasColorsConflictResponse,
  colorGroupIdOrNameBadRequestResponse,
  colorGroupNameConflictResponse,
  colorGroupNotFoundResponse,
  getColorGroupOkResponse,
  getColorGroupsNamesOkResponse,
  getColorGroupsPaginatedOkResponse,
} from './api-responses';
import { ColorGroupsService } from './color-groups.service';
import { CreateColorGroupDto, GetColorGroupQueryDto, GetColorGroupsQueryDto, UpdateColorGroupDto } from './dto';

@ApiTags('Color Groups')
@Controller()
@ApiKeyAuth()
export class ColorGroupsController {
  constructor(private readonly colorGroupsService: ColorGroupsService) {}

  @Get('color-group')
  @ApiOkResponse(getColorGroupOkResponse)
  @ApiBadRequestResponse(colorGroupIdOrNameBadRequestResponse)
  getColorGroup(@Query() query: GetColorGroupQueryDto) {
    return this.colorGroupsService.getColorGroup(query.id, query.name);
  }

  @Get('color-groups')
  @ApiOkResponse(getColorGroupsPaginatedOkResponse)
  getColorGroupsPaginated(@Query() query: GetColorGroupsQueryDto) {
    return this.colorGroupsService.getColorGroupsPaginated(query.page, query.name);
  }

  @Get('color-groups-names')
  @ApiOkResponse(getColorGroupsNamesOkResponse)
  getColorGroupsNames() {
    return this.colorGroupsService.getColorGroupsNames();
  }

  @Post('color-groups')
  @ApiCreatedResponse(okResponse)
  @ApiConflictResponse(colorGroupNameConflictResponse)
  createColorGroup(@Body() body: CreateColorGroupDto) {
    return this.colorGroupsService.createColorGroup(body.name);
  }

  @Patch('color-groups/:id')
  @ApiOkResponse(okResponse)
  @ApiNotFoundResponse(colorGroupNotFoundResponse)
  @ApiConflictResponse(colorGroupNameConflictResponse)
  updateColorGroup(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateColorGroupDto) {
    return this.colorGroupsService.updateColorGroup(id, body.name);
  }

  @Delete('color-groups/:id')
  @ApiOkResponse(okResponse)
  @ApiNotFoundResponse(colorGroupNotFoundResponse)
  @ApiConflictResponse(colorGroupHasColorsConflictResponse)
  deleteColorGroup(@Param('id', ParseIntPipe) id: number) {
    return this.colorGroupsService.deleteColorGroup(id);
  }
}
