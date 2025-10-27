import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

import { GenderEnum, IsMatch } from 'src/common';

export class IGmail {
  @IsString()
  idToken: string;
}

export class resendConfirmEmailBodyDto {
  @IsEmail()
  email: string;
}
export class confirmEmailBodyDto extends resendConfirmEmailBodyDto {
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}


export class loginBodyDto extends resendConfirmEmailBodyDto {
  @IsStrongPassword({ minUppercase: 2 })
  password: string;
}

export class SignupBodyDto {
  @Length(2, 52, {
    message: 'userName min length min 2 and max 52 characters',
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({ minUppercase: 2 })
  password: string;
  @ValidateIf((data: SignupBodyDto) => {
    return Boolean(data.password);
  })
  @IsMatch<string>(['password'], {
    message: 'confirm password not identical with password',
  })
  confirmPassword: string;

  @IsEnum(GenderEnum, { message: 'Gender must be either Male or Female' })
  gender: GenderEnum;
}

export class SendOtpDto {
 @IsEmail()
  email: string
}
export class VerifyOtpDto extends SendOtpDto{
 
 @IsString()
  otp :string
}
export class ResetPasswordDto extends VerifyOtpDto{
  @IsStrongPassword({ minUppercase: 2 })
  newPassword:string
 
}
