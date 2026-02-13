import { IsOptional, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { Types } from "mongoose";
import { ICategory, MongoIdsValidate } from "../../../common";

export class CreateCategoryDto implements Partial<ICategory> {
        @MinLength(2)
        @MaxLength(50)
        @IsString()
        name: string;
    
        @MinLength(2)
        @MaxLength(5000)
        @IsString()
        @IsOptional()
    description: string;
    
    
    @Validate(MongoIdsValidate)
    brands: Types.ObjectId[];
}
