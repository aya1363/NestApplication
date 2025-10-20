import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
import { RoleEnum, signatureLevelEnum, tokenEnum } from "../enums";
import {
    TokenDocument, TokenRepository,
    UserDocument, UserRepository
} from "src/DB";
import { randomUUID } from "crypto";

@Injectable()
export class tokenService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository,
        private readonly tokenRepository: TokenRepository,

    ) { }


    generateToken = async ({
  payload,
  options = { secret:process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
 expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN )},
}:{
  payload:object,
  options:JwtSignOptions },
 ): Promise<string> => {
  return this.jwtService.signAsync(payload, options);
};

  verifyToken = async ({
  token,
  options = { secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string },
}: {
  token: string;
  options?: JwtVerifyOptions;
}): Promise<JwtPayload> => {
  return (await this.jwtService.verifyAsync(token, options)) as unknown as JwtPayload;
};
 detectSignature = async (role: RoleEnum = RoleEnum.user):Promise<signatureLevelEnum> => {
  
  let signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer
  switch (role) {
    case RoleEnum.admin:
    case RoleEnum.superAdmin:

      signatureLevel=signatureLevelEnum.System
      break;
    default:
      signatureLevel=signatureLevelEnum.Bearer
      break;
  }
  return Promise.resolve(signatureLevel);
}
getSignature = async (
  signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer,
): Promise<{ access_signature: string; refresh_signature: string }> => {
  const signatures = { access_signature: '', refresh_signature: '' };

  switch (signatureLevel) {
    case signatureLevelEnum.System:
      signatures.access_signature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
      signatures.refresh_signature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
      break;

    default:
      signatures.access_signature = process.env.ACCESS_USER_TOKEN_SIGNATURE as string;
      signatures.refresh_signature = process.env.REFRESH_USER_TOKEN_SIGNATURE as string;
      break;
  }

  return Promise.resolve(signatures);
};

 getLoginCredentials =async (user:UserDocument) => {
    
  const signatureLevel = await this.detectSignature(user.role)

  const signature = await this.getSignature(signatureLevel)
  console.log(signature);
 const jwtid = randomUUID()
  const access_Token = await this.generateToken({
    payload: { _id: user._id },
   
      options: {
           secret:signature.access_signature,
          expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN), jwtid
      }
        });
    
        const refresh_Token = await this.generateToken({
          payload: { _id: user._id },
         
            options: {
                secret: signature.refresh_signature,
                expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN), jwtid
            }
        });
  return {access_Token , refresh_Token}
}

 decodeToken = async (
  { authorization,
    tokenType = tokenEnum.access
  }:
  { authorization: string , tokenType ?:tokenEnum}) => {
  
  const [ bearerKey, token ]= authorization.split(' ')
  if (! bearerKey || !token) {
    throw new UnauthorizedException('missing token parts')
  }
  

  const signatures = await this.getSignature(bearerKey as signatureLevelEnum)
  const decoded = await this.verifyToken({
      token,
      options:
   { secret: tokenType === tokenEnum.refresh ?
      signatures.refresh_signature :
      signatures.access_signature}
  })
  if (!decoded?.sub || !decoded.iat) {
    throw new BadRequestException('invalid token payload ')
  }
  if (await this.tokenRepository.findOne({filter:{jti:decoded.jti}})) {
      throw new UnauthorizedException('invalid or old login credential ')
  }
  const user = await this.userRepository.findOne({ filter: { _id: decoded.sub } }) as UserDocument
  if (!user) {
    throw new BadRequestException('you are not registered account ')
  }
  if (user.changeCredentialTime?.getTime() ||0 > decoded.iat * 1000) {
    
    throw new UnauthorizedException('invalid or old login credential ')
   
  }
  //  console.log("Decoded token:", decoded);
  return { user, decoded }
 
}

 revokeToken = async ({ decoded } ):Promise<TokenDocument> => {

  const [result] = await this.tokenRepository.create({
    data: [
      {
        jti: decoded.jti,
        expiredAt: decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        createdBy: decoded.sub,
      },
    ],
  }) || []
  if (!result ) {
    throw new BadRequestException('fail to revoke this token ')
  }
  return result; 
};
}