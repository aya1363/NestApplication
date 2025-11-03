import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import {  GetAllBrandQueryDto, UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/DB/Repository';
import { FolderEnum, S3Service } from 'src/common';
import type { BrandDocument } from 'src/DB/Model';
import type {UserDocument} from 'src/DB/Model'
import { Types } from 'mongoose';
import { Lean } from 'src/DB/Repository/database.repository';

@Injectable()
export class BrandService {

  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly s3Service:S3Service
  ){}
  async create(createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user:UserDocument
  ):Promise<BrandDocument> {
    const { name, slogan } = createBrandDto
    const checkNameDuplicate = await this.brandRepository.findOne({ filter: { name , paranoid: false,} })
    if (checkNameDuplicate) {
      throw new ConflictException(checkNameDuplicate?.freezedAt ? 'Duplicated with archived brand'
        : 'Duplicated brand name')
    }

const image = await this.s3Service.uploadFile({ file, path: 'Brand' });


const [brand] = await this.brandRepository.create({
  data: [{ name, image, slogan, createdBy: user._id }],
});
    if (!brand) {
      await this.s3Service.deleteFile({Key:image})
      throw new BadRequestException('fail to create brand instance')  
    }
    return brand
  }


  async update(brandId: Types.ObjectId, updateBrandDto: UpdateBrandDto,
    user:UserDocument
  ) :Promise<BrandDocument | Lean<BrandDocument>>{
    if (updateBrandDto.name && await this.brandRepository.findOne({filter:{name:updateBrandDto.name}
        
      })) {
        throw new ConflictException('Duplicated brand name')
    }
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id:brandId},
      update: {
        ...updateBrandDto,
        updatedBy:user._id
      }
    })
    if (!brand) {
      throw new NotFoundException('fail to find matching  brand instance ')
    }
    
    return brand
  }


    async updateAsset(brandId: Types.ObjectId, 
      user: UserDocument,
      file: Express.Multer.File
  ) :Promise<BrandDocument | Lean<BrandDocument>>{
      const image = await this.s3Service.uploadFile({file,path:FolderEnum.Brand})
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id:brandId},
      update: {
        image,
        updatedBy:user._id
      },
      options: {
        new: false,
        
      }
    })
      if (!brand) {
      await this.s3Service.deleteFile({Key:image})
      throw new NotFoundException('fail to find matching  brand instance ')
    }
    await this.s3Service.deleteFile({Key:brand.image})
      brand.image = image;
      
    return brand
  }

async freeze(
  brandId: Types.ObjectId,
  user: UserDocument,
): Promise<string> {
  const brand = await this.brandRepository.findOneAndUpdate({
    filter: { _id: brandId }, 
    update: {
      freezedAt: new Date(),
      $unset: { restoredAt: '' },
      updatedBy: user._id,
    },
    options: { new: true },
  });

  if (!brand) {
    throw new NotFoundException('Fail to find matching brand instance');
  }

  return 'done';
  }
  
  async restore(
  brandId: Types.ObjectId,
  user: UserDocument,
):Promise<BrandDocument | Lean<BrandDocument>> {
  const brand = await this.brandRepository.findOneAndUpdate({
    filter: {
      _id: brandId,
      freezedAt: { $exists: true },
        paranoid: false, // ✅ skip paranoid hook
    }, 
    update: {
      restoredAt: new Date(),
      $unset: { freezedAt: '' },
      updatedBy: user._id,
    },
    options: { new: true },
  });

  if (!brand) {
    throw new NotFoundException('Fail to restore matching brand instance');
  }

  return brand;
}


  async remove(brandId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    console.log(user.userName);
    
      const brand = await this.brandRepository.findOneAndDelete({
        filter: {
        _id: brandId,
          freezedAt: { $exists: true },
          paranoid: false 
      }

      })
      if (!brand) {

      throw new NotFoundException('fail to find matching  brand instance ')
    }
    await this.s3Service.deleteFile({Key:brand.image})
    return 'Done';
  }


  
  async findAll(data: GetAllBrandQueryDto
    , archive: boolean = false): Promise<{
  currentPage: number | 'all';
  pages?: number;
  limit?: number;
  docsCount?: number;
  result: BrandDocument[] | Lean<BrandDocument>[];
}> {

    const { page, size , search }:GetAllBrandQueryDto = data;

    const result = await this.brandRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            {slogan:{$regex:search ,$options:'i'}},
          ]
        } : {}),
      ...(archive?{paranoid:false, freezedAt:{$exists:true}}:{} )},
      page,
      size
    })
    return result;
  }

    async findOne(brandId: Types.ObjectId, archive: boolean = false
    ):Promise<BrandDocument | Lean<BrandDocument>> {

      
    const brand = await this.brandRepository.findOne({
      filter: {_id:brandId,
        ...(archive?{paranoid:false, freezedAt:{$exists:true}}:{} )},
    
    })
      if (!brand) {
        throw new NotFoundException('fail to find matching brand instance ')
      }
    return brand;
  }

 
}
