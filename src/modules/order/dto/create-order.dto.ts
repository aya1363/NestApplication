import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Types } from "mongoose";
import {  IOrder, PaymentEnumType } from "../../../common";

export class CreateOrderDto implements Partial<IOrder>{ 
    @IsString()
    @IsNotEmpty()
    address: string

    @IsMongoId()
    @IsOptional()
    coupon?: Types.ObjectId 

    @IsString()
    @IsOptional()
    note: string 

    @IsString()
    @IsNotEmpty()
        
@Matches(/^(?:\+?20|0020)?0?(10|11|12|15)[0-9]{8}$/)
    phone: string 

    @IsEnum(PaymentEnumType)
    payment: PaymentEnumType 
    

}

