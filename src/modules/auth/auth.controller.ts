import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,

} from '@nestjs/common';


import { AuthenticationService } from './auth.service';
import { confirmEmailBodyDto, IGmail, loginBodyDto, resendConfirmEmailBodyDto, ResetPasswordDto, SendOtpDto, SignupBodyDto, VerifyOtpDto } from './dto/auth.dto';



@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('signup')
  async signup(@Body()
  body: SignupBodyDto) {
    console.log({ body });
    await this.authenticationService.signup(body)
    return { message: 'done' };
  }

  
  @HttpCode(200)
  @Post('signup/gmail')
  async signupWthGmail(@Body() body: IGmail) {
    console.log({ body });
    const credentials = await this.authenticationService.signupWithGmail(body)
    return { message: 'done', data: { credentials } };
  }

    @HttpCode(200)
  @Post('login/gmail')
  async loginWthGmail(@Body() body: IGmail) {
    console.log({ body });
      const credentials = await this.authenticationService.loginWithGmail(body)
    return { message: 'done', data: { credentials } };
  }

    @Patch('resendConfirmEmail')
    async resendConfirmEmail(@Body()
    body: resendConfirmEmailBodyDto) {
      console.log({ body });
    await this.authenticationService.resendConfirmEmail(body)
      return { message: 'done' };
    }

    @Patch('confirm-Email')
    async confirmEmail(@Body()
    body: confirmEmailBodyDto) {
      console.log({ body });
      await this.authenticationService.confirmEmail(body)
    return { message: 'done' };
  }
  
      @Patch('send-forget-password-otp')
    async sendForgetPasswordOtp(@Body()
    body: SendOtpDto) {
      console.log({ body });
      await this.authenticationService.sendForgetPasswordOtp(body)
    return { message: 'done' };
  }
  
      @Patch('verify-forget-password')
    async verifyForgetPasswordOtp(@Body()
    body: VerifyOtpDto) {
      console.log({ body });
      await this.authenticationService.verifyForgetPasswordOtp(body)
    return { message: 'done' };
  }
  
      @Patch('reset-password')
    async resetPassword(@Body()
    body: ResetPasswordDto) {
      console.log({ body });
      await this.authenticationService.resetPassword(body)
    return { message: 'done' };
    }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: loginBodyDto) {
    console.log({ body });
    const credentials = await this.authenticationService.login(body)
    return { message: 'done', data: { credentials } };
  }
}

