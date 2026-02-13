import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
import { CouponEnum, ICoupon } from "../../../common";

export class CreateCouponDto implements Partial<ICoupon>{

    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    discount: number

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    duration: number 

    @IsDateString()
    endDate: Date 

    @IsDateString()
    startDate: Date 

    @MinLength(2)
    @MaxLength(3000)
    @IsNotEmpty()
    @IsString()
    name: string 
    
    @IsEnum(CouponEnum)
    type: CouponEnum 

}
