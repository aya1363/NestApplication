import {
  CreateOptions,
  DeleteResult,
  FlattenMaps,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PipelineStage,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  Types,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

export type Lean<T> = HydratedDocument<FlattenMaps<T>>;
export abstract class DataBaseRepository<TR, TDocument = HydratedDocument<TR>> {
  protected constructor(protected model: Model<TDocument>) {}

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
    
  }: {
    filter: RootFilterQuery<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | Lean<TDocument> | null> {
    
      if (Array.isArray(update)) {
      update.push({
        $set: {
          __v: { $add: [`$__v`, 1] },
        },
      });
      return await this.model.findOneAndUpdate(filter || {}, update, options);
    }
    let doc = this.model.findOneAndUpdate(
      filter || {},
      { ...update, $inc: { __v: 1 } },
      
      options ,
    );

    if (options?.populate) {
      doc = doc.populate(options.populate as PopulateOptions[]);
    }

    if (options?.lean) {
      doc.lean(options.lean);
    }

    return await doc.exec();
  }

  async deleteOne(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async deleteMany(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }

async findOneAndDelete({
  filter,
}: {
  filter: RootFilterQuery<TDocument>;
}): Promise<HydratedDocument<TDocument> | null> {
  return this.model.findOneAndDelete(filter);
}

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions<TDocument> | null;
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
    
    
    const doc = this.model.findOne(filter).select(select || '');
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc.lean(options?.lean);
    }
    return await doc.exec();
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<TDocument>;
    update?: UpdateQuery<TDocument> | PipelineStage[] | null;
    options?: MongooseUpdateQueryOptions<TDocument> | null;
  }): Promise<UpdateWriteOpResult> {
    if (Array.isArray(update)) {
      update.push({
        $set: {
          __v: { $add: [`$__v`, 1] },
        },
      });
      return await this.model.updateOne(filter || {}, update, options);
    }
    return await this.model.updateOne(
      filter,
      {
       
        $inc: { __v: 1 },
        ...update,
      },
      options,
    );
  }

  async find({
    filter,
    select,
    options = {},
  }: {
    filter: RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument> | undefined;
    options?: QueryOptions<TDocument> | undefined;
  }): Promise<Array<Lean<TDocument>> | Array<HydratedDocument<TDocument>>> {
    let query = this.model.find(filter).select(select || '');

    if (options.skip !== undefined) {
      query = query.skip(options.skip);
    }

    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    if (options.sort) {
      query = query.sort(options.sort);
    }

    if (options.populate) {
      if (typeof options.populate === 'string') {
        query = query.populate(options.populate);
      } else if (Array.isArray(options.populate)) {
        query = query.populate(options.populate);
      } else {
        query = query.populate(options.populate);
      }
    }

    return await query.exec();
  }

  async findById({
    id,
    select,
    options = {},
  }: {
    id: Types.ObjectId;
    select?: ProjectionType<TDocument> | undefined;
    options?: QueryOptions<TDocument> | undefined;
  }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
    let query = this.model.findById(id).select(select || '');

    if (options.skip !== undefined) {
      query = query.skip(options.skip);
    }

    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    if (options.sort) {
      query = query.sort(options.sort);
    }

    if (options.populate) {
      if (typeof options.populate === 'string') {
        query = query.populate(options.populate);
      } else if (Array.isArray(options.populate)) {
        query = query.populate(options.populate);
      } else {
        query = query.populate(options.populate);
      }
    }

    return await query.exec();
  }

  async findByIdAndUpdate({
    id,
    update,
    options = { new: true },
  }: {
    id: Types.ObjectId;
    update?: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
  }): Promise<HydratedDocument<TDocument> | Lean<TDocument> | null> {
    return await this.model.findByIdAndUpdate(
      id,
      {
        ...update,
        $inc: { __v: 1 },
      },
      options,
    );
  }
  
async create({
  data,
  options,
}: {
  data: Partial<TDocument> | Partial<TDocument>[];
  options?: CreateOptions;
}): Promise<HydratedDocument<TDocument>[]> {
  const docs = Array.isArray(data) ? data : [data];
  const result = await this.model.create(docs, options);
  return result as HydratedDocument<TDocument>[];
}



async paginate({
  filter = {},
  options = {},
  select,
  page = 'all',
  size = 5,
}: {
  filter: RootFilterQuery<TDocument>;
  select?: ProjectionType<TDocument> | undefined;
  options?: QueryOptions<TDocument> | undefined;
  page?: number | 'all';
  size?: number;
}): Promise<{
  currentPage: number | 'all';
  pages?: number;
  limit?: number;
  docsCount?: number;
  result: HydratedDocument<TDocument>[] | Lean<TDocument>[];
}> {
  let docsCount: number | undefined = undefined;
  let pages: number | undefined = undefined;

  if (page !== 'all') {
    page = Math.floor(page < 1 ? 1 : page);
    options.limit = Math.floor(size < 1 || !size ? 5 : size);
    options.skip = (page - 1) * options.limit;

    docsCount = await this.model.countDocuments(filter);
    pages = Math.ceil(docsCount / options.limit);
  }

  const result = await this.find({ filter, select, options });

  return {
    docsCount,
    limit: options.limit,
    currentPage: page,
    pages,
    result,
  };
}

}
