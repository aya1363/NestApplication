import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { ProductDocument as TDocument, Product } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductRepository extends DataBaseRepository<Product> {
    constructor(
    @InjectModel(Product.name)
    protected override readonly model: Model<TDocument>,
    ) {
    super(model);
    }
}
