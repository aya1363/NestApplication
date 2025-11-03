import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
export class checkOneFieldExist  implements ValidatorConstraintInterface{
  
  validate(value: any, args: ValidationArguments) {

    console.log();
    return Object.keys(args.object).length > 0 && Object.values(args.object).filter((args) => {
      return args != undefined
      
    } ).length >0 
    
  }
  defaultMessage(args?: ValidationArguments): string {

      
    return `All Update fields are empty , At least one field must be provided for update`
  }
}

export function containField(
  validationOptions?: ValidationOptions) {

  return function (constructor:Function) {
    registerDecorator({
      target: constructor,
      propertyName: undefined!,
      options: validationOptions,
      constraints:[],
      validator: checkOneFieldExist
    });
  };
}