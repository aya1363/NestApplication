import { CreateOptions, HydratedDocument, Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDocument as TDocument, User} from '../Model/User.model'
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository extends DataBaseRepository<TDocument>{
    constructor(@InjectModel(User.name)  protected override readonly model: Model<TDocument>) {
        super(model)
    }

    

     async createUser({
        data,
        options }:{
        data: Partial<TDocument>[],
        options?:CreateOptions
    }):Promise<HydratedDocument<TDocument>> {
        const [user] = await this.create({data, options}) || [];
        if (!user) {
            throw new BadRequestException("fail to create this user");
            
        }
        return user

    }
}