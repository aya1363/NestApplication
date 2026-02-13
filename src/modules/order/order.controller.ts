import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { endPoint } from './order.authorization';
import { Auth, IResponse, successResponse, User } from '../../common';
import type{ UserDocument } from '../../DB';
import { OrderResponse } from './entities/order.entity';
import { OrderParamsDto } from './dto/update-order.dto';
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Auth(endPoint.create)
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: UserDocument,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ status:201 ,data: { order } });
  }

  @Auth(endPoint.create)
  @Post(':orderId')
  async checkout(
    @Param() params:OrderParamsDto,
    @User() user: UserDocument,
  ) {
    const session = await this.orderService.checkout(params.orderId, user);
    return successResponse({ status:201 ,data: { session } });
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  //@Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //  return this.orderService.update(+id, updateOrderDto);
  //}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
