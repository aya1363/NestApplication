import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { BrandDocument as TDocument, Brand } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandRepository extends DataBaseRepository<Brand> {
  constructor(
    @InjectModel(Brand.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
