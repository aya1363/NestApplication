import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  CartRepository, CouponRepository, type OrderDocument,
  OrderProduct, OrderRepository, type ProductDocument, ProductRepository, type UserDocument
} from '../../DB';
import {
  CouponEnum, OrderStatusEnum, PaymentEnumType,
  paymentService
} from '../../common';
import { randomUUID } from 'node:crypto';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService:paymentService,
    private readonly cardService: CartService,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly couponRepository: CouponRepository,
    private readonly cartRepository: CartRepository,
  ) {}
  async create(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<OrderDocument> {
    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
    });
    if (!cart?.products?.length) {
      throw new NotFoundException('empty cart');
    }
    let discount = 0;
    let coupon: any;
    if (createOrderDto?.coupon) {
      coupon = await this.couponRepository.findOne({
        filter: {
          _id: createOrderDto.coupon,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
      });
      if (!coupon) {
        throw new NotFoundException('fail to find matching coupon');
      }
      if (
        coupon.duration <=
        coupon.usedBy.filter((ele: Types.ObjectId) => {
          return ele.toString() == user._id.toString();
        }).length
      ) {
        throw new ConflictException(`so you have reached the
          limit for this coupon can be used only 
          ${coupon.duration} times , please try another valid coupon`);
      }
    }
    let total = 0;
    const products: OrderProduct[] = [];

    for (const product of cart.products) {
      const cartProduct = await this.productRepository.findOne({
        filter: {
          _id: product.product,
          stock: { $gte: product.quantity },
        },
      });
      if (!cartProduct) {
        throw new NotFoundException(
          `fail to find matching product  ${(product.product as any)?.toString()} or out of stock`,
        );
      }
      const finalPrice = cartProduct.salePrice * product.quantity;
      products.push({
        productId: cartProduct._id,
        quantity: product.quantity,
        unitPrice: cartProduct.salePrice,
        finalPrice,
      });
      total += finalPrice;
    }
    if (coupon) {
      discount =
        coupon.type == CouponEnum.PERCENT
          ? coupon.discount / 100
          : coupon.discount;
    }
    delete createOrderDto.coupon;

    const [order] = await this.orderRepository.create({
      data: [
        {
          ...createOrderDto,
          coupon: coupon?._id,
          discount,
          orderId: randomUUID().slice(0, 8),
          createdBy: user._id,
          products,
          total,
        },
      ],
    });
    if (!order) {
      throw new BadRequestException('fail to create this order ');
    }
    if (coupon) {
      coupon.usedBy.push(user._id);
      await coupon.save();
    }
    for (const product of cart.products) {
      await this.productRepository.updateOne({
        filter: {
          _id: product.product,
          stock: { $gte: product.quantity },
        },
        update: {
          $inc: { __v: 1, stock: -product.quantity },
        },
      });
    }
    await this.cardService.removeCart(user);

    return order;
  }
  async checkout(
    orderId: Types.ObjectId,
    user: UserDocument,
  ) {
    console.log(orderId,user);
    
    const order = await this.orderRepository.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        payment: PaymentEnumType.card,
        status:OrderStatusEnum.Pending
      },
      options: {
        populate:[{path:'products.productId',select:'name'}]
      }
    })
    if (!order) {
      throw new NotFoundException('fail to find matching order')
    }
    const session = await this.paymentService.checkoutSession({
      customer_email: user.email,
      metadata:{orderId:orderId.toString()},
      line_items: order.products.map(product => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: 'egp',
            product_data: {
              name: (product.productId as ProductDocument).name,
            },
            unit_amount: Math.round(product.unitPrice * 100),
          },
        };
      })
    })
    return session
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
