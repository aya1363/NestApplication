import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import {  IsMongoId, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { MongoIdsValidate } from '../../../common';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @Validate(MongoIdsValidate)
    removedBrands?: Types.ObjectId[];
}


export class CategoryParamsDto{

    @IsMongoId()
    categoryId: Types.ObjectId
}

