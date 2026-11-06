import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { getItems, getLimit, getPageInfo, getSkip } from '../../common/pagination';
import { ColorGroupRepository, ColorRepository } from '../../database/repositories';
import { COLORS_PER_PAGE } from '../common';
import { isDuplicateKeyError } from '../utils';
import { CreateColorDto, UpdateColorDto } from './dto';

const nameTaken = (name: string) => new ConflictException(`Color "${name}" already exists`);

const colorNotFound = (id: number) => new NotFoundException(`Color ${id} does not exist`);

const groupNotFound = (id: number) => new NotFoundException(`Color group ${id} does not exist`);

const rethrowDuplicateName = async <T>(name: string, operation: Promise<T>) => {
  try {
    return await operation;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw nameTaken(name);
    }

    throw error;
  }
};

@Injectable()
export class ColorService {
  constructor(
    private readonly colorRepository: ColorRepository,
    private readonly colorGroupRepository: ColorGroupRepository,
  ) {}

  async getColor(id?: number, name?: string) {
    if ((id === undefined) === (name === undefined)) {
      throw new BadRequestException('Send either id or name');
    }

    const color =
      id === undefined
        ? await this.colorRepository.findColorByName(name!)
        : await this.colorRepository.findColorById(id);

    return color ?? { message: id === undefined ? `Color "${name}" not found` : `Color ${id} not found` };
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

    await rethrowDuplicateName(name, this.colorRepository.createColor({ name, hex, group: groupId }));

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

    if (!(await rethrowDuplicateName(name, this.colorRepository.updateColor(id, { name, hex, group: groupId })))) {
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
