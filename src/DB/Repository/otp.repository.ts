import {  Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { OtpDocument as TDocument,Otp} from '../Model'
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpRepository extends DataBaseRepository<TDocument>{
    constructor(
        @InjectModel(Otp.name)
        protected override readonly model: Model<TDocument>,) {
        super(model)
    }

    


}