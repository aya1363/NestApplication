import { IsString, MaxLength, MinLength } from "class-validator";
import { IBrand } from "../../../common";

export class CreateBrandDto  implements Partial<IBrand>{
    @MinLength(2)
    @MaxLength(50)
    @IsString()
    name: string;


    @MinLength(2)
    @MaxLength(50)
    @IsString()
    slogan: string;

    
}
