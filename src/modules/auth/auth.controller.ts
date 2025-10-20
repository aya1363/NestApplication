import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';


import { AuthenticationService } from './auth.service';
import { confirmEmailBodyDto, loginBodyDto, resendConfirmEmailBodyDto,SignupBodyDto } from './dto/auth.dto';
import { loginResponse } from './entites';


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

  @Post('resendConfirmEmail')
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

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: loginBodyDto) {
    console.log({ body });
    const credentials = await this.authenticationService.login(body)
    return { message: 'done', data: { credentials } };
  }
}
