import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { Validate } from 'class-validator';
import { MongoIdsValidate } from '../../../common';

export class RemoveItemsFromCartDto {
    @Validate(MongoIdsValidate)
    productIds:Types.ObjectId[]
}
export class UpdateCartDto extends PartialType(CreateCartDto) {}
