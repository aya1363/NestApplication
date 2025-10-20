import { hash, compare } from 'bcrypt'

export const generateHash = async({ plainText = '', saltRound = parseInt(process.env.SALT_ROUND as string) }:
    { plainText: string, saltRound?: number }):Promise<string> => {
    return await hash(plainText ,saltRound)
}

export const compareHash =async ({ plainText = '', hashValue = '' }:
    { plainText: string, hashValue: string }):Promise<boolean> => {
    return await compare( plainText ,hashValue)
}