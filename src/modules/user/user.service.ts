import { Injectable  } from '@nestjs/common';
import { IUser, S3Service } from 'src/common';
import { UserRepository } from 'src/DB';
import type{ UserDocument } from 'src/DB/Model';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository:UserRepository,
    private readonly s3Service:S3Service
  ) {}
  async profilePicture(file: Express.Multer.File, user: UserDocument): Promise<IUser> {
    user.profilePicture = await this.s3Service.uploadFile({
      file ,path:`user/${user._id.toString()}`
    })

    await user.save()
    return user
  }

  async profile( user: UserDocument): Promise<IUser> {
      const profile = await this.userRepository.findOne({
        filter: { _id: user._id },
        options:{populate:[{path:'wishlist'}]}
      }) as UserDocument
    
    return profile
  }


}
