import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Types } from "mongoose";


@ValidatorConstraint({ name: 'matchBetweenTwoFields', async: false })
export class MongoIdsValidate  implements ValidatorConstraintInterface{
  validate(ids: Types.ObjectId[], args?: ValidationArguments): Promise<boolean> | boolean {
  console.log(args?.property);
  
    for (const id of ids) {
    if (!Types.ObjectId.isValid(id)) {
      return false
    }
  }
    return true
  }
    defaultMessage(args?: ValidationArguments): string {
    console.log(args?.property);
    
      return `invalid mongo DB Ids format`;
  }
}

@ValidatorConstraint({ name: 'matchBetweenTwoFields', async: false })
export class MatchBetweenTwoFields <T=any> implements ValidatorConstraintInterface{
  validate(value: T, args?: ValidationArguments): Promise<boolean> | boolean {
    console.log({
      value,
      args,
      matchWith: args?.constraints[0],
      matchWithValue: args?.object[args.constraints[0]]
    });
    return value ===args?.object[args.constraints[0]]
    
    
  }
    defaultMessage(args?: ValidationArguments): string {
    const [relatedFieldName] = args?.constraints[0] ?? [];
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