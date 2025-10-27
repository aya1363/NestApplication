import { BadRequestException } from "@nestjs/common"
import type { NextFunction, Request, Response } from "express"

export const PreAuth = (req:Request ,res:Response,next:NextFunction) => {
    if (!(req.headers.authorization?.split(' ')?.length==2)) {
        throw new BadRequestException('missing authorization key')
    }

    next()
}