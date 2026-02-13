import { Type } from "class-transformer";
import {  IsMongoId, IsNumber, IsPositive, Min } from "class-validator";
import { Types } from "mongoose";
import { ICartProduct, IProduct } from "../../../common";

export class CreateCartDto implements Partial<ICartProduct> {
    @IsMongoId()
        
    product: Types.ObjectId | IProduct 


    @Type(()=>Number)
    @Min(1)
    @IsPositive()
    @IsNumber()
    quantity: number 
}
