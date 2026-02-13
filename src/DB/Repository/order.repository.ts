import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { OrderDocument as TDocument, Order } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository extends DataBaseRepository<Order> {
    constructor(
    @InjectModel(Order.name)
    protected override readonly model: Model<TDocument>,
    ) {
    super(model);
    }
}
