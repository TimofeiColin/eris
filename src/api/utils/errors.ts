import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { isDuplicateKeyError } from './is-duplicate-key-error';

export const notFound = (subject: string) => new NotFoundException(`${subject} does not exist`);

export const alreadyExists = (subject: string) => new ConflictException(`${subject} already exists`);

export const requireIdOrName = (id?: number, name?: string) => {
  if ((id === undefined) === (name === undefined)) {
    throw new BadRequestException('Send either id or name');
  }
};

export const rethrowDuplicate = async <T>(operation: Promise<T>, toError: () => Error) => {
  try {
    return await operation;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw toError();
    }

    throw error;
  }
};
