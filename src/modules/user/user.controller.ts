import {
  Controller, Get, Headers, ParseFilePipe, Patch, Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth, cloudFileUpload, fileValidation, RoleEnum, storageEnum, successResponse, User } from 'src/common';
import type{ UserDocument } from 'src/DB/Model';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { delay, of ,Observable} from 'rxjs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { localFileUpload } from 'src/common';
import type { IMulterFile, IResponse } from 'src/common/interfaces';
import { ProfileResponse } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
@UseInterceptors(PreferredLanguageInterceptor)
@Auth([RoleEnum.admin ,RoleEnum.user])
  @Get()
profile(
    @Headers() header: any,
    @User() user: UserDocument): Observable<any> {
  console.log({user ,header});
  
  return of([{message:'done'}]).pipe(delay(200));
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
  @Post('list')
  list(): { message: string } {
  
    


    return {message:'done'}
  }


}
