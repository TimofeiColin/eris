import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ApiKeyGuard } from './api-key.guard';

export const ApiKeyAuth = () => applyDecorators(UseGuards(ApiKeyGuard), ApiBearerAuth());
