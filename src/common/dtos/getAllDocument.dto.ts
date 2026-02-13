import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator"

export class GetAllSearchQueryDto{
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