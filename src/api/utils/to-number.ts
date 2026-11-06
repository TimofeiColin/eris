import { TransformFnParams } from 'class-transformer';

export const toNumber = ({ value }: TransformFnParams): unknown =>
  value === undefined || value === '' ? undefined : Number(value);
