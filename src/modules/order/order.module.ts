import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModel, CartRepository, CouponModel, CouponRepository, OrderModel, OrderRepository, ProductModel, ProductRepository } from 'src/DB';
import { CartService } from '../cart/cart.service';
import { paymentService } from 'src/common';

@Module({
  imports:[OrderModel , ProductModel ,CouponModel ,CartModel],
  controllers: [OrderController],
  providers: [OrderService,
    OrderRepository,
    ProductRepository,
    CouponRepository,
    CartRepository,
    CartService,
    paymentService
  ],
  
})
export class OrderModule {}
