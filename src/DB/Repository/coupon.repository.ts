import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { CouponDocument as TDocument, Coupon } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponRepository extends DataBaseRepository<Coupon> {
    constructor(
    @InjectModel(Coupon.name)
    protected override readonly model: Model<TDocument>,
    ) {
    super(model);
    }
}
