import { plainToInstance } from 'class-transformer';
import {
  registerDecorator,
  ValidatorOptions,
  ValidationArguments,
  validateSync,
} from 'class-validator';
export function ValidateNested(
  schema: new () => any,
  validationOptions?: ValidatorOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'ValidateNested',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          args.value;
          if (Array.isArray(args.value)) {
            for (let i = 0; i < (<Array<any>>value).length; i++) {
              if (validateSync(plainToInstance(schema, value[i])).length) {
                return false;
              }
            }
            return true;
          } else {
            return validateSync(plainToInstance(schema, value)).length
              ? false
              : true;
          }
        },
        defaultMessage(args) {
          if (Array.isArray(args.value)) {
            for (let i = 0; i < (<Array<any>>args.value).length; i++) {
              return (
                `${args.property}::index${i} -> ` +
                validateSync(plainToInstance(schema, args.value[i]))
                  .map((e) => e.constraints)
                  .reduce((acc, next) => acc.concat(Object.values(next)), [])
              ).toString();
            }
          } else {
            return (
              `${args.property}: ` +
              validateSync(plainToInstance(schema, args.value))
                .map((e) => e.constraints)
                .reduce((acc, next) => acc.concat(Object.values(next)), [])
            ).toString();
          }
        },
      },
    });
  };
}
