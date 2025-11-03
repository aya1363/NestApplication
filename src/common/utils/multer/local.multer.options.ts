import { diskStorage } from "multer"
import { randomUUID } from "node:crypto"
import type { Request } from "express"
import {IMulterFile} from '../../interfaces'
import path from "node:path"
import { existsSync, mkdirSync } from "node:fs"
import { BadRequestException } from "@nestjs/common"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"




export const localFileUpload = (
    { folder = 'public',
        validation = [],fileSize = 2 }:
        {
            folder: string;
            validation: string[],
            fileSize?:number
        }):MulterOptions => {
        const basePath= path.resolve(`uploads/${folder}`)

    return {
        storage: diskStorage({
            destination(req: Request,file: Express.Multer.File, callback:any) {
                const fullPath = path.resolve(basePath)
                if (!existsSync(fullPath)) {
                mkdirSync(fullPath ,{recursive:true})
                }
                callback(null , fullPath)
    }, filename(req: Request,file: IMulterFile, callback: any) {
                const fileName = randomUUID() + '_' + Date.now() + '_' + file.originalname
                file.finalPath = basePath+`/${fileName}`
                callback(null ,fileName)
    }
        }),
        fileFilter(req:Request,file:Express.Multer.File,callback:any) {
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