import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PreAuth } from 'src/common/middleware/authentication.middleware';
import { S3Service } from 'src/common';

@Module({
  imports: [

],
  controllers: [UserController],
  providers: [
    UserService,
    S3Service
    

  ],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreAuth)
      .forRoutes(UserController)
  }
}
