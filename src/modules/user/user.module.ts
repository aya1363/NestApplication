import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PreAuth } from 'src/common/middleware/authentication.middleware';
//import { MulterModule } from '@nestjs/platform-express';
//import { diskStorage } from 'multer';
//import type{Request} from 'express'
//import { randomUUID } from 'node:crypto';
//import { SharedAuthenticationModule } from 'src/common/modules';

@Module({
  imports: [
 //   MulterModule.register({
// })
],
  controllers: [UserController],
  providers: [
    UserService,
    

  ],
})
export class UserModule {
 configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreAuth)
      .forRoutes(UserController)
  }
}
