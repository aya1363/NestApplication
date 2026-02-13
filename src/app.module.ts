import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedAuthenticationModule } from './common/modules';
import { GlobalExceptionFilter, S3Service } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { APP_FILTER } from '@nestjs/core';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.development'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS:30000
    }),
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    CouponModule,
    OrderModule
    
  ],
  controllers: [AppController],
  providers: [AppService, S3Service,
      {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
