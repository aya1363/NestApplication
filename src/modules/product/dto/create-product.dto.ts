import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator";
import { Types } from "mongoose";
import { IProduct} from "../../../common";

export class CreateProductDto implements Partial<IProduct>{
    @IsMongoId()
    brand: Types.ObjectId 
    @IsMongoId()
    category:  Types.ObjectId 

    @IsString()
    @IsOptional()
    @Length(2,2000)
    description: string 

    @IsString()
    @IsNotEmpty()
    @Length(2,50)
    name: string 

    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    stock: number 

    @Type(()=>Number)
    @IsOptional()
    @IsPositive()
    @IsNumber()
    
    discount: number

    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    originalPrice: number 
    


}
