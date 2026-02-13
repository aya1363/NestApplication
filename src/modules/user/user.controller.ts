import {
  Controller, Get, ParseFilePipe, Patch,
  UploadedFile,
  UploadedFiles,
  UseInterceptors} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth, cloudFileUpload, fileValidation, RoleEnum, storageEnum, successResponse, User } from '../../common';
import type{ UserDocument } from '../../DB/Model';
import { PreferredLanguageInterceptor } from '../../common/interceptors';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { localFileUpload } from '../../common';
import type { IMulterFile, IResponse } from '../../common/interfaces';
import { ProfileResponse } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
@UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin ,RoleEnum.superAdmin,RoleEnum.user])
  @Get()
async profile(
    @User() user: UserDocument): Promise<IResponse<ProfileResponse>> {
  console.log({user });
  const profile =await this.userService.profile(user)

  return successResponse<ProfileResponse>({data:{profile}})
  }


  @UseInterceptors(FileInterceptor('profileImage',
    cloudFileUpload({storageApproach:storageEnum.memory,
      validation: fileValidation.image,
      fileSize: 2
    })
  ))
  @Auth([RoleEnum.user])
  @Patch('profile-image')
  async profileImage(@User() user: UserDocument,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File): Promise<IResponse<ProfileResponse>> {
  
  //  console.log({file});
    
const profile =await this.userService.profilePicture(file ,user)

    return successResponse<ProfileResponse>({data:{profile}})
  }

  @UseInterceptors(FilesInterceptor('coverImages', 2,
      
    localFileUpload({folder:'User',validation:fileValidation.image})
  ))
  @Auth([RoleEnum.user])
  @Patch('cover-images')
  coverImages(@UploadedFiles(new ParseFilePipe({fileIsRequired:true})) files:Array<IMulterFile>){
  
    console.log({files});
    return successResponse()
  }



}
