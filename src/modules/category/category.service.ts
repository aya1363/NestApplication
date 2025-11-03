import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import {  GetAllCategoryQueryDto, UpdateCategoryDto } from './dto/update-category.dto';
import { BrandRepository, CategoryRepository } from 'src/DB/Repository';
import { FolderEnum, S3Service } from 'src/common';
import type { CategoryDocument } from 'src/DB/Model';
import type {UserDocument} from 'src/DB/Model'
import { Types } from 'mongoose';
import { Lean } from 'src/DB/Repository/database.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository:BrandRepository,
    private readonly s3Service:S3Service
  ){}
  async create(createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    user:UserDocument
  ):Promise<CategoryDocument> {
    const { name } = createCategoryDto
    const checkNameDuplicate = await this.categoryRepository.findOne({ filter: { name , paranoid: false,} })
    if (checkNameDuplicate) {
      throw new ConflictException(checkNameDuplicate?.freezedAt ? 'Duplicated with archived category'
        : 'Duplicated category name')
    }

    const brands:Types.ObjectId[] = [...new Set(createCategoryDto.brands)] 
    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length)
    {
      throw new NotFoundException('some of mentioned brands are not found')
    }
  const assetFolderId:string =randomUUID()
  const image = await this.s3Service.uploadFile({ file, path: `${FolderEnum.category}/${assetFolderId}` });


const [category] = await this.categoryRepository.create({
  data: [{
    ...createCategoryDto,assetFolderId,image,
    createdBy: user._id, brands: brands.map((brand) => {
      return Types.ObjectId.createFromHexString(brand as unknown as string)
    })
  }],
});
    if (!category) {
      await this.s3Service.deleteFile({Key:image})
      throw new BadRequestException('fail to create category instance')  
    }
    return category
  }


  async update(categoryId: Types.ObjectId, updateCategoryDto: UpdateCategoryDto,
    user:UserDocument
  ) :Promise<CategoryDocument | Lean<CategoryDocument>>{
    if (
    updateCategoryDto.name &&
    await this.categoryRepository.findOne({
      filter: { name: updateCategoryDto.name, _id: { $ne: categoryId } }, 
    })
  ) {
    throw new ConflictException('Duplicated category name');
  }
      const brands:Types.ObjectId[] = [...new Set(updateCategoryDto.brands)] 
    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length)
    {
      throw new NotFoundException('some of mentioned brands are not found')
    }
    const removedBrands = updateCategoryDto.removedBrands ?? []
    delete updateCategoryDto.removedBrands;
    const category = await this.categoryRepository.findOneAndUpdate({
          filter: { _id: categoryId },
          update: [
            {
              $set: {
                ...updateCategoryDto,
                updatedBy: user._id,
                brands: {
                  $setUnion: [
                    {
                      $setDifference: [
                        "$brands",
                        (removedBrands || []).map((brand) => {
                          return Types.ObjectId.createFromHexString(brand as unknown as string);
                        }),
                      ],
                    },
                    (brands || []).map((brand) => {
                      return Types.ObjectId.createFromHexString(brand as unknown as string);
                    }),
                  ],
                },
              },
            },
          ],
        })
      if(!category) {
        throw new NotFoundException('fail to find matching  category instance ')
      }
    
    return category
    }


    async updateAsset(categoryId: Types.ObjectId,
      user: UserDocument,
      file: Express.Multer.File
    ) : Promise < CategoryDocument | Lean < CategoryDocument >> {
    const category = await this.categoryRepository.findOne({
        filter: { _id: categoryId }
    
      })
      if(!category) {
        throw new NotFoundException('fail to find matching  category instance ')
      }
      const image = await this.s3Service.uploadFile({ file, path: `${FolderEnum.category }/${category.assetFolderId}`})
    const updatedCategory = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: {
        image,
        updatedBy:user._id
      }
    })
      if (!updatedCategory) {
        await this.s3Service.deleteFile({ Key:image })
        throw new NotFoundException('')
      }
    await this.s3Service.deleteFile({ Key: category.image })
      category.image = image;
      
      return updatedCategory
    }

async freeze(
      categoryId: Types.ObjectId,
      user: UserDocument,
    ): Promise < string > {
      const category = await this.categoryRepository.findOneAndUpdate({
        filter: { _id: categoryId },
        update: {
          freezedAt: new Date(),
          $unset: { restoredAt: '' },
          updatedBy: user._id,
        },
        options: { new: true },
      });

      if(!category) {
        throw new NotFoundException('Fail to find matching category instance');
      }

  return 'done';
    }
  
  async restore(
      categoryId: Types.ObjectId,
      user: UserDocument,
    ): Promise < CategoryDocument | Lean < CategoryDocument >> {
      const category = await this.categoryRepository.findOneAndUpdate({
        filter: {
          _id: categoryId,
          freezedAt: { $exists: true },
          paranoid: false, // ✅ skip paranoid hook
        },
        update: {
          restoredAt: new Date(),
          $unset: { freezedAt: '' },
          updatedBy: user._id,
        },
        options: { new: true },
      })


  if (!category) {
    throw new NotFoundException('Fail to restore matching category instance');
  }

  return category;
}


  async remove(categoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    console.log(user.userName);
    
      const category = await this.categoryRepository.findOneAndDelete({
        filter: {
        _id: categoryId,
          freezedAt: { $exists: true },
          paranoid: false 
      }

      })
      if (!category) {

      throw new NotFoundException('fail to find matching  category instance ')
    }
    await this.s3Service.deleteFile({Key:category.image})
    return 'Done';
  }


  
  async findAll(data: GetAllCategoryQueryDto
    , archive: boolean = false): Promise<{
  currentPage: number | 'all';
  pages?: number;
  limit?: number;
  docsCount?: number;
  result: CategoryDocument[] | Lean<CategoryDocument>[];
}> {

    const { page, size , search }:GetAllCategoryQueryDto = data;

    const result = await this.categoryRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            {description:{$regex:search ,$options:'i'}},
          ]
        } : {}),
      ...(archive?{paranoid:false, freezedAt:{$exists:true}}:{} )},
      page,
      size
    })
    return result;
  }

    async findOne(categoryId: Types.ObjectId, archive: boolean = false
    ):Promise<CategoryDocument | Lean<CategoryDocument>> {

      
    const category = await this.categoryRepository.findOne({
      filter: {_id:categoryId,
        ...(archive?{paranoid:false, freezedAt:{$exists:true}}:{} )},
    
    })
      if (!category) {
        throw new NotFoundException('fail to find matching category instance ')
      }
    return category;
  }


}
