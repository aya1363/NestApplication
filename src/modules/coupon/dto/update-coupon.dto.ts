
import { Type } from 'class-transformer';
import {  IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { Types } from 'mongoose';
import { CouponEnum, ICoupon } from '../../../common';

export class UpdateCouponDto implements Partial<ICoupon> {
    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    discount: number

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    duration: number 

    @MinLength(2)
    @MaxLength(3000)
    @IsNotEmpty()
    @IsString()
    name: string
    @IsEnum(CouponEnum)
    type: CouponEnum 
    

    

}
export class CouponParamsDto{

    @IsMongoId()
    couponId: Types.ObjectId
}
