import { Module } from '@nestjs/common';

import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';


import { OtpModel } from 'src/DB/Model';
import { OtpRepository} from 'src/DB/Repository';
import { SharedAuthenticationModule } from 'src/common/modules';

@Module({
  imports: [SharedAuthenticationModule, OtpModel],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
  OtpRepository],
  exports: [
    SharedAuthenticationModule
  ]
})
export class AuthenticationModule {}
