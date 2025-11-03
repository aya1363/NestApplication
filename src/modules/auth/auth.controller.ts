import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,

} from '@nestjs/common';


import { AuthenticationService } from './auth.service';
import { confirmEmailBodyDto, IGmail, loginBodyDto, resendConfirmEmailBodyDto, ResetPasswordDto, SendOtpDto, SignupBodyDto, VerifyOtpDto } from './dto/auth.dto';
import { IResponse, loginCredentialsResponse, successResponse } from 'src/common';



@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('signup')
  async signup(@Body()
  body: SignupBodyDto):Promise<IResponse<{message:string}>> {
    console.log({ body });
    await this.authenticationService.signup(body)
    return successResponse()
  }

  
  @HttpCode(200)
  @Post('signup/gmail')
  async signupWthGmail(@Body() body: IGmail):Promise<IResponse<loginCredentialsResponse>> {
    console.log({ body });
    const credentials = await this.authenticationService.signupWithGmail(body)
    return successResponse<loginCredentialsResponse>({data: credentials} ) ;
  }

    @HttpCode(200)
  @Post('login/gmail')
  async loginWthGmail(@Body() body: IGmail):Promise<IResponse<loginCredentialsResponse>> {
    console.log({ body });
      const credentials = await this.authenticationService.loginWithGmail(body)
    return successResponse<loginCredentialsResponse>({data: credentials} ) ;
  }

    @Patch('resendConfirmEmail')
    async resendConfirmEmail(@Body()
    body: resendConfirmEmailBodyDto):Promise<IResponse<{message:string}>> {
      console.log({ body });
    await this.authenticationService.resendConfirmEmail(body)
      return successResponse();
    }

    @Patch('confirm-Email')
    async confirmEmail(@Body()
    body: confirmEmailBodyDto):Promise<IResponse<{message:string}>> {
      console.log({ body });
      await this.authenticationService.confirmEmail(body)
    return successResponse();
  }
  
      @Patch('send-forget-password-otp')
    async sendForgetPasswordOtp(@Body()
    body: SendOtpDto):Promise<IResponse<{message:string}>> {
      console.log({ body });
      await this.authenticationService.sendForgetPasswordOtp(body)
      return successResponse()
  }
  
      @Patch('verify-forget-password')
    async verifyForgetPasswordOtp(@Body()
    body: VerifyOtpDto):Promise<IResponse<{message:string}>> {
      console.log({ body });
      await this.authenticationService.verifyForgetPasswordOtp(body)
    return successResponse()
  }
  
      @Patch('reset-password')
    async resetPassword(@Body()
    body: ResetPasswordDto):Promise<IResponse<{message:string}> >{
      console.log({ body });
      await this.authenticationService.resetPassword(body)
    return successResponse()
    }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: loginBodyDto):Promise<IResponse<loginCredentialsResponse>> {
    console.log({ body });
    const credentials = await this.authenticationService.login(body)
    return successResponse<loginCredentialsResponse>({data: credentials} ) ;
  }
}

