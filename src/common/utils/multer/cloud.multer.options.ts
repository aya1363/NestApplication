import {  diskStorage, memoryStorage ,FileFilterCallback } from "multer"
import type { Request } from "express"
import { BadRequestException } from "@nestjs/common"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"
import { storageEnum } from "src/common"
import { randomUUID } from "crypto"
import { tmpdir } from "os"

export const cloudFileUpload = (
    { storageApproach=storageEnum.memory,
        validation = [],
        fileSize = 2 }:
        {
            storageApproach?: storageEnum;
            validation: string[],
            fileSize?:number
        }):MulterOptions => {

    return {
        storage: storageApproach === storageEnum.memory
            ? memoryStorage()
            :diskStorage({
                destination:tmpdir(),
                filename:function (req:Request , file:Express.Multer.File , callback) {
                callback(null , ` ${randomUUID()}_${file.originalname}`)
            }
    }),
        fileFilter(req:Request,file:Express.Multer.File,callback:FileFilterCallback) {
            if (validation.includes(file.mimetype)) {
                return callback(null , true)
            }
            return callback(new BadRequestException('invalid file format'))
        },
        limits: {
            fileSize: fileSize * 1024 * 1024
            
        }
    }
}