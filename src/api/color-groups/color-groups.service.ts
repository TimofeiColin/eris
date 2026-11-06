import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { getItems, getLimit, getPageInfo, getSkip } from '../../common/pagination';
import { ColorGroupRepository, ColorRepository } from '../../database/repositories';
import { COLOR_GROUPS_PER_PAGE } from '../common';
import { isDuplicateKeyError } from '../utils';

const nameTaken = (name: string) => new ConflictException(`Color group "${name}" already exists`);

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
export class ColorGroupsService {
  constructor(
    private readonly colorGroupRepository: ColorGroupRepository,
    private readonly colorRepository: ColorRepository,
  ) {}

  async getColorGroup(id?: number, name?: string) {
    if ((id === undefined) === (name === undefined)) {
      throw new BadRequestException('Send either id or name');
    }

    const group =
      id === undefined
        ? await this.colorGroupRepository.findGroupByName(name!)
        : await this.colorGroupRepository.findGroupById(id);

    return group ?? { message: id === undefined ? `Color group "${name}" not found` : `Color group ${id} not found` };
  }

  async getColorGroupsPaginated(page: number, name?: string) {
    const [groups, totalGroups] = await Promise.all([
      this.colorGroupRepository.findGroupsPaginated(
        name,
        getSkip(page, COLOR_GROUPS_PER_PAGE),
        getLimit(COLOR_GROUPS_PER_PAGE),
      ),
      this.colorGroupRepository.countGroups(name),
    ]);

    return {
      page,
      ...getPageInfo(page, COLOR_GROUPS_PER_PAGE, groups, totalGroups),
      items: getItems(groups, COLOR_GROUPS_PER_PAGE),
    };
  }

  getColorGroupsNames() {
    return this.colorGroupRepository.findGroupsNames();
  }

  async createColorGroup(name: string) {
    if (await this.colorGroupRepository.findGroupByName(name)) {
      throw nameTaken(name);
    }

    await rethrowDuplicateName(name, this.colorGroupRepository.createGroup(name));

    return { message: 'ok' };
  }

  async updateColorGroup(id: number, name: string) {
    const [group, groupWithName] = await Promise.all([
      this.colorGroupRepository.findGroupById(id),
      this.colorGroupRepository.findGroupByName(name),
    ]);

    if (!group) {
      throw groupNotFound(id);
    }

    if (groupWithName && groupWithName._id !== id) {
      throw nameTaken(name);
    }

    if (!(await rethrowDuplicateName(name, this.colorGroupRepository.updateGroupName(id, name)))) {
      throw groupNotFound(id);
    }

    return { message: 'ok' };
  }

  async deleteColorGroup(id: number) {
    const [group, colorsCount] = await Promise.all([
      this.colorGroupRepository.findGroupById(id),
      this.colorRepository.countColorsInGroup(id),
    ]);

    if (!group) {
      throw groupNotFound(id);
    }

    if (colorsCount > 0) {
      throw new ConflictException(`Color group ${id} still has ${colorsCount} colors, remove them first`);
    }

    if (!(await this.colorGroupRepository.deleteGroup(id))) {
      throw groupNotFound(id);
    }

    return { message: 'ok' };
  }
}
