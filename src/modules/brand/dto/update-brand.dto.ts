import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { Types } from 'mongoose';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { containField } from '../../../common';
import { Type } from 'class-transformer';
@containField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) { 
    
}

export class BrandParamsDto{

    @IsMongoId()
    brandId: Types.ObjectId
}

export class GetAllBrandQueryDto{
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