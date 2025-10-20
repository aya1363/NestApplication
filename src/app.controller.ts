import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './modules/user/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
