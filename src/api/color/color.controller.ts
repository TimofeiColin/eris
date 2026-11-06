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
  colorGroupNotFoundResponse,
  colorIdOrNameBadRequestResponse,
  colorNameConflictResponse,
  colorNotFoundResponse,
  getColorNamesOkResponse,
  getColorOkResponse,
  getColorsPaginatedOkResponse,
} from './api-responses';
import { ColorService } from './color.service';
import { CreateColorDto, GetColorNamesQueryDto, GetColorQueryDto, GetColorsQueryDto, UpdateColorDto } from './dto';

@ApiTags('Colors')
@Controller()
@ApiKeyAuth()
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Get('color')
  @ApiOkResponse(getColorOkResponse)
  @ApiBadRequestResponse(colorIdOrNameBadRequestResponse)
  getColor(@Query() query: GetColorQueryDto) {
    return this.colorService.getColor(query.id, query.name);
  }

  @Get('colors')
  @ApiOkResponse(getColorsPaginatedOkResponse)
  getColorsPaginated(@Query() query: GetColorsQueryDto) {
    return this.colorService.getColorsPaginated(query.page, query.name, query.groupId);
  }

  @Get('colors-names')
  @ApiOkResponse(getColorNamesOkResponse)
  @ApiNotFoundResponse(colorGroupNotFoundResponse)
  getColorNamesByGroup(@Query() query: GetColorNamesQueryDto) {
    return this.colorService.getColorNamesByGroup(query.groupId);
  }

  @Post('colors')
  @ApiCreatedResponse(okResponse)
  @ApiNotFoundResponse(colorGroupNotFoundResponse)
  @ApiConflictResponse(colorNameConflictResponse)
  createColor(@Body() body: CreateColorDto) {
    return this.colorService.createColor(body);
  }

  @Patch('colors/:id')
  @ApiOkResponse(okResponse)
  @ApiNotFoundResponse(colorNotFoundResponse)
  @ApiConflictResponse(colorNameConflictResponse)
  updateColor(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateColorDto) {
    return this.colorService.updateColor(id, body);
  }

  @Delete('colors/:id')
  @ApiOkResponse(okResponse)
  @ApiNotFoundResponse(colorNotFoundResponse)
  deleteColor(@Param('id', ParseIntPipe) id: number) {
    return this.colorService.deleteColor(id);
  }
}
