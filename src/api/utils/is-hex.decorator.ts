import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const IsHex = (validationOptions?: ValidationOptions) => (object: object, propertyName: string) =>
  registerDecorator({
    name: 'isHex',
    target: object.constructor,
    propertyName,
    options: validationOptions,
    validator: {
      validate: (value: unknown) => typeof value === 'string' && HEX_PATTERN.test(value),
      defaultMessage: ({ property }: ValidationArguments) => `${property} must look like #39FF14`,
    },
  });
