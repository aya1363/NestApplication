import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import {
  UserModel,
  UserRepository,
  
  OtpModel,
  OtpRepository,
  TokenRepository,
} from 'src/DB';
import { tokenService } from 'src/common';

@Module({
  imports: [
    JwtModule.register({}),
    UserModel,
    OtpModel,
  ],
  providers: [
    AuthenticationService,
    tokenService,
    UserRepository,
    OtpRepository,
    JwtService,
    TokenRepository
  ],
  exports: [tokenService,UserRepository],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
