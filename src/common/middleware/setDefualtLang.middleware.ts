import { NextFunction, Request, Response } from "express";


export const setDefaultLanguage = (
    req: Request
    , res: Response,
    next: NextFunction) => {
   // console.log('language middleWare');
    req.headers['accept-language']=req.headers['accept-language'] ?? 'EN'
    next()
}