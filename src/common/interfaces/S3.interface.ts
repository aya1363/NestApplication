import { S3Client } from "@aws-sdk/client-s3";

export interface PreSignParams {
  s3Client: S3Client;
  Bucket?: string;
  path?: string;
  ContentType: string;
  originalname: string;
  expiresIn?: number;
}