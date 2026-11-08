import { TransformFnParams } from 'class-transformer';

export const trimStrings = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value) ? value.map((item: unknown) => (typeof item === 'string' ? item.trim() : item)) : value;
