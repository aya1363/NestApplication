import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponDocument, CouponRepository,type UserDocument } from '../../DB';
import { FolderEnum, GetAllSearchQueryDto, S3Service } from '../../common';
import { Types } from 'mongoose';
import { Lean } from '../../DB/Repository/database.repository';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly s3Service:S3Service
  ){}
  async create(createCouponDto: CreateCouponDto,
    user: UserDocument,
    file:Express.Multer.File
  ): Promise<CouponDocument> {
    const checkNameDuplicate = await this.couponRepository.findOne({
      filter:{name:createCouponDto.name , paranoId:false}
    })
    if (checkNameDuplicate) {
      throw new ConflictException('duplicated coupon name')
    }
    const image = await this.s3Service.uploadFile({file,
      path:FolderEnum.Coupon
    })
    
const startDate = new Date(createCouponDto.startDate);
const endDate = new Date(createCouponDto.endDate);

if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  throw new BadRequestException('Invalid date format.');
}

if (endDate.getTime() <= startDate.getTime()) {
  throw new BadRequestException('End date must be greater than start date.');
}
    const [coupon] = await this.couponRepository.create({
      data: [{
        ...createCouponDto, image,
        startDate,
        endDate
        , createdBy: user._id
      }]
    })
    if (!coupon) {
      throw new BadRequestException('fail to create coupon instance ')
    }
    return coupon;
  }

  async update(couponId: Types.ObjectId,
    updateCouponDto: UpdateCouponDto,
    user:UserDocument
  ): Promise<CouponDocument | Lean<CouponDocument>>{
    
    

  if (updateCouponDto.name && await this.couponRepository.findOne({
    filter: { name: updateCouponDto.name }
})) {
  throw new ConflictException('Duplicated Coupon name');
    }


    const Coupon = await this.couponRepository.findOneAndUpdate({
      filter: { _id:couponId},
      update: {
        ...updateCouponDto,
        updatedBy: user._id
        
      }
    })
    if (!Coupon) {
      throw new NotFoundException('fail to find matching  Coupon instance ')
    }
    
    return Coupon
  }


    async updateAsset(couponId: Types.ObjectId, 
      user: UserDocument,
      file: Express.Multer.File
  ) :Promise<CouponDocument | Lean<CouponDocument>>{
      const image = await this.s3Service.uploadFile({file,path:FolderEnum.Coupon})
    const Coupon = await this.couponRepository.findOneAndUpdate({
      filter: { _id:couponId},
      update: {
        image,
        updatedBy:user._id
      },
      options: {
        new: false,
        
      }
    })
      if (!Coupon) {
      await this.s3Service.deleteFile({Key:image})
      throw new NotFoundException('fail to find matching  Coupon instance ')
    }
    await this.s3Service.deleteFile({Key:Coupon.image})
      Coupon.image = image;
      
    return Coupon
  }

async freeze(
  couponId: Types.ObjectId,
  user: UserDocument,
): Promise<string> {
  const Coupon = await this.couponRepository.findOneAndUpdate({
    filter: { _id: couponId }, 
    update: {
      freezedAt: new Date(),
      $unset: { restoredAt: '' },
      updatedBy: user._id,
    },
    options: { new: true },
  });

  if (!Coupon) {
    throw new NotFoundException('Fail to find matching Coupon instance');
  }

  return 'Done';
  }
  
  async restore(
  couponId: Types.ObjectId,
  user: UserDocument,
):Promise<CouponDocument | Lean<CouponDocument>> {
  const coupon = await this.couponRepository.findOneAndUpdate({
    filter: {
      _id: couponId,
      freezedAt: { $exists: true },
        paranoid: false, 
    }, 
    update: {
      restoredAt: new Date(),
      $unset: { freezedAt: '' },
      updatedBy: user._id,
    },
    options: { new: true },
  });

  if (!coupon) {
    throw new NotFoundException('Fail to restore matching brand instance');
  }

  return coupon;
}


  async remove(couponId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    console.log(user.userName);
    
      const coupon = await this.couponRepository.findOneAndDelete({
        filter: {
        _id: couponId,
          freezedAt: { $exists: true },
          paranoid: false 
      }

      })
      if (!coupon) {

      throw new NotFoundException('fail to find matching  coupon instance ')
    }
    await this.s3Service.deleteFile({Key:coupon.image})
    return 'Done';
  }


  
  async findAll(data: GetAllSearchQueryDto
    , archive: boolean = false): Promise<{
  currentPage: number | 'all';
  pages?: number;
  limit?: number;
  docsCount?: number;
  result: CouponDocument[] | Lean<CouponDocument>[];
}> {

    const { page, size , search }:GetAllSearchQueryDto = data;

    const result = await this.couponRepository.paginate({
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

    async findOne(couponId: Types.ObjectId, archive: boolean = false
    ):Promise<CouponDocument | Lean<CouponDocument>> {

      
    const coupon = await this.couponRepository.findOne({
      filter: {_id:couponId,
        ...(archive?{paranoid:false, freezedAt:{$exists:true}}:{} )},
    
    })
      if (!coupon) {
        throw new NotFoundException('fail to find matching coupon instance ')
      }
    return coupon;
  }
}
