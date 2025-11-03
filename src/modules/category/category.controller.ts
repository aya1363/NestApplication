import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, UseInterceptors, UploadedFile, ParseFilePipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryParamsDto, GetAllCategoryQueryDto, UpdateCategoryDto } from './dto/update-category.dto';
import type{  UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { endPoint } from './category.authorization';
import { Auth, cloudFileUpload, fileValidation, IResponse, successResponse, User } from 'src/common';
import { CategoryResponse, GetAllCategoryResponse } from './entities/category.entity';

@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
@UseInterceptors(FileInterceptor('attachment',cloudFileUpload({validation:fileValidation.image })))
@Auth(endPoint.create)
@Post('/')
  async create(
    @User() user:UserDocument,
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File):Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(createCategoryDto ,file ,user);
        return successResponse <CategoryResponse>({data:{category}})
  }

  @Auth(endPoint.create)
  @Patch(':categoryId')
  async update(@User() user:UserDocument,
    @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  
  ):Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(params.categoryId, updateCategoryDto, user);
        return successResponse <CategoryResponse>({data:{category}})
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ))
  @Auth(endPoint.create)
  @Patch(':categoryId/asset')
  async updateAsset(

    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAsset(params.categoryId, user, file);
    return successResponse<CategoryResponse>({ data: { category  } });

  }
  @Auth(endPoint.create)
  @Delete(':categoryId/freeze')
  async freeze(@Param() params: CategoryParamsDto,
    @User() user: UserDocument):Promise<IResponse>{
    await this.categoryService.freeze(params.categoryId, user);
    return successResponse()
  }

    @Auth(endPoint.create)
  @Patch(':categoryId/restore')
  async restore(@Param() params: CategoryParamsDto,
    @User() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(params.categoryId, user);
    return successResponse<CategoryResponse>({ data: { category } });
  }
  @Auth(endPoint.create)
  @Delete(':categoryId/remove')
  async remove(@Param() params: CategoryParamsDto,
@User() user: UserDocument  ) {
    await this.categoryService.remove(params.categoryId, user);
    return successResponse()
  }



  @Get()
  async findAll(
    @Query() query: GetAllCategoryQueryDto)
    : Promise < IResponse < GetAllCategoryResponse >> {
    const result = await this.categoryService.findAll(query);
    return successResponse <GetAllCategoryResponse>({data:{result}})
  }
  @Auth(endPoint.create)
  @Get('/archive')
  async findAllArchives(
    @Query() query:GetAllCategoryQueryDto
):Promise<IResponse<GetAllCategoryResponse>> {
    const result = await this.categoryService.findAll(query , true );
    return successResponse <GetAllCategoryResponse>({data:{result}})
  }

  @Get('/:categoryId')
  async findOne(@Param() params: CategoryParamsDto
  )
    : Promise<IResponse<CategoryResponse>> {
    const category  = await this.categoryService.findOne(params.categoryId);
    return successResponse <CategoryResponse>({data:{category }})
  }
    @Auth(endPoint.create)
  @Get('/:categoryId/archive')
  async findOneArchive(@Param() params: CategoryParamsDto
  )
    : Promise<IResponse<CategoryResponse>> {
    const category  = await this.categoryService.findOne(params.categoryId , true);
    return successResponse <CategoryResponse>({data:{category }})
  }
}