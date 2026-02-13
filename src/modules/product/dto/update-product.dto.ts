import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { containField } from '../../../common';

@containField()
export class UpdateProductDto extends PartialType(CreateProductDto) { }

export class UpdateProductAttachmentDto  { 
    @IsArray()
    @IsOptional()
    removedImages?: string[]
}


export class ProductParamsDto{

    @IsMongoId()
    productId: Types.ObjectId
}
