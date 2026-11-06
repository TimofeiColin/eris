import { mongo } from 'mongoose';

const DUPLICATE_KEY_ERROR = 11000;

export const isDuplicateKeyError = (error: unknown) =>
  error instanceof mongo.MongoServerError && error.code === DUPLICATE_KEY_ERROR;
