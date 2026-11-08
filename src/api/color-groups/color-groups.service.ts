import { ConflictException, Injectable } from '@nestjs/common';

import { ColorGroupRepository, ColorRepository } from '../../database/repositories';
import {
  alreadyExists,
  COLOR_GROUPS_PER_PAGE,
  getItems,
  getLimit,
  getPageInfo,
  getSkip,
  notFound,
  requireIdOrName,
  rethrowDuplicate,
} from '../utils';

const nameTaken = (name: string) => alreadyExists(`Color group "${name}"`);

const groupNotFound = (id: number) => notFound(`Color group ${id}`);

@Injectable()
export class ColorGroupsService {
  constructor(
    private readonly colorGroupRepository: ColorGroupRepository,
    private readonly colorRepository: ColorRepository,
  ) {}

  async getColorGroup(id?: number, name?: string) {
    requireIdOrName(id, name);

    const group =
      id === undefined
        ? await this.colorGroupRepository.findGroupByName(name!)
        : await this.colorGroupRepository.findGroupById(id);

    if (!group) {
      throw id === undefined ? notFound(`Color group "${name}"`) : groupNotFound(id);
    }

    return group;
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

    await rethrowDuplicate(this.colorGroupRepository.createGroup(name), () => nameTaken(name));

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

    if (!(await rethrowDuplicate(this.colorGroupRepository.updateGroupName(id, name), () => nameTaken(name)))) {
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
