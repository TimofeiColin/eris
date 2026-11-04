import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ApiKeyGuard } from '../guards/api-key.guard';
import {
  colorGroupNotFoundResponse,
  createColorGroupConflictResponse,
  createColorGroupOkResponse,
  deleteColorGroupConflictResponse,
  deleteColorGroupOkResponse,
  getColorGroupExistsOkResponse,
  getColorGroupNamesOkResponse,
  updateColorGroupConflictResponse,
  updateColorGroupOkResponse,
} from './api-responses';
import { ColorGroupsService } from './color-groups.service';
import { CreateColorGroupDto, GetColorGroupQueryDto, GetColorGroupsQueryDto, UpdateColorGroupDto } from './dto';

@ApiTags('Color Groups')
@Controller()
@UseGuards(ApiKeyGuard)
export class ColorGroupsController {
  constructor(private readonly colorGroupsService: ColorGroupsService) {}

  @ApiBearerAuth()
  @Get('color-group')
  @ApiOkResponse(getColorGroupExistsOkResponse)
  colorGroupExists(@Query() query: GetColorGroupQueryDto) {
    return this.colorGroupsService.colorGroupExists(query.name);
  }

  @ApiBearerAuth()
  @Get('color-groups')
  @ApiOkResponse(getColorGroupNamesOkResponse)
  getColorGroupNames(@Query() query: GetColorGroupsQueryDto) {
    return this.colorGroupsService.getColorGroupNames(query.page, query.name);
  }

  @ApiBearerAuth()
  @Post('color-groups')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(createColorGroupOkResponse)
  @ApiConflictResponse(createColorGroupConflictResponse)
  createColorGroup(@Body() body: CreateColorGroupDto) {
    return this.colorGroupsService.createColorGroup(body.name);
  }

  @ApiBearerAuth()
  @Patch('color-groups/:id')
  @ApiOkResponse(updateColorGroupOkResponse)
  @ApiNotFoundResponse(colorGroupNotFoundResponse)
  @ApiConflictResponse(updateColorGroupConflictResponse)
  updateColorGroup(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateColorGroupDto) {
    return this.colorGroupsService.updateColorGroup(id, body.name);
  }

  @ApiBearerAuth()
  @Delete('color-groups/:id')
  @ApiOkResponse(deleteColorGroupOkResponse)
  @ApiNotFoundResponse(colorGroupNotFoundResponse)
  @ApiConflictResponse(deleteColorGroupConflictResponse)
  deleteColorGroup(@Param('id', ParseIntPipe) id: number) {
    return this.colorGroupsService.deleteColorGroup(id);
  }
}
