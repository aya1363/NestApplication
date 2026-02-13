import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) { }

export class OrderParamsDto{
    @IsMongoId()
    orderId:Types.ObjectId
}
