import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'matchBetweenTwoFields', async: false })
export class MatchBetweenTwoFields <T=any> implements ValidatorConstraintInterface{
  validate(value: T, args?: ValidationArguments): Promise<boolean> | boolean {
    console.log({
      value,
      args,
      matchWith: args?.constraints[0],
      matchWithValue: args?.object[args.constraints[0]]
    });
    return value ===args?.object['password']
    
    
  }
    defaultMessage(args?: ValidationArguments): string {
    const [relatedFieldName] = args?.constraints ?? [];
    return `${args?.property} must match ${relatedFieldName}`;
  }
}

export function IsMatch<T=any>(
  constraints: string[],
  validationOptions?: ValidationOptions) {

  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: MatchBetweenTwoFields<T>,
    });
  };
}