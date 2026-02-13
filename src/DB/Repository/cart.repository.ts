import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { CartDocument as TDocument, Cart } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartRepository extends DataBaseRepository<Cart> {
  constructor(
    @InjectModel(Cart.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
