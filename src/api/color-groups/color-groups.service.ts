import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { mongo } from 'mongoose';

import { COLOR_GROUPS_PER_PAGE, ColorGroupRepository } from '../../database/repositories';
import { getItems, getTotalPages, hasNextPage, hasPreviousPage } from '../utils';

const DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class ColorGroupsService {
  constructor(private readonly colorGroupRepository: ColorGroupRepository) {}

  async getColorGroupNames(page: number, name?: string) {
    const filterName = name?.trim();
    const [groups, totalGroups] = await Promise.all([
      this.colorGroupRepository.findGroupNames(filterName, page),
      this.colorGroupRepository.countGroupNames(filterName),
    ]);

    return {
      page,
      totalPages: getTotalPages(totalGroups, COLOR_GROUPS_PER_PAGE),
      hasNextPage: hasNextPage(groups, COLOR_GROUPS_PER_PAGE),
      hasPreviousPage: hasPreviousPage(page),
      items: getItems(groups, COLOR_GROUPS_PER_PAGE),
    };
  }

  async colorGroupExists(name: string) {
    return { exists: await this.colorGroupRepository.existsByName(name) };
  }

  async createColorGroup(name: string) {
    if (await this.colorGroupRepository.existsByName(name)) {
      throw nameTaken(name);
    }

    await rethrowDuplicateName(name, this.colorGroupRepository.createGroup(name));

    return { message: 'ok' };
  }

  async updateColorGroup(id: number, name: string) {
    const [groupExists, isNameTaken] = await Promise.all([
      this.colorGroupRepository.existsById(id),
      this.colorGroupRepository.existsByName(name, id),
    ]);

    if (!groupExists) {
      throw groupNotFound(id);
    }

    if (isNameTaken) {
      throw nameTaken(name);
    }

    if (!(await rethrowDuplicateName(name, this.colorGroupRepository.updateGroupName(id, name)))) {
      throw groupNotFound(id);
    }

    return { message: 'ok' };
  }

  async deleteColorGroup(id: number) {
    const [groupExists, colorsCount] = await Promise.all([
      this.colorGroupRepository.existsById(id),
      this.colorGroupRepository.countColorsInGroup(id),
    ]);

    if (!groupExists) {
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

const nameTaken = (name: string) => new ConflictException(`Color group "${name}" already exists`);

const groupNotFound = (id: number) => new NotFoundException(`Color group ${id} does not exist`);

const rethrowDuplicateName = async <T>(name: string, operation: Promise<T>) => {
  try {
    return await operation;
  } catch (error) {
    if (error instanceof mongo.MongoServerError && error.code === DUPLICATE_KEY_ERROR) {
      throw nameTaken(name);
    }

    throw error;
  }
};
