import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsPositive, IsString, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { MongoIdsValidate } from 'src/common';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @Validate(MongoIdsValidate)
    removedBrands?: Types.ObjectId[];
}


export class CategoryParamsDto{

    @IsMongoId()
    categoryId: Types.ObjectId
}

export class GetAllCategoryQueryDto{
    @Type(()=>Number)
    @IsInt()
    @IsPositive()
    @IsOptional()
    size: number
    
    @Type(()=>Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    page: number

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    search:string
}