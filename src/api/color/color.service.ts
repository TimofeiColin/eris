import { Injectable } from '@nestjs/common';

import { ColorGroupRepository, ColorRepository } from '../../database/repositories';
import {
  alreadyExists,
  COLORS_PER_PAGE,
  getItems,
  getLimit,
  getPageInfo,
  getSkip,
  notFound,
  requireIdOrName,
  rethrowDuplicate,
} from '../utils';
import { CreateColorDto, UpdateColorDto } from './dto';

const nameTaken = (name: string) => alreadyExists(`Color "${name}"`);

const colorNotFound = (id: number) => notFound(`Color ${id}`);

const groupNotFound = (id: number) => notFound(`Color group ${id}`);

@Injectable()
export class ColorService {
  constructor(
    private readonly colorRepository: ColorRepository,
    private readonly colorGroupRepository: ColorGroupRepository,
  ) {}

  async getColor(id?: number, name?: string) {
    requireIdOrName(id, name);

    const color =
      id === undefined
        ? await this.colorRepository.findColorByName(name!)
        : await this.colorRepository.findColorById(id);

    if (!color) {
      throw id === undefined ? notFound(`Color "${name}"`) : colorNotFound(id);
    }

    return color;
  }

  async getColorsPaginated(page: number, name?: string, groupId?: number) {
    const [colors, totalColors] = await Promise.all([
      this.colorRepository.findColorsPaginated(
        name,
        groupId,
        getSkip(page, COLORS_PER_PAGE),
        getLimit(COLORS_PER_PAGE),
      ),
      this.colorRepository.countColors(name, groupId),
    ]);

    return {
      page,
      ...getPageInfo(page, COLORS_PER_PAGE, colors, totalColors),
      items: getItems(colors, COLORS_PER_PAGE),
    };
  }

  async getColorNamesByGroup(groupId: number) {
    const [group, colors] = await Promise.all([
      this.colorGroupRepository.findGroupById(groupId),
      this.colorRepository.findNamesByGroup(groupId),
    ]);

    if (!group) {
      throw groupNotFound(groupId);
    }

    return colors;
  }

  async createColor({ name, hex, groupId }: CreateColorDto) {
    const [group, colorWithName] = await Promise.all([
      this.colorGroupRepository.findGroupById(groupId),
      this.colorRepository.findColorByName(name),
    ]);

    if (!group) {
      throw groupNotFound(groupId);
    }

    if (colorWithName) {
      throw nameTaken(name);
    }

    await rethrowDuplicate(this.colorRepository.createColor({ name, hex, group: groupId }), () => nameTaken(name));

    return { message: 'ok' };
  }

  async updateColor(id: number, { name, hex, groupId }: UpdateColorDto) {
    const [color, group, colorWithName] = await Promise.all([
      this.colorRepository.findColorById(id),
      this.colorGroupRepository.findGroupById(groupId),
      this.colorRepository.findColorByName(name),
    ]);

    if (!color) {
      throw colorNotFound(id);
    }

    if (!group) {
      throw groupNotFound(groupId);
    }

    if (colorWithName && colorWithName._id !== id) {
      throw nameTaken(name);
    }

    if (
      !(await rethrowDuplicate(this.colorRepository.updateColor(id, { name, hex, group: groupId }), () =>
        nameTaken(name),
      ))
    ) {
      throw colorNotFound(id);
    }

    return { message: 'ok' };
  }

  async deleteColor(id: number) {
    if (!(await this.colorRepository.findColorById(id))) {
      throw colorNotFound(id);
    }

    if (!(await this.colorRepository.deleteColor(id))) {
      throw colorNotFound(id);
    }

    return { message: 'ok' };
  }
}
