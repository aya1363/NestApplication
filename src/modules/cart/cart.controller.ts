import { Controller, Get, Post, Body, Delete, UsePipes, ValidationPipe, Res, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
//import { UpdateCartDto } from './dto/update-cart.dto';
import {
  Auth, IResponse, RoleEnum, successResponse,
  User
} from '../../common';
import type{ UserDocument } from '../../DB';
import { CartResponse } from './entities/cart.entity';
import type{ Response } from 'express';
import { RemoveItemsFromCartDto } from './dto/update-cart.dto';

@Auth([RoleEnum.user])
@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async create(
    @Body() createCartDto: CreateCartDto,
    @User() user: UserDocument,
    @Res({passthrough:true}) res:Response
  ):Promise<IResponse<CartResponse>>{
    const { status, cart } = await this.cartService.create(createCartDto, user);
    res.status(status)
    return successResponse<CartResponse>({status ,data:{cart}})
  }


  @Get('find')
  async findOne(
    @User() user: UserDocument):Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.findOne(user);
    return successResponse <CartResponse>({data:{cart}})

  }

  

  @Patch('remove-items')
    async removeItems(
    @Body() removeItemsFromCartDto: RemoveItemsFromCartDto,
    @User() user: UserDocument,
  ):Promise<IResponse<CartResponse>>{
    const cart = await this.cartService.removeItems(removeItemsFromCartDto, user);
        return successResponse <CartResponse>({data:{cart}})
  }
    @Delete('remove-cart')
    async removeCart(
    @User() user: UserDocument,
  ):Promise<IResponse<CartResponse>>{
      await this.cartService.removeCart( user);
        return successResponse ()
  }


}
