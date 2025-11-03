import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { storageEnum } from "../enums";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { PreSignParams } from "../interfaces/S3.interface";
  import { GetBucketLocationCommand } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    constructor() { 
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID as string,
                secretAccessKey:process.env.SECRET_ACCESS_KEY as string
            }

        })
  }
  


async testBucketRegion() {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const command = new GetBucketLocationCommand({ Bucket: bucketName });
    const response = await this.s3Client.send(command);

    console.log(`✅ Bucket: ${bucketName}`);
    console.log(`🌍 Region: ${response.LocationConstraint || "us-east-1 (default)"}`);
  } catch (error) {
    console.error("❌ Failed to get bucket region:", error);
  }
}

    uploadFile = async ({
    storageApproach = storageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = "general",
    ACL = "private",
    file,
    }: {
    storageApproach?: storageEnum;
    Bucket?: string;
    path?: string;
    ACL?: ObjectCannedACL;
    file: Express.Multer.File;
    }): Promise<string> => {
    const command = new PutObjectCommand({
    Bucket,
    Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${
        file.originalname
    }`,
    ACL,
    Body:
        storageApproach === storageEnum.memory
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
    });
    await this.s3Client.send(command);
    if (!command.input?.Key) {
    throw new BadRequestException("fail to generate upload key");
    }
    return command.input.Key;
};

    uploadFiles = async ({
    storageApproach = storageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = "general",
    ACL = "private",
    files,
    useLarge = false,
    }: {
    storageApproach?: storageEnum;
    Bucket?: string;
    path?: string;
    ACL?: ObjectCannedACL;
    files: Express.Multer.File[];
    useLarge?: boolean;
    }): Promise<string[]> => {
        let urls: string[] = [];
        if (useLarge) {
            urls = await Promise.all(
                    files.map((file) => {
            return this.uploadLargeFile({
                storageApproach,
                Bucket,
                path,
                ACL,
                file,
        });
        })
    );
    return urls;
    } else {
    urls = await Promise.all(
        files.map((file) => {
        return this.uploadFile({
            storageApproach,
            Bucket,
            path,
            ACL,
            file,
        });
        })
    );
    return urls;
    }
};
    uploadLargeFile = async ({
        storageApproach = storageEnum.disk,
        Bucket = process.env.AWS_BUCKET_NAME,
        path = "general",
        ACL = "private",
        file,
    }: {
        storageApproach?: storageEnum;
        Bucket?: string;
        path?: string;
        ACL?: ObjectCannedACL;
        file: Express.Multer.File;
}): Promise<string> => {
    const upload = new Upload({
    client: this.s3Client,
    params: {
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${
        file.originalname
        }`,
        Body:
        storageApproach === storageEnum.memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
    },
    partSize: 5 * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (Progress) => {
    console.log("upload file progress is:: ", Progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
    throw new BadRequestException("fail to upload key");
}
    return Key;
};

    createPreSignUploadUrl = async ({
    s3Client,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = "general",
    ContentType,
    originalname,
    expiresIn = Number(process.env.AWS_PRE_SIGN_URL_EXPIRES_IN) || 60,
}: PreSignParams): Promise<{ url: string; Key: string }> => {
    const Key = `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${originalname}`;

    const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    if (!url) {
    throw new BadRequestException("Failed to generate presigned URL");
    }

    return { url, Key };
};

    createGetPreSignUploadUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    expiresIn = Number(process.env.AWS_PRE_SIGN_URL_EXPIRES_IN),
    downloadName = "dummy",
    download = "false",
    }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    downloadName?: string;
    download?: string;
    }): Promise<string> => {
        if (!Key) {
    throw new BadRequestException("Key is required");
    }

    const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition:
        download === "true"
        ? `attachment; filename="${downloadName || Key.split("/").pop()}"`
        : undefined,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    return url;
};

    getFile = async ({
        Bucket = process.env.AWS_BUCKET_NAME,
        Key,
    }: {
  Bucket?: string;
  Key: string;
    }): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
    Bucket,
    Key,
  });
  return await this.s3Client.send(command);
};

 deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  return await this.s3Client.send(command);
};
 DeleteFiles =  ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}): Promise<DeleteObjectsCommandOutput> => {
  const Objects = urls.map((url) => {
    return { Key: url };
  });
  console.log(Objects);

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });
  return this.s3Client.send(command);
};

deleteListFolderByPrefix = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path,
  Quiet = false,
}: {
  Bucket?: string;
  path: string;
  Quiet?: boolean;
}): Promise<DeleteObjectsCommandOutput> => {
  const fileList = await this.listDirectoryFiles({ Bucket, path });

  if (!fileList?.Contents?.length) {
    if (!Quiet) console.warn(`⚠️ Directory '${path}' is empty.`);
    throw new BadRequestException("empty directory");
  }

  const urls: string[] = fileList.Contents.map((file) => file.Key as string);
  if (!Quiet) console.log(`🗑️ Deleting ${urls.length} files from '${path}'...`);

  return await this.DeleteFiles({ urls });
};


    listDirectoryFiles =  ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path,
}: {
  Bucket?: string;
  path: string;
}) => {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${process.env.APPLICATION_NAME}/${path}`,
  });
  return this.s3Client.send(command);
};

}