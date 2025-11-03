import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { CategoryDocument as TDocument, Category } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository extends DataBaseRepository<Category> {
  constructor(
    @InjectModel(Category.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
