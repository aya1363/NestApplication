import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';
import { TokenRepository, UserRepository } from 'src/DB/Repository';
import { TokenModel, UserModel } from 'src/DB/Model';
@Global()
@Module({
imports: [

TokenModel,
UserModel,],

providers: [
TokenService,
TokenRepository,
UserRepository,
JwtService],

exports: [
TokenService,
TokenRepository,
UserRepository,
TokenModel,
UserModel,
JwtService],
})
export class SharedAuthenticationModule {}
