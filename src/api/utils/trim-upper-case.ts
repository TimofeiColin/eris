import { TransformFnParams } from 'class-transformer';

export const trimUpperCase = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;
